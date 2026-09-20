"""Cookie authentication, synchronizer CSRF, scope checks and durable rate limits."""
import hashlib
import hmac
import secrets
from datetime import timedelta, timezone
from dataclasses import dataclass
from fastapi import Depends, HTTPException, Request, Response
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from sqlalchemy import select, text
from sqlalchemy.orm import Session
from . import config
from .db import get_db, SessionLocal
from .models import AuthSession, User, RateBucket, now

hasher = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
_DUMMY_HASH = hasher.hash("this-is-not-an-account-password")
COOKIE = "kutumb_session"

def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()

def password_hash(value):
    return hasher.hash(value)

def password_matches(value, hashed):
    try:
        return hasher.verify(hashed or _DUMMY_HASH, value)
    except (VerifyMismatchError, InvalidHashError):
        return False

def utc(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value

def origin_check(request):
    origin = request.headers.get("origin")
    if origin and origin not in config.ALLOWED_ORIGINS:
        raise HTTPException(403, "Request origin is not allowed")
    if request.headers.get("sec-fetch-site") == "cross-site":
        raise HTTPException(403, "Cross-site requests are not allowed")

def rate_limit(request: Request, action: str, identity: str = "", limit: int = 40, window: int = 300):
    """Short independent transaction, so failed requests still consume quota.

    PostgreSQL advisory transaction lock serializes bucket creation across workers.
    Forwarded headers are deliberately ignored; trusted reverse proxy is a deploy gate.
    """
    address = request.client.host if request.client else "local"
    key = digest(f"{action}:{address}:{identity}")
    with SessionLocal.begin() as db:
        if db.bind.dialect.name == "postgresql":
            db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": int(key[:15], 16)})
        row = db.get(RateBucket, key)
        current = now()
        if row is None:
            row = RateBucket(key=key, window_start=current, count=0)
            db.add(row)
        elif current - utc(row.window_start) >= timedelta(seconds=window):
            row.window_start, row.count = current, 0
        if row.count >= limit:
            raise HTTPException(429, "Too many attempts. Wait a few minutes and try again.", headers={"Retry-After": str(window)})
        row.count += 1

def user_dict(user):
    return {k: getattr(user, k) for k in ("id", "email", "display_name", "role", "district", "person_id", "language")}

def create_session(db, user, response):
    token, csrf = secrets.token_urlsafe(48), secrets.token_urlsafe(32)
    db.add(AuthSession(id=digest(token), user_id=user.id, csrf_hash=digest(csrf), csrf_token=csrf, expires_at=now() + timedelta(hours=config.SESSION_HOURS)))
    response.set_cookie(COOKIE, token, max_age=config.SESSION_HOURS * 3600, httponly=True, secure=config.COOKIE_SECURE, samesite="lax", path="/api/v1")
    return {"user": user_dict(user), "csrf_token": csrf}

@dataclass
class Auth:
    user: User
    session: AuthSession

def authenticated(request: Request, db: Session = Depends(get_db, scope="function")) -> Auth:
    if not config.DEMO_MODE:
        raise HTTPException(503, "Approved authentication and session migration must be configured before live operation")
    token = request.cookies.get(COOKIE, "")
    session = db.get(AuthSession, digest(token)) if token else None
    if session is None or session.revoked or utc(session.expires_at) <= now():
        raise HTTPException(401, "Sign in to continue")
    user = db.get(User, session.user_id)
    if not user or not user.active:
        raise HTTPException(401, "Account is not active")
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        origin_check(request)
        csrf = request.headers.get("x-csrf-token", "")
        if not csrf or not hmac.compare_digest(digest(csrf), session.csrf_hash):
            raise HTTPException(403, "Security token is missing or expired. Reload and try again.")
    return Auth(user, session)

def require_role(auth, *roles):
    if auth.user.role not in roles:
        raise HTTPException(403, "This action is not allowed for your role")
    return auth.user

def jurisdiction(user, district):
    return user.role == "admin" or (user.district is not None and user.district == district)
