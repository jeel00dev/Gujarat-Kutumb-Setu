"""Purpose-scoped payment register with a replaceable simulated provider.

The browser is the intended live interface; only the provider is simulated here.
No actual scheme eligibility, banking access, service charge or fund movement is
implied. A production provider must implement authenticated settlement/reconcile
and may not accept a browser-selected outcome.
"""
import hashlib
import json
import os
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Protocol

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func, select, text
from sqlalchemy.orm import Mapped, Session, mapped_column

from . import config
from .db import Base, get_db
from .models import Audit, Benefit, Family, Idempotency, Membership, Notification, Outbox, Person, Representation, Scheme, SchemeApplication, User, now, uid
from .security import Auth, authenticated, jurisdiction, require_role
from .services import audit, authorized_person_ids

router = APIRouter(tags=["Payment register"])


class PaymentScope(Base):
    __tablename__ = "payment_scopes"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), index=True)
    __table_args__ = (UniqueConstraint("user_id", "scheme_id", name="uq_payment_scope"),)


class PaymentOrder(Base):
    __tablename__ = "payment_orders"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    reference: Mapped[str] = mapped_column(String(45), unique=True)
    scheme_application_id: Mapped[str] = mapped_column(ForeignKey("scheme_applications.id"), unique=True)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    period: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(20), default="sanctioned", index=True)
    revision: Mapped[int] = mapped_column(Integer, default=1)
    provider: Mapped[str] = mapped_column(String(30), default="simulated")
    provider_reference: Mapped[str | None] = mapped_column(String(100), nullable=True, unique=True)
    benefit_id: Mapped[str | None] = mapped_column(ForeignKey("benefits.id"), nullable=True)
    sanctioned_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    __table_args__ = (CheckConstraint("amount > 0", name="ck_payment_positive"), CheckConstraint("status IN ('sanctioned','processing','paid','failed','reversed')", name="ck_payment_status"),)


class PaymentEvent(Base):
    __tablename__ = "payment_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    payment_id: Mapped[str] = mapped_column(ForeignKey("payment_orders.id"), index=True)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(40))
    from_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    to_status: Mapped[str] = mapped_column(String(20))
    reason: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)


@dataclass(frozen=True)
class ProviderResult:
    status: str
    reference: str


class PaymentProvider(Protocol):
    def process(self, order: PaymentOrder, outcome: str) -> ProviderResult: ...
    def reverse(self, order: PaymentOrder) -> ProviderResult: ...


class SimulatedPaymentProvider:
    def process(self, order: PaymentOrder, outcome: str) -> ProviderResult:
        return ProviderResult(outcome, "SIM-PAY-" + order.id)

    def reverse(self, order: PaymentOrder) -> ProviderResult:
        return ProviderResult("reversed", order.provider_reference or "SIM-PAY-" + order.id)


def provider() -> PaymentProvider:
    if not config.DEMO_MODE or os.getenv("PAYMENT_PROVIDER", "simulated") != "simulated":
        raise HTTPException(503, "An approved payment provider is not configured. No funds have moved.")
    return SimulatedPaymentProvider()


class Decision(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: Literal["sanction", "reject"]
    reason: str = Field(min_length=5, max_length=1000)
    amount: Decimal | None = Field(default=None, gt=0, le=10000000, max_digits=12, decimal_places=2)
    period: str | None = Field(default=None, min_length=4, max_length=50)


class Process(BaseModel):
    model_config = ConfigDict(extra="forbid")
    revision: int = Field(ge=1)
    outcome: Literal["paid", "failed"] = "paid"
    reason: str = Field(default="Payment instruction processed by the configured provider", max_length=1000)


class Reversal(BaseModel):
    model_config = ConfigDict(extra="forbid")
    revision: int = Field(ge=1)
    reason: str = Field(min_length=5, max_length=1000)


def _scheme_scope(db: Session, user: User):
    if user.role == "admin":
        return select(Scheme.id)
    return select(PaymentScope.scheme_id).where(PaymentScope.user_id == user.id)


def _check_staff(db: Session, auth: Auth, scheme_id: str, person_id: str):
    user = require_role(auth, "department", "admin")
    allowed = db.scalar(select(PaymentScope.id).where(PaymentScope.user_id == user.id, PaymentScope.scheme_id == scheme_id))
    family = db.scalar(select(Family).join(Membership, Membership.family_id == Family.id).where(Membership.person_id == person_id, Membership.valid_to.is_(None)))
    if user.role != "admin" and (not allowed or not family or not jurisdiction(user, family.district)):
        raise HTTPException(404, "Payment or application not found")
    return user


def _visible_people(db: Session, user: User):
    return list(authorized_person_ids(db, user))


def _own_or_staff(db: Session, auth: Auth, order: PaymentOrder | None):
    if not order:
        raise HTTPException(404, "Payment not found")
    if auth.user.role in {"department", "admin"}:
        _check_staff(db, auth, order.scheme_id, order.person_id)
    elif order.person_id not in _visible_people(db, auth.user):
        raise HTTPException(404, "Payment not found")
    return order


def _serialize(db: Session, order: PaymentOrder):
    scheme, person = db.get(Scheme, order.scheme_id), db.get(Person, order.person_id)
    result = {k: getattr(order, k) for k in ("id", "reference", "scheme_application_id", "status", "revision", "currency", "period", "provider", "provider_reference", "created_at", "updated_at")}
    result.update(amount=str(order.amount), scheme_name=scheme.name, department=scheme.department, person_name=person.name)
    result["events"] = [{k: getattr(event, k) for k in ("id", "action", "from_status", "to_status", "reason", "created_at")} for event in db.scalars(select(PaymentEvent).where(PaymentEvent.payment_id == order.id).order_by(PaymentEvent.created_at, PaymentEvent.id))]
    return jsonable_encoder(result)


def _audit(db: Session, user: User, action: str, entity_id: str, owner_id: str, detail: dict):
    audit(db, user, action, "payment", entity_id, "Scheme payment processing and resident status", owner_id, detail)


def _event(db: Session, order: PaymentOrder, user: User, action: str, old: str | None, reason: str):
    db.add(PaymentEvent(payment_id=order.id, actor_id=user.id, action=action, from_status=old, to_status=order.status, reason=reason))
    application = db.get(SchemeApplication, order.scheme_application_id)
    _audit(db, user, action, order.id, application.owner_id, {"status": order.status, "revision": order.revision})
    db.add(Outbox(event_type="payment." + action, aggregate_id=order.id, payload={"payment_id": order.id, "status": order.status, "revision": order.revision}))
    db.add(Notification(user_id=application.owner_id, title="Payment status updated", message="A scheme payment status has changed. Sign in to view the transaction.", link="/my/payments"))
    db.flush()


def _idempotency(db: Session, auth: Auth, request: Request, payload: BaseModel):
    key = request.headers.get("Idempotency-Key", "")
    if not 8 <= len(key) <= 120:
        raise HTTPException(400, "Supply an Idempotency-Key of 8–120 characters")
    operation = request.url.path
    request_hash = hashlib.sha256(payload.model_dump_json().encode()).hexdigest()
    if db.bind.dialect.name == "postgresql":
        lock = hashlib.sha256((auth.user.id + operation + key).encode()).hexdigest()
        db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": int(lock[:15], 16)})
    record = db.scalar(select(Idempotency).where(Idempotency.actor_id == auth.user.id, Idempotency.operation == operation, Idempotency.key == key))
    if record and record.request_hash != request_hash:
        raise HTTPException(409, "This idempotency key was already used for a different request")
    return record, {"actor_id": auth.user.id, "operation": operation, "key": key, "request_hash": request_hash}


def _finish(db: Session, data: dict, idem: dict):
    db.add(Idempotency(**idem, response=data))
    db.flush()
    return data


@router.get("/payments")
def resident_payments(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    stmt = select(PaymentOrder).where(PaymentOrder.person_id.in_(_visible_people(db, auth.user)))
    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    items = db.scalars(stmt.order_by(PaymentOrder.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    return {"items": [_serialize(db, item) for item in items], "total": total, "page": page, "page_size": page_size}


@router.get("/payments/{payment_id}")
def payment_detail(payment_id: str, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    return _serialize(db, _own_or_staff(db, auth, db.get(PaymentOrder, payment_id)))


@router.get("/staff/payments")
def payment_queue(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "department", "admin")
    stmt = select(PaymentOrder).where(PaymentOrder.scheme_id.in_(_scheme_scope(db, user)))
    if user.role != "admin":
        people = select(Membership.person_id).join(Family, Membership.family_id == Family.id).where(Membership.valid_to.is_(None), Family.district == user.district)
        stmt = stmt.where(PaymentOrder.person_id.in_(people))
    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = db.scalars(stmt.order_by(PaymentOrder.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    return {"items": [_serialize(db, item) for item in rows], "total": total, "page": page, "page_size": page_size}


@router.get("/staff/scheme-applications")
def scheme_queue(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    user = require_role(auth, "department", "admin")
    stmt = select(SchemeApplication).where(SchemeApplication.scheme_id.in_(_scheme_scope(db, user)))
    if user.role != "admin":
        people = select(Membership.person_id).join(Family, Membership.family_id == Family.id).where(Membership.valid_to.is_(None), Family.district == user.district)
        stmt = stmt.where(SchemeApplication.person_id.in_(people))
    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    rows = db.scalars(stmt.order_by(SchemeApplication.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    result = []
    for item in rows:
        scheme, person = db.get(Scheme, item.scheme_id), db.get(Person, item.person_id)
        order = db.scalar(select(PaymentOrder).where(PaymentOrder.scheme_application_id == item.id))
        result.append({"id": item.id, "reference": item.reference, "scheme_id": item.scheme_id, "scheme_name": scheme.name, "person_name": person.name, "status": item.status, "created_at": item.created_at, "payment_id": order.id if order else None})
    return {"items": result, "total": total, "page": page, "page_size": page_size}


@router.post("/staff/scheme-applications/{application_id}/decision")
def scheme_decision(application_id: str, payload: Decision, request: Request, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    require_role(auth, "department", "admin")
    provider()  # No accidental real award/payment action when provider is absent.
    application = db.scalar(select(SchemeApplication).where(SchemeApplication.id == application_id).with_for_update())
    if not application:
        raise HTTPException(404, "Application not found")
    _check_staff(db, auth, application.scheme_id, application.person_id)
    if application.owner_id == auth.user.id:
        raise HTTPException(403, "You cannot decide your own application")
    replay, idem = _idempotency(db, auth, request, payload)
    if replay:
        return replay.response
    if application.status not in {"referred", "under_review"}:
        raise HTTPException(409, "This application already has a decision")
    if payload.action == "reject":
        application.status = "rejected"
        _audit(db, auth.user, "scheme.rejected", application.id, application.owner_id, {"reason": payload.reason})
        db.add(Notification(user_id=application.owner_id, title="Scheme application decision", message="A decision is available. Sign in to review it.", link="/my"))
        return _finish(db, {"id": application.id, "reference": application.reference, "status": application.status, "reason": payload.reason}, idem)
    if payload.amount is None or not payload.period:
        raise HTTPException(422, "A sanction requires a positive amount and benefit period")
    application.status = "sanctioned"
    order = PaymentOrder(id=uid(), reference="KS-PAY-" + uid().replace("-", "")[:14].upper(), scheme_application_id=application.id, person_id=application.person_id, scheme_id=application.scheme_id, amount=payload.amount, period=payload.period, sanctioned_by=auth.user.id, status="sanctioned", revision=1)
    db.add(order)
    db.flush()
    _event(db, order, auth.user, "sanctioned", None, payload.reason)
    return _finish(db, _serialize(db, order), idem)


@router.post("/staff/payments/{payment_id}/process")
def process_payment(payment_id: str, payload: Process, request: Request, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    require_role(auth, "department", "admin")
    adapter = provider()
    order = db.scalar(select(PaymentOrder).where(PaymentOrder.id == payment_id).with_for_update())
    _own_or_staff(db, auth, order)
    replay, idem = _idempotency(db, auth, request, payload)
    if replay:
        return replay.response
    if order.revision != payload.revision:
        raise HTTPException(409, "Payment changed. Refresh before proceeding.")
    if order.status not in {"sanctioned", "failed"}:
        raise HTTPException(409, "Only sanctioned or failed payments can be processed")
    old = order.status
    order.status, order.revision = "processing", order.revision + 1
    _event(db, order, auth.user, "processing", old, "Payment instruction accepted by configured provider")
    result = adapter.process(order, payload.outcome)
    order.status, order.provider_reference = result.status, result.reference
    order.revision += 1
    scheme = db.get(Scheme, order.scheme_id)
    if order.benefit_id:
        benefit = db.get(Benefit, order.benefit_id)
        benefit.status, benefit.reported_at = result.status, now()
    else:
        benefit = Benefit(person_id=order.person_id, scheme_id=order.scheme_id, department=scheme.department, benefit_type="cash", amount=order.amount, currency="INR", period=order.period, status=result.status, source_reference=result.reference, event_date=date.today())
        db.add(benefit)
        db.flush()
        order.benefit_id = benefit.id
    _event(db, order, auth.user, result.status, "processing", payload.reason)
    return _finish(db, _serialize(db, order), idem)


@router.post("/staff/payments/{payment_id}/reverse")
def reverse_payment(payment_id: str, payload: Reversal, request: Request, auth: Auth = Depends(authenticated), db: Session = Depends(get_db, scope="function")):
    require_role(auth, "department", "admin")
    adapter = provider()
    order = db.scalar(select(PaymentOrder).where(PaymentOrder.id == payment_id).with_for_update())
    _own_or_staff(db, auth, order)
    replay, idem = _idempotency(db, auth, request, payload)
    if replay:
        return replay.response
    if order.revision != payload.revision or order.status != "paid":
        raise HTTPException(409, "Only the current paid payment can be reversed")
    result = adapter.reverse(order)
    order.status, order.revision = result.status, order.revision + 1
    benefit = db.get(Benefit, order.benefit_id)
    benefit.status, benefit.reported_at = "reversed", now()
    _event(db, order, auth.user, "reversed", "paid", payload.reason)
    return _finish(db, _serialize(db, order), idem)


def seed_payments(db: Session):
    """Assign only explicitly selected synthetic connected schemes to one officer."""
    if not config.DEMO_MODE:
        return
    user = db.scalar(select(User).where(User.email == "department@demo.local"))
    if not user:
        return
    for scheme in db.scalars(select(Scheme).where(Scheme.capability.in_(["demo_connected", "connected"]))):
        if not db.scalar(select(PaymentScope.id).where(PaymentScope.user_id == user.id, PaymentScope.scheme_id == scheme.id)):
            db.add(PaymentScope(user_id=user.id, scheme_id=scheme.id))
