"""Same-origin HTTP application. All state and authority are server-side."""
import hashlib
import hmac
import json
import re
import secrets
from datetime import date, timedelta
from pathlib import Path
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response, Query, Header, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import select, func, text, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from . import config, models as m, schemas as s, services as v
from .db import get_db
from .identity import provider
from .security import Auth, authenticated, require_role, jurisdiction, password_hash, password_matches, create_session, user_dict, rate_limit, origin_check, digest, utc, COOKIE

app = FastAPI(title="Gujarat Kutumb Setu API", version="1.0.0", description="Synthetic local registry and authorized service integration. No live government identity, source data or payment connection.", docs_url=None, redoc_url=None, openapi_url="/api/v1/openapi.json")
router = APIRouter(prefix="/api/v1")

@app.middleware("http")
async def secure_headers(request: Request, call_next):
    length = request.headers.get("content-length")
    if length and (not length.isdigit() or int(length) > config.MAX_UPLOAD_BYTES + 100000):
        return JSONResponse({"detail": "Request is too large"}, status_code=413)
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    response.headers["X-Request-ID"] = secrets.token_hex(12)
    return response

@app.exception_handler(IntegrityError)
async def integrity_error(request, error):
    return JSONResponse({"detail": "This request conflicts with an existing or concurrently updated record. Refresh and try again.", "code": "record_conflict"}, status_code=409)

@app.exception_handler(RequestValidationError)
async def validation_error(request, error):
    # Do not echo passwords, OTPs, draft contents or uploaded document bytes.
    return JSONResponse({"detail": [{"loc": list(item["loc"]), "msg": item["msg"], "type": item["type"]} for item in error.errors()]}, status_code=422)

@router.get("/health", tags=["public"])
def health(db: Session = Depends(get_db, scope="function")):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected", "mode": "synthetic_demo" if config.DEMO_MODE else "restricted"}

@router.get("/public/config", tags=["public"])
def public_config():
    return {"name": "Gujarat Kutumb Setu", "name_gu": "ગુજરાત કુટુંબ સેતુ", "mode": "synthetic_demo" if config.DEMO_MODE else "restricted", "languages": ["gu", "en"], "districts": sorted(config.SUPPORTED_DISTRICTS), "features": {"enrollment": True, "assisted_enrollment": True, "changes": ["address", "name", "add_member", "death", "representative"], "passbook": True, "grievances": True, "government_integrations": False, "identity_provider": config.IDENTITY_PROVIDER, "payments": "simulated"}, "notices": ["Testing environment: use synthetic information only. Government identity, source verification and payment adapters are not live.", "Family identity registration does not establish scheme eligibility, ration entitlement or citizenship."], "centres": [{"name": "Ahmedabad assisted-service testing desk", "district": "Ahmedabad", "address": "Synthetic demonstration location — no physical public counter", "hours": "Testing only"}], "policy_version": config.POLICY_VERSION, "fee_note": "No fee is collected in this testing environment. Live charges require a published government fee schedule.", "service_note": "Submission, verification, approval and registry implementation are separate tracked steps. No government processing deadline is claimed."}

@router.get("/auth/demo-accounts", tags=["authentication"])
def demo_accounts(db: Session = Depends(get_db, scope="function")):
    if not config.DEMO_MODE:
        raise HTTPException(404, "Not found")
    users = db.scalars(select(m.User).where(m.User.email.like("%@demo.local")).order_by(m.User.email)).all()
    mobile_map = {"resident@demo.local": "9000000001", "new.resident@demo.local": "9000000002", "other.resident@demo.local": "9000000003", "pending.resident@demo.local": "9000000004"}
    items = []
    for user in users:
        family = v.family_for_user(db, user)
        items.append({**v.plain(user, "email display_name role"), "mobile": mobile_map.get(user.email), "family_id": family.public_id if family else None})
    return {"items": items, "password": "DemoPass@123!", "otp": "123456", "notice": "Synthetic fixtures for this testing environment only"}

@router.post("/auth/login", tags=["authentication"])
def login(values: s.Login, request: Request, response: Response, db: Session = Depends(get_db, scope="function")):
    origin_check(request)
    rate_limit(request, "login-ip", limit=80)
    rate_limit(request, "login-account", values.email, limit=15)
    user = db.scalar(select(m.User).where(m.User.email == values.email, m.User.active.is_(True)))
    valid = password_matches(values.password, user.password_hash if user else None)
    if not user or not valid:
        raise HTTPException(401, "Email or password was not accepted")
    if not config.DEMO_MODE:
        raise HTTPException(503, "Approved staff authentication provider is not configured")
    v.audit(db, user, "session.login", "user", user.id, "Account authentication", user.id)
    return create_session(db, user, response)

@router.post("/auth/register", status_code=201, tags=["authentication"])
def register(values: s.Register, request: Request, response: Response, db: Session = Depends(get_db, scope="function")):
    if not config.DEMO_MODE:
        raise HTTPException(404, "Not found")
    origin_check(request)
    rate_limit(request, "register", limit=20)
    if db.scalar(select(m.User.id).where(m.User.email == values.email)):
        raise HTTPException(409, "This account cannot be registered. Sign in or use assisted recovery.")
    user = m.User(email=values.email, password_hash=password_hash(values.password), display_name=values.display_name, language=values.language, role="resident")
    db.add(user)
    db.flush()
    v.audit(db, user, "account.created", "user", user.id, "Synthetic account registration", user.id)
    return create_session(db, user, response)

@router.post("/auth/challenges", tags=["authentication"])
def create_challenge(values: s.ChallengeCreate, request: Request, db: Session = Depends(get_db, scope="function")):
    origin_check(request)
    identity_provider = provider()
    identifier = values.identifier.strip().upper()
    is_mobile = bool(re.fullmatch(r"[6-9][0-9]{9}", identifier))
    if not is_mobile and not re.fullmatch(r"GKS-[A-Z0-9-]{3,35}", identifier):
        raise HTTPException(422, "Enter a ten digit mobile number or your Family ID")
    if values.purpose == "register" and not is_mobile:
        raise HTTPException(422, "Register using a contact mobile number; existing Family IDs use sign in")
    rate_limit(request, "challenge-ip", limit=40)
    rate_limit(request, "challenge-identifier", identifier, limit=5)
    identifier_hash = digest(identifier)
    last = db.scalar(select(m.AuthChallenge).where(m.AuthChallenge.identifier_hash == identifier_hash).order_by(m.AuthChallenge.created_at.desc()).limit(1))
    if last and (m.now() - utc(last.created_at)).total_seconds() < identity_provider.resend_after:
        raise HTTPException(429, "Wait before requesting another code", headers={"Retry-After": str(identity_provider.resend_after)})
    bound = db.scalar(select(m.AuthIdentifier).where(m.AuthIdentifier.identifier_hash == identifier_hash))
    destination = f"******{identifier[-4:]}" if is_mobile else (bound.masked_destination if bound else "registered contact")
    challenge_id = m.uid()
    challenge = m.AuthChallenge(id=challenge_id, user_id=bound.user_id if bound else None, identifier_hash=identifier_hash, identifier_type="mobile" if is_mobile else "family_id", masked_destination=destination, purpose=values.purpose, display_name=values.display_name or "New resident", language=values.language, code_hash=digest(f"{challenge_id}:{identity_provider.issue_code()}"), expires_at=m.now() + timedelta(seconds=identity_provider.expires_in))
    # Invalidate earlier unconsumed challenges for the same credential.
    for old in db.scalars(select(m.AuthChallenge).where(m.AuthChallenge.identifier_hash == identifier_hash, m.AuthChallenge.consumed.is_(False))).all():
        old.consumed = True
    db.add(challenge)
    return {"challenge_id": challenge_id, "masked_destination": destination, "expires_in": identity_provider.expires_in, "resend_after": identity_provider.resend_after, "delivery_mode": identity_provider.delivery_mode}

@router.post("/auth/verify", tags=["authentication"])
def verify_challenge(values: s.ChallengeVerify, request: Request, response: Response, db: Session = Depends(get_db, scope="function")):
    origin_check(request)
    provider()
    rate_limit(request, "otp-verify", limit=60)
    challenge = db.scalar(select(m.AuthChallenge).where(m.AuthChallenge.id == values.challenge_id).with_for_update())
    if not challenge or challenge.consumed or challenge.attempts >= 5 or utc(challenge.expires_at) <= m.now():
        raise HTTPException(401, "This code is unavailable or expired. Request a new code.")
    challenge.attempts += 1
    correct = hmac.compare_digest(challenge.code_hash, digest(f"{challenge.id}:{values.code}"))
    if not correct:
        db.commit()  # Attempts persist even though this request is rejected.
        raise HTTPException(401, "The code was not accepted")
    user = db.get(m.User, challenge.user_id) if challenge.user_id else None
    if not user and challenge.purpose == "register" and challenge.identifier_type == "mobile":
        existing = db.scalar(select(m.AuthIdentifier).where(m.AuthIdentifier.identifier_hash == challenge.identifier_hash))
        if existing:
            user = db.get(m.User, existing.user_id)
        else:
            user = m.User(email=f"resident-{m.uid()}@synthetic.local", password_hash=password_hash(secrets.token_urlsafe(40)), display_name=challenge.display_name, language=challenge.language, role="resident")
            db.add(user)
            db.flush()
            db.add(m.AuthIdentifier(user_id=user.id, identifier_hash=challenge.identifier_hash, identifier_type="mobile", masked_destination=challenge.masked_destination))
    challenge.consumed = True
    if not user or not user.active:
        db.commit()
        raise HTTPException(401, "The account could not be verified. Use registration or assisted recovery.")
    v.audit(db, user, "session.otp_verified", "user", user.id, "Account control through simulated identity delivery; not government identity proof", user.id)
    return create_session(db, user, response)

@router.get("/auth/me", tags=["authentication"])
def me(auth: Auth = Depends(authenticated)):
    return {"user": user_dict(auth.user), "csrf_token": auth.session.csrf_token}

@router.post("/auth/logout", tags=["authentication"])
def logout(response: Response, auth: Auth = Depends(authenticated)):
    auth.session.revoked = True
    response.delete_cookie(COOKIE, path="/api/v1", httponly=True, samesite="lax", secure=config.COOKIE_SECURE)
    return {"ok": True}

@router.get("/public/content/{slug}", tags=["public"])
def content(slug: str, db: Session = Depends(get_db, scope="function")):
    row = db.get(m.Content, slug)
    if not row:
        raise HTTPException(404, "Page not found")
    return v.plain(row, "slug title title_gu body body_gu revision updated_at")

@router.get("/schemes", tags=["public"])
def schemes(q: str = Query(default="", max_length=100), category: str = Query(default="", max_length=60), page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db, scope="function")):
    query = select(m.Scheme).where(m.Scheme.status == "published")
    if q:
        query = query.where(or_(m.Scheme.name.icontains(q, autoescape=True), m.Scheme.name_gu.icontains(q, autoescape=True), m.Scheme.summary.icontains(q, autoescape=True)))
    if category:
        query = query.where(m.Scheme.category == category)
    return v.page(db, query.order_by(m.Scheme.name), v.scheme_dict, page, page_size)

@router.get("/schemes/{slug}", tags=["public"])
def scheme_detail(slug: str, db: Session = Depends(get_db, scope="function")):
    row = db.scalar(select(m.Scheme).where(m.Scheme.slug == slug, m.Scheme.status == "published"))
    if not row:
        raise HTTPException(404, "Scheme not found")
    return v.scheme_dict(row)

@router.get("/dashboard", tags=["resident"])
def dashboard(auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = auth.user
    family = v.family_for_user(db, user)
    applications = db.scalars(select(m.Application).where(m.Application.owner_id == user.id).order_by(m.Application.updated_at.desc()).limit(10)).all()
    notifications = db.scalars(select(m.Notification).where(m.Notification.user_id == user.id).order_by(m.Notification.created_at.desc()).limit(10)).all()
    return {"user": user_dict(user), "family": v.family_dict(db, family, user) if family else None, "applications": [v.app_dict(db, row, False) for row in applications], "notifications": [v.plain(row, "id title message link read created_at") for row in notifications], "counts": {"applications": db.scalar(select(func.count()).select_from(m.Application).where(m.Application.owner_id == user.id)), "unread_notifications": db.scalar(select(func.count()).select_from(m.Notification).where(m.Notification.user_id == user.id, m.Notification.read.is_(False))), "scheme_referrals": db.scalar(select(func.count()).select_from(m.SchemeApplication).where(m.SchemeApplication.owner_id == user.id))}}

@router.get("/applications", tags=["applications"])
def applications(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    from sqlalchemy import and_
    visibility = m.Application.owner_id == auth.user.id
    if auth.user.role == "operator":
        visibility = or_(visibility, and_(m.Application.submitted_by == auth.user.id, m.Application.district == auth.user.district))
    query = select(m.Application).where(visibility).order_by(m.Application.updated_at.desc())
    return v.page(db, query, lambda row: v.app_dict(db, row, False), page, page_size)

@router.post("/applications", status_code=201, tags=["applications"])
def create_application(values: s.ApplicationCreate, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "resident", "operator")
    v.require_district(values.district)
    v.validate_draft(values.payload)
    owner = user
    if user.role == "operator":
        if not jurisdiction(user, values.district) or not values.owner_email or not values.assisted_authority or len(values.assisted_authority.strip()) < 10:
            raise HTTPException(422, "Assisted applications require an authorized resident account, recorded authority and your assigned district")
        owner = db.scalar(select(m.User).where(m.User.email == values.owner_email.lower(), m.User.role == "resident", m.User.active.is_(True)))
        if not owner:
            raise HTTPException(404, "Resident account not found")
    elif values.owner_email or values.assisted_authority:
        raise HTTPException(403, "Residents cannot create another adult's application")
    if v.family_for_user(db, owner):
        raise HTTPException(409, "This account already has a family. Use a change request.")
    row = m.Application(owner_id=owner.id, submitted_by=user.id, kind=values.kind, branch=values.branch, district=values.district, payload=values.payload, step=values.step, channel="assisted" if user.role == "operator" else "self_service")
    db.add(row)
    db.flush()
    v.audit(db, user, "application.draft_created", "application", row.id, values.assisted_authority or "Resident enrollment draft", owner.id)
    return v.app_dict(db, row)

@router.get("/applications/track", tags=["applications"])
def track_application(request: Request, reference: str = Query(min_length=3, max_length=40), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    # Exact lookup is independent of list pagination and never a public search.
    rate_limit(request, "application-track", auth.user.id, limit=60)
    row = db.scalar(select(m.Application).where(m.Application.reference == reference.strip()))
    if not row:
        raise HTTPException(404, "Application not found")
    row = v.application_access(db, row.id, auth.user, owner_only=True)
    v.audit(db, auth.user, "application.tracked", "application", row.id, "Owner-authorized exact reference tracking", row.owner_id)
    return v.app_dict(db, row)

@router.get("/applications/{application_id}", tags=["applications"])
def application_detail(application_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    row = v.application_access(db, application_id, auth.user)
    v.audit(db, auth.user, "application.viewed", "application", row.id, "Authorized application review", row.owner_id)
    return v.app_dict(db, row)

@router.patch("/applications/{application_id}", tags=["applications"])
def patch_application(application_id: str, values: s.ApplicationPatch, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    row = v.application_access(db, application_id, auth.user, lock=True, owner_only=True)
    v.require_revision(row, values.revision)
    if row.status not in v.EDITABLE:
        raise HTTPException(409, "Only drafts or requested information may be edited")
    v.validate_draft(values.payload)
    if values.district:
        v.require_district(values.district)
        if auth.user.role == "operator" and not jurisdiction(auth.user, values.district):
            raise HTTPException(403, "District is outside your assigned jurisdiction")
        row.district = values.district
    row.payload, row.step = values.payload, values.step
    row.revision += 1
    row.updated_at = m.now()
    v.audit(db, auth.user, "application.draft_saved", "application", row.id, "Resident-controlled draft update", row.owner_id, {"revision": row.revision})
    db.flush()
    return v.app_dict(db, row)

@router.post("/applications/{application_id}/submit", tags=["applications"])
def submit(application_id: str, values: s.Revision, idempotency_key: str | None = Header(None), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    def perform():
        row = v.application_access(db, application_id, auth.user, lock=True, owner_only=True)
        return v.submit_application(db, row, auth.user, values.revision)
    return v.idempotent(db, auth.user.id, f"application.submit:{application_id}", idempotency_key, values.model_dump(), perform, authorize=lambda: v.application_access(db, application_id, auth.user, lock=True, owner_only=True))

@router.post("/applications/{application_id}/withdraw", tags=["applications"])
def withdraw(application_id: str, values: s.Reason, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    row = v.application_access(db, application_id, auth.user, lock=True, owner_only=True)
    v.require_revision(row, values.revision)
    if row.status not in v.WITHDRAWABLE:
        raise HTTPException(409, "This application can no longer be withdrawn")
    v.transition(db, row, auth.user, "withdrawn", "withdraw", values.reason)
    return v.app_dict(db, row)

@router.post("/applications/{application_id}/appeal", tags=["applications"])
def appeal(application_id: str, values: s.Reason, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    row = v.application_access(db, application_id, auth.user, lock=True, owner_only=True)
    v.require_revision(row, values.revision)
    if row.status != "rejected":
        raise HTTPException(409, "Only a rejected application can be appealed")
    v.transition(db, row, auth.user, "appealed", "appeal", values.reason)
    return v.app_dict(db, row)

@router.get("/applications/{application_id}/receipt", tags=["applications"])
def receipt(application_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    row = v.application_access(db, application_id, auth.user)
    if not row.reference:
        raise HTTPException(409, "Submit the application to receive a tracking receipt")
    return {"application": v.app_dict(db, row), "issued_at": m.now(), "notice": "Acknowledgment of receipt, not proof of eligibility or a permanent identity award. Synthetic local testing transaction."}

@router.get("/families/mine", tags=["registry"])
def my_family(auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    family = v.family_for_user(db, auth.user)
    if not family:
        raise HTTPException(404, "No family is linked to this account")
    v.audit(db, auth.user, "family.viewed", "family", family.id, "Resident views own family", auth.user.id)
    return v.family_dict(db, family, auth.user)

@router.get("/families/{family_id}", tags=["registry"])
def family_detail(family_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    family = v.family_authorized(db, family_id, auth.user)
    v.audit(db, auth.user, "family.viewed", "family", family.id, "Resident views own family", auth.user.id)
    return v.family_dict(db, family, auth.user)

@router.post("/registry/check", tags=["registry"])
def registry_check(values: s.RegistryCheck, request: Request, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    rate_limit(request, "registry-check", auth.user.id, limit=20)
    family = v.family_for_user(db, auth.user)
    if family and values.reference.upper() == family.public_id:
        return {"result": "existing", "family_id": family.id, "message": "This is your linked family record."}
    # Deliberately identical for another person's reference and an unknown reference.
    return {"result": "review_required", "message": "No authorized match can be shown. Ration verification is not connected in this environment; continue without a ration card or request assistance."}

@router.post("/changes", status_code=201, tags=["registry"])
def create_change(values: s.ChangeCreate, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "resident")
    family = v.family_authorized(db, values.family_id, user, lock=True)
    v.validate_draft(values.payload)
    row = m.Application(owner_id=user.id, submitted_by=user.id, kind=values.change_type, branch="registry", district=family.district, payload=values.payload, family_id=family.id, family_revision=family.revision)
    db.add(row)
    db.flush()
    v.validate_change(db, row, user)
    v.audit(db, user, "change.draft_created", "application", row.id, "Resident-controlled change request", user.id, {"change_type": row.kind})
    return v.app_dict(db, row)

@router.get("/applications/{application_id}/evidence", tags=["evidence"])
def list_evidence(application_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    v.application_access(db, application_id, auth.user)
    return v.page(db, select(m.Evidence).where(m.Evidence.application_id == application_id).order_by(m.Evidence.created_at), lambda row: v.plain(row, "id evidence_type filename media_type size status created_at"), 1, 100)

@router.post("/applications/{application_id}/evidence", status_code=201, tags=["evidence"])
async def upload_evidence(application_id: str, file: UploadFile = File(...), evidence_type: str = Form(..., min_length=2, max_length=60), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    if not config.DEMO_MODE:
        raise HTTPException(503, "Document ingestion is disabled until an approved scanner is configured")
    row = v.application_access(db, application_id, auth.user, lock=True, owner_only=True)
    if row.status not in v.EDITABLE:
        raise HTTPException(409, "Evidence may be added only to a draft or information response")
    if db.scalar(select(func.count()).select_from(m.Evidence).where(m.Evidence.application_id == application_id)) >= 10:
        raise HTTPException(422, "Maximum ten evidence files per application")
    data = await file.read(config.MAX_UPLOAD_BYTES + 1)
    if len(data) > config.MAX_UPLOAD_BYTES or not data:
        raise HTTPException(413, "Upload a non-empty file no larger than 5 MiB")
    media = "application/pdf" if data.startswith(b"%PDF-") else "image/png" if data.startswith(b"\x89PNG\r\n\x1a\n") else "image/jpeg" if data.startswith(b"\xff\xd8\xff") else None
    suffix = {"application/pdf": ".pdf", "image/png": ".png", "image/jpeg": ".jpg"}.get(media)
    filename = Path(file.filename or "evidence").name
    if not suffix or file.content_type != media or Path(filename).suffix.lower() not in {suffix, ".jpeg" if media == "image/jpeg" else suffix}:
        raise HTTPException(422, "Only matching PDF, PNG and JPEG file signatures, types and extensions are accepted")
    filename = re.sub(r"[^\w. -]", "_", filename)[:180]
    storage_key = f"{m.uid()}{suffix}"
    config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True, mode=0o700)
    target = config.UPLOAD_DIR / storage_key
    with target.open("xb") as stream:
        stream.write(data)
    target.chmod(0o600)
    evidence = m.Evidence(application_id=row.id, owner_id=auth.user.id, evidence_type=evidence_type, filename=filename, media_type=media, size=len(data), sha256=hashlib.sha256(data).hexdigest(), storage_key=storage_key)
    db.add(evidence)
    db.flush()
    row.revision += 1
    v.audit(db, auth.user, "evidence.quarantined", "evidence", evidence.id, "Synthetic evidence upload; not malware-certified", row.owner_id)
    return {**v.plain(evidence, "id evidence_type filename media_type size status created_at"), "application_revision": row.revision, "notice": "Quarantined. Signature validation is not a malware safety certificate; no document content is executed or previewed."}

@router.get("/evidence/{evidence_id}/download", tags=["evidence"])
def download_evidence(evidence_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    row = db.get(m.Evidence, evidence_id)
    if not row:
        raise HTTPException(404, "Evidence not found")
    application = v.application_access(db, row.application_id, auth.user)
    # Never release a quarantined document merely because its magic bytes match.
    if row.status != "released":
        raise HTTPException(423, "This file is quarantined. An approved malware scanner and evidence review adapter are required before download.")
    path = config.UPLOAD_DIR / row.storage_key
    if path.parent.resolve() != config.UPLOAD_DIR.resolve() or not path.is_file():
        raise HTTPException(404, "Evidence content unavailable")
    v.audit(db, auth.user, "evidence.downloaded", "evidence", row.id, "Authorized evidence review", application.owner_id)
    return FileResponse(path, media_type="application/octet-stream", filename=row.filename, headers={"Content-Disposition": f'attachment; filename="{row.filename}"'})

@router.get("/staff/applications", tags=["staff"])
def staff_applications(status: str = Query("", max_length=30), q: str = Query("", max_length=100), page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "verifier", "approver", "admin")
    query = select(m.Application).where(m.Application.status != "draft")
    if user.role != "admin":
        query = query.where(m.Application.district == user.district)
    if status:
        query = query.where(m.Application.status == status)
    if q:
        query = query.where(m.Application.reference.icontains(q, autoescape=True))
    return v.page(db, query.order_by(m.Application.submitted_at), lambda row: v.app_dict(db, row, False), page, page_size)

@router.post("/staff/applications/{application_id}/action", tags=["staff"])
def staff_action(application_id: str, values: s.ReviewAction, idempotency_key: str | None = Header(None), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "verifier", "approver")
    def perform():
        row = v.application_access(db, application_id, user, lock=True)
        return v.review(db, row, user, values)
    return v.idempotent(db, user.id, f"application.review:{application_id}", idempotency_key, values.model_dump(), perform, authorize=lambda: v.review_authorized(db, application_id, user, values.action))

@router.get("/staff/reports", tags=["staff"])
def staff_reports(auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "verifier", "approver", "admin")
    query = select(m.Application.status, func.count(m.Application.id)).where(m.Application.status != "draft").group_by(m.Application.status)
    if user.role != "admin":
        query = query.where(m.Application.district == user.district)
    return {"counts": dict(db.execute(query).all()), "district": user.district if user.role != "admin" else "All authorized districts", "as_of": m.now(), "notice": "Synthetic administrative cases, not population or census totals. Queue counts are operational and access-controlled."}

@router.get("/notifications", tags=["resident"])
def notifications(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    return v.page(db, select(m.Notification).where(m.Notification.user_id == auth.user.id).order_by(m.Notification.created_at.desc()), lambda row: v.plain(row, "id title message link read created_at"), page, page_size)

@router.post("/notifications/{notification_id}/read", tags=["resident"])
def read_notification(notification_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    row = db.get(m.Notification, notification_id)
    if not row or row.user_id != auth.user.id:
        raise HTTPException(404, "Notification not found")
    row.read = True
    return {"ok": True}

@router.get("/access-history", tags=["resident"])
def access_history(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    return v.page(db, select(m.Audit).where(m.Audit.subject_user_id == auth.user.id).order_by(m.Audit.created_at.desc()), lambda row: v.plain(row, "id action actor_role entity_type purpose created_at"), page, page_size)

def grievance_access(db, grievance_id, user):
    row = db.get(m.Grievance, grievance_id)
    if not row or not (row.owner_id == user.id or (user.role in v.STAFF and jurisdiction(user, row.district))):
        raise HTTPException(404, "Grievance not found")
    if row.category in {"staff_conduct", "privacy"} and row.owner_id != user.id and user.role != "admin":
        raise HTTPException(404, "Grievance not found")
    return row

@router.get("/grievances", tags=["grievances"])
def grievances(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = auth.user
    query = select(m.Grievance)
    if user.role in v.STAFF:
        if user.role != "admin":
            query = query.where(m.Grievance.district == user.district, or_(m.Grievance.category.not_in(["staff_conduct", "privacy"]), m.Grievance.owner_id == user.id))
    else:
        query = query.where(m.Grievance.owner_id == user.id)
    return v.page(db, query.order_by(m.Grievance.updated_at.desc()), v.grievance_dict, page, page_size)

@router.post("/grievances", status_code=201, tags=["grievances"])
def create_grievance(values: s.GrievanceCreate, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    district = auth.user.district or "Ahmedabad"
    if values.application_id:
        application = v.application_access(db, values.application_id, auth.user, owner_only=True)
        district = application.district
    row = m.Grievance(owner_id=auth.user.id, reference=v.opaque_public("GRV"), district=district, **values.model_dump())
    db.add(row)
    db.flush()
    v.audit(db, auth.user, "grievance.received", "grievance", row.id, "Resident grievance recorded", auth.user.id)
    v.notify(db, auth.user.id, "Grievance received", "Your grievance has been recorded. Track the response in your account.", f"/grievances/{row.id}")
    return v.grievance_dict(row)

@router.get("/grievances/{grievance_id}", tags=["grievances"])
def grievance_detail(grievance_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    return v.grievance_dict(grievance_access(db, grievance_id, auth.user))

@router.post("/staff/grievances/{grievance_id}/action", tags=["grievances"])
def grievance_action(grievance_id: str, values: s.GrievanceAction, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "verifier", "approver", "admin")
    row = grievance_access(db, grievance_id, user)
    db.refresh(row, with_for_update=True)
    if row.owner_id == user.id:
        raise HTTPException(403, "You cannot resolve your own grievance")
    if row.category in {"staff_conduct", "privacy"} and user.role != "admin":
        raise HTTPException(403, "Staff conduct and privacy complaints require independent administration review")
    transitions = {"received": {"in_review"}, "in_review": {"resolved"}, "resolved": {"reopened"}, "reopened": {"in_review", "resolved"}}
    if values.status not in transitions.get(row.status, set()):
        raise HTTPException(409, "Grievance must follow received, in review, resolved or reopened stages")
    row.history = row.history + [{"from_status": row.status, "to_status": values.status, "response": values.response, "actor_role": user.role, "created_at": m.now().isoformat()}]
    row.status, row.response = values.status, values.response
    row.revision += 1
    v.audit(db, user, "grievance.updated", "grievance", row.id, "Authorized grievance response", row.owner_id, {"status": row.status})
    v.notify(db, row.owner_id, "Grievance response available", "Sign in to read the official case response.", f"/grievances/{row.id}")
    db.flush()
    return v.grievance_dict(row)

@router.get("/benefits", tags=["schemes"])
def benefits(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    ids = v.authorized_person_ids(db, auth.user)
    return v.page(db, select(m.Benefit).where(m.Benefit.person_id.in_(ids)).order_by(m.Benefit.event_date.desc()), lambda row: v.benefit_dict(db, row), page, page_size)

@router.get("/recommendations", tags=["schemes"])
def recommendations(auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    rows = db.scalars(select(m.Scheme).where(m.Scheme.status == "published").order_by(m.Scheme.name).limit(30)).all()
    items = [{"scheme": v.scheme_dict(row), "reason": "Browse current department guidance. No restricted personal facts were inferred.", "status": "may_be_relevant" if row.capability == "demo_connected" and auth.user.person_id else "more_information_needed", "notice": "Discovery only, not a decision or entitlement. The scheme-owning department decides eligibility."} for row in rows]
    return {"items": items, "total": len(items), "page": 1, "page_size": 30}

@router.post("/scheme-applications", status_code=201, tags=["schemes"])
def referral(values: s.ReferralCreate, idempotency_key: str | None = Header(None), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "resident")
    def authorize():
        # Account control does not permanently imply person/family authority.
        if not user.person_id or not v.family_for_user(db, user):
            raise HTTPException(409, "Complete family registration before sending this connected-service referral")
    def perform():
        if not user.person_id or not v.family_for_user(db, user):
            raise HTTPException(409, "Complete family registration before sending this connected-service referral")
        scheme = db.get(m.Scheme, values.scheme_id)
        if not scheme or scheme.status != "published":
            raise HTTPException(404, "Scheme not found")
        if scheme.capability != "demo_connected" or not config.DEMO_MODE:
            raise HTTPException(409, "This scheme is not a connected application service; use the official external channel")
        if db.scalar(select(m.SchemeApplication).where(m.SchemeApplication.owner_id == user.id, m.SchemeApplication.scheme_id == scheme.id)):
            raise HTTPException(409, "You already have a referral for this scheme")
        row = m.SchemeApplication(reference=v.opaque_public("REF"), owner_id=user.id, person_id=user.person_id, scheme_id=scheme.id)
        db.add(row)
        db.flush()
        v.audit(db, user, "scheme.referred", "scheme_application", row.id, "Resident consented synthetic referral", user.id)
        v.outbox(db, "scheme.referral_created", row.id, {"referral_id": row.id, "scheme_id": scheme.id, "mode": "synthetic"})
        v.notify(db, user.id, "Service referral recorded", "Your request was referred. A referral is not an award or payment.", "/scheme-applications")
        return v.plain(row, "id reference status scheme_id created_at")
    return v.idempotent(db, user.id, "scheme.referral", idempotency_key, values.model_dump(), perform, authorize=authorize)

@router.get("/scheme-applications", tags=["schemes"])
def referrals(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    return v.page(db, select(m.SchemeApplication).where(m.SchemeApplication.owner_id == auth.user.id).order_by(m.SchemeApplication.created_at.desc()), lambda row: {**v.plain(row, "id reference status scheme_id created_at"), "scheme_name": db.get(m.Scheme, row.scheme_id).name}, page, page_size)

@router.get("/admin/overview", tags=["administration"])
def admin_overview(auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    require_role(auth, "admin")
    counts = {name: db.scalar(select(func.count()).select_from(model)) for name, model in [("users", m.User), ("families", m.Family), ("persons", m.Person), ("applications", m.Application), ("grievances", m.Grievance), ("schemes", m.Scheme)]}
    events = db.scalars(select(m.Audit).order_by(m.Audit.created_at.desc()).limit(10)).all()
    outbox = dict(db.execute(select(m.Outbox.status, func.count(m.Outbox.id)).group_by(m.Outbox.status)).all())
    return {"counts": counts, "recent_audit": [v.plain(row, "id actor_role action entity_type purpose created_at") for row in events], "outbox": outbox, "integration_health": {"mode": "simulated", "live_sources": 0, "message": "Outbox delivery targets the durable local testing sink, not government systems"}, "as_of": m.now()}

@router.get("/admin/audit", tags=["administration"])
def admin_audit(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    require_role(auth, "admin")
    return v.page(db, select(m.Audit).order_by(m.Audit.created_at.desc()), lambda row: v.plain(row, "id actor_role action entity_type entity_id purpose detail event_hash created_at"), page, page_size)

@router.get("/admin/content", tags=["administration"])
def admin_content(auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    require_role(auth, "admin")
    return v.page(db, select(m.Content).order_by(m.Content.slug), lambda row: v.plain(row, "slug title title_gu body body_gu revision updated_at"), 1, 100)

@router.put("/admin/content/{slug}", tags=["administration"])
def update_content(slug: str, values: s.ContentUpdate, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "admin")
    row = db.scalar(select(m.Content).where(m.Content.slug == slug).with_for_update())
    if not row:
        raise HTTPException(404, "Content page not found")
    v.require_revision(row, values.revision)
    db.add(m.ContentVersion(slug=slug, revision=row.revision, snapshot=v.plain(row, "title title_gu body body_gu"), actor_id=user.id))
    for key, value in values.model_dump(exclude={"revision"}).items():
        setattr(row, key, value)
    row.revision += 1
    v.audit(db, user, "content.updated", "content", slug, "Bilingual content publishing", detail={"revision": row.revision})
    db.flush()
    return v.plain(row, "slug title title_gu body body_gu revision updated_at")

@router.get("/admin/schemes", tags=["administration"])
def admin_schemes(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    require_role(auth, "admin")
    return v.page(db, select(m.Scheme).order_by(m.Scheme.name), v.scheme_dict, page, page_size)

@router.post("/admin/schemes", status_code=201, tags=["administration"])
def create_scheme(values: s.SchemeCreate, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "admin")
    if values.capability == "demo_connected" and not config.DEMO_MODE:
        raise HTTPException(422, "Simulated schemes cannot be enabled outside testing")
    row = m.Scheme(**values.model_dump())
    db.add(row)
    db.flush()
    v.audit(db, user, "scheme.created", "scheme", row.id, "Controlled scheme catalogue administration")
    return v.scheme_dict(row)

@router.patch("/admin/schemes/{scheme_id}", tags=["administration"])
def patch_scheme(scheme_id: str, values: s.SchemePatch, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "admin")
    row = db.scalar(select(m.Scheme).where(m.Scheme.id == scheme_id).with_for_update())
    if not row:
        raise HTTPException(404, "Scheme not found")
    v.require_revision(row, values.revision)
    data = {name: getattr(row, name) for name in s.SchemeCreate.model_fields}
    data.update(values.model_dump(exclude_unset=True, exclude={"revision"}))
    validated = v.validate_model(s.SchemeCreate, data)
    if validated.capability != row.capability and db.scalar(select(m.SchemeApplication.id).where(m.SchemeApplication.scheme_id == row.id).limit(1)):
        raise HTTPException(409, "An active scheme connector cannot be retyped while referral history exists")
    for name, value in validated.model_dump().items():
        setattr(row, name, value)
    row.revision += 1
    v.audit(db, user, "scheme.updated", "scheme", row.id, "Versioned scheme catalogue change", detail={"revision": row.revision})
    db.flush()
    return v.scheme_dict(row)

@router.get("/departments/clients", tags=["integration administration"])
def clients(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "department", "admin")
    query = select(m.IntegrationClient)
    if user.role != "admin":
        query = query.where(m.IntegrationClient.owner_id == user.id)
    return v.page(db, query.order_by(m.IntegrationClient.created_at.desc()), v.client_dict, page, page_size)

@router.post("/departments/clients", status_code=201, tags=["integration administration"])
def create_client(values: s.ClientCreate, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "department")
    row = m.IntegrationClient(owner_id=user.id, district=user.district, **values.model_dump())
    db.add(row)
    db.flush()
    v.audit(db, user, "integration.requested", "integration_client", row.id, values.purpose)
    return v.client_dict(row)

@router.post("/admin/clients/{client_id}/approve", tags=["integration administration"])
def approve_client(client_id: str, values: s.ClientApproval = s.ClientApproval(), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "admin")
    row = db.scalar(select(m.IntegrationClient).where(m.IntegrationClient.id == client_id).with_for_update())
    if not row:
        raise HTTPException(404, "Integration request not found")
    if row.status != "pending":
        raise HTTPException(409, "Only pending clients can be approved")
    scopes = values.approved_scopes if values.approved_scopes is not None else row.requested_scopes
    if not scopes or not set(scopes).issubset(row.requested_scopes):
        raise HTTPException(422, "Approved scopes must be a non-empty subset of requested scopes")
    schemes = values.approved_scheme_ids
    if "benefits:write" in scopes and not schemes:
        schemes = list(db.scalars(select(m.Scheme.id).where(m.Scheme.capability == "demo_connected")).all())
    for scheme_id in schemes:
        scheme = db.get(m.Scheme, scheme_id)
        if not scheme or scheme.capability != "demo_connected":
            raise HTTPException(422, "Only explicitly selected synthetic scheme reporting is connected")
    token = f"gks_{secrets.token_urlsafe(40)}"
    row.approved_scopes, row.approved_scheme_ids = scopes, schemes
    row.credential_hash, row.status, row.expires_at = digest(token), "active", m.now() + timedelta(days=30)
    v.audit(db, user, "integration.approved", "integration_client", row.id, row.purpose, detail={"scopes": scopes, "scheme_ids": schemes})
    return {**v.client_dict(row), "credential": token, "notice": "Shown once. Store securely; it expires in 30 days and can be revoked immediately."}

@router.post("/admin/clients/{client_id}/revoke", tags=["integration administration"])
def revoke_client(client_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "admin")
    row = db.get(m.IntegrationClient, client_id)
    if not row:
        raise HTTPException(404, "Integration client not found")
    row.status, row.credential_hash = "revoked", None
    v.audit(db, user, "integration.revoked", "integration_client", row.id, "Immediate credential revocation")
    return v.client_dict(row)

def integration_auth(request: Request, scope: str, db):
    header = request.headers.get("authorization", "")
    if not header.startswith("Bearer "):
        raise HTTPException(401, "An integration credential is required")
    token = header.removeprefix("Bearer ")
    row = db.scalar(select(m.IntegrationClient).where(m.IntegrationClient.credential_hash == digest(token), m.IntegrationClient.status == "active"))
    if not row or not row.expires_at or utc(row.expires_at) <= m.now():
        raise HTTPException(401, "Integration credential is invalid or expired")
    if scope not in row.approved_scopes:
        raise HTTPException(403, "Integration scope is not approved")
    rate_limit(request, "integration", row.id, limit=120, window=60)
    return row

@router.post("/integration/resolve", tags=["integration API"])
def integration_resolve(values: s.IntegrationResolve, request: Request, db: Session = Depends(get_db, scope="function")):
    client = integration_auth(request, "family:verify", db)
    if values.purpose != client.purpose:
        raise HTTPException(403, "Purpose must match the approved integration agreement")
    family = db.scalar(select(m.Family).where(m.Family.public_id == values.public_id, m.Family.district == client.district))
    if not family:
        raise HTTPException(404, "No authorized family match")
    owners = db.scalars(select(m.User).join(m.Membership, m.Membership.person_id == m.User.person_id).where(m.Membership.family_id == family.id, m.Membership.valid_to.is_(None))).all()
    for owner in owners:
        v.audit(db, client, "integration.family_resolved", "family", family.id, client.purpose, owner.id, {"disclosed_fields": ["public_id", "status", "member_count", "as_of"]})
    return {"public_id": family.public_id, "status": family.status, "member_count": len(v.active_members(db, family.id)), "as_of": m.now()}

@router.post("/integration/benefits", status_code=201, tags=["integration API"])
def integration_benefit(values: s.BenefitReport, request: Request, idempotency_key: str | None = Header(None), db: Session = Depends(get_db, scope="function")):
    client = integration_auth(request, "benefits:write", db)
    def authorize():
        if values.scheme_id not in client.approved_scheme_ids:
            raise HTTPException(403, "This scheme is outside the approved reporting agreement")
        person = db.get(m.Person, values.person_id)
        family = db.scalar(select(m.Family).join(m.Membership, m.Membership.family_id == m.Family.id).where(m.Membership.person_id == values.person_id, m.Membership.valid_to.is_(None), m.Family.district == client.district).with_for_update())
        if not person or not family:
            raise HTTPException(404, "No authorized subject match")
    def perform():
        person = db.get(m.Person, values.person_id)
        scheme = db.get(m.Scheme, values.scheme_id)
        existing = db.scalar(select(m.Benefit).where(m.Benefit.department == scheme.department, m.Benefit.source_reference == values.source_reference))
        if existing:
            check = {name: getattr(existing, name) for name in values.model_fields}
            validated = s.BenefitReport.model_validate(check)
            if validated.model_dump() != values.model_dump() or existing.source_client_id != client.id:
                raise HTTPException(409, "Source transaction already exists with different data")
            return v.benefit_dict(db, existing)
        row = m.Benefit(department=scheme.department, source_client_id=client.id, **values.model_dump())
        db.add(row)
        db.flush()
        owner = db.scalar(select(m.User).where(m.User.person_id == person.id))
        v.audit(db, client, "integration.benefit_reported", "benefit", row.id, client.purpose, owner.id if owner else None, {"scheme_id": scheme.id})
        v.outbox(db, "scheme.benefit_reported", row.id, {"benefit_id": row.id, "source_client_id": client.id})
        return v.benefit_dict(db, row)
    return v.idempotent(db, client.id, "integration.benefit_report", idempotency_key, values.model_dump(mode="json"), perform, authorize=authorize)

app.include_router(router)

# Payment workflow is owned by its independent domain module; no live provider.
try:
    from .payments import router as payment_router
except ModuleNotFoundError as error:
    if error.name != "app.payments":
        raise
else:
    app.include_router(payment_router, prefix="/api/v1")
