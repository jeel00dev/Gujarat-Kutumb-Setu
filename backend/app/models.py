"""Normalized registry, temporal memberships, workflow and purpose-limited integration.

JSON is limited to versioned submissions/configuration/event snapshots. It is not
a second ungoverned family/person database. No Aadhaar/bank/caste data is collected.
"""
from datetime import date, datetime, timezone
from uuid import uuid4
from sqlalchemy import String, Text, Integer, Date, DateTime, Boolean, ForeignKey, UniqueConstraint, CheckConstraint, Index, JSON, Numeric, text
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

def uid():
    return str(uuid4())

def now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    password_hash: Mapped[str] = mapped_column(Text)
    display_name: Mapped[str] = mapped_column(String(150))
    role: Mapped[str] = mapped_column(String(20), default="resident")
    district: Mapped[str | None] = mapped_column(String(60), nullable=True)
    person_id: Mapped[str | None] = mapped_column(ForeignKey("persons.id"), nullable=True, unique=True)
    language: Mapped[str] = mapped_column(String(2), default="en")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (CheckConstraint("role IN ('resident','operator','verifier','approver','admin','department')", name="ck_user_role"),)

class AuthSession(Base):
    __tablename__ = "auth_sessions"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    csrf_hash: Mapped[str] = mapped_column(String(64))
    csrf_token: Mapped[str] = mapped_column(String(80))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Person(Base):
    __tablename__ = "persons"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    public_id: Mapped[str] = mapped_column(String(40), unique=True)
    name: Mapped[str] = mapped_column(String(150))
    name_gu: Mapped[str] = mapped_column(String(150), default="")
    dob: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="active")
    death_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    revision: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class AuthIdentifier(Base):
    """Login credential binding, NOT a globally unique person contact field."""
    __tablename__ = "auth_identifiers"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    identifier_hash: Mapped[str] = mapped_column(String(64), unique=True)
    identifier_type: Mapped[str] = mapped_column(String(20))
    masked_destination: Mapped[str] = mapped_column(String(40))

class AuthChallenge(Base):
    __tablename__ = "auth_challenges"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    identifier_hash: Mapped[str] = mapped_column(String(64))
    identifier_type: Mapped[str] = mapped_column(String(20))
    masked_destination: Mapped[str] = mapped_column(String(40))
    purpose: Mapped[str] = mapped_column(String(20))
    display_name: Mapped[str] = mapped_column(String(150), default="New resident")
    language: Mapped[str] = mapped_column(String(2), default="en")
    code_hash: Mapped[str] = mapped_column(String(64))
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    consumed: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Family(Base):
    __tablename__ = "families"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    public_id: Mapped[str] = mapped_column(String(40), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="active")
    revision: Mapped[int] = mapped_column(Integer, default=1)
    district: Mapped[str] = mapped_column(String(60), index=True)
    address: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)

class Membership(Base):
    __tablename__ = "memberships"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id"), index=True)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    relationship: Mapped[str] = mapped_column(String(30))
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    valid_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reason: Mapped[str] = mapped_column(String(80), default="enrollment")
    __table_args__ = (
        Index("uq_active_person_membership", "person_id", unique=True, postgresql_where=text("valid_to IS NULL"), sqlite_where=text("valid_to IS NULL")),
        CheckConstraint("valid_to IS NULL OR valid_to >= valid_from", name="ck_membership_interval"),
    )

class Representative(Base):
    __tablename__ = "representatives"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id"), index=True)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    valid_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    __table_args__ = (Index("uq_active_representative", "family_id", unique=True, postgresql_where=text("valid_to IS NULL"), sqlite_where=text("valid_to IS NULL")),)

class Representation(Base):
    __tablename__ = "representations"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    guardian_person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    represented_person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    basis: Mapped[str] = mapped_column(String(80), default="demo-reviewed-minor-guardianship")
    valid_until: Mapped[date] = mapped_column(Date)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (UniqueConstraint("guardian_person_id", "represented_person_id", name="uq_representation"),)

class Application(Base):
    __tablename__ = "applications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    reference: Mapped[str | None] = mapped_column(String(40), nullable=True, unique=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    submitted_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    kind: Mapped[str] = mapped_column(String(30), default="enrollment")
    branch: Mapped[str] = mapped_column(String(20), default="no_ration")
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)
    revision: Mapped[int] = mapped_column(Integer, default=1)
    step: Mapped[int] = mapped_column(Integer, default=1)
    district: Mapped[str] = mapped_column(String(60), index=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    family_id: Mapped[str | None] = mapped_column(ForeignKey("families.id"), nullable=True)
    family_revision: Mapped[int | None] = mapped_column(Integer, nullable=True)
    verified_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_by: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    policy_version: Mapped[str] = mapped_column(String(40), default="demo-policy-1")
    channel: Mapped[str] = mapped_column(String(20), default="self_service")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    __table_args__ = (Index("ix_app_queue", "district", "status", "created_at"),)

class ApplicationEvent(Base):
    __tablename__ = "application_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), index=True)
    from_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    to_status: Mapped[str] = mapped_column(String(30))
    action: Mapped[str] = mapped_column(String(40))
    reason: Mapped[str] = mapped_column(Text, default="")
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    actor_role: Mapped[str] = mapped_column(String(20))
    payload_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class FactHistory(Base):
    __tablename__ = "fact_history"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    family_id: Mapped[str] = mapped_column(ForeignKey("families.id"), index=True)
    person_id: Mapped[str | None] = mapped_column(ForeignKey("persons.id"), nullable=True)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"))
    fact_type: Mapped[str] = mapped_column(String(40))
    old_value: Mapped[dict] = mapped_column(JSON, default=dict)
    new_value: Mapped[dict] = mapped_column(JSON, default=dict)
    source: Mapped[str] = mapped_column(String(80), default="demo-reviewed-resident-assertion")
    effective_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Evidence(Base):
    __tablename__ = "evidence"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    application_id: Mapped[str] = mapped_column(ForeignKey("applications.id"), index=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    evidence_type: Mapped[str] = mapped_column(String(60))
    filename: Mapped[str] = mapped_column(String(200))
    media_type: Mapped[str] = mapped_column(String(40))
    size: Mapped[int] = mapped_column(Integer)
    sha256: Mapped[str] = mapped_column(String(64))
    storage_key: Mapped[str] = mapped_column(String(60), unique=True)
    status: Mapped[str] = mapped_column(String(30), default="quarantined")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Scheme(Base):
    __tablename__ = "schemes"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    name: Mapped[str] = mapped_column(String(180))
    name_gu: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(60), index=True)
    department: Mapped[str] = mapped_column(String(180))
    summary: Mapped[str] = mapped_column(Text)
    summary_gu: Mapped[str] = mapped_column(Text)
    benefit_type: Mapped[str] = mapped_column(String(40), default="service")
    eligibility: Mapped[list] = mapped_column(JSON, default=list)
    documents: Mapped[list] = mapped_column(JSON, default=list)
    application_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="published")
    capability: Mapped[str] = mapped_column(String(30), default="information_only")
    revision: Mapped[int] = mapped_column(Integer, default=1)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)

class SchemeApplication(Base):
    __tablename__ = "scheme_applications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    reference: Mapped[str] = mapped_column(String(40), unique=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"))
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"))
    status: Mapped[str] = mapped_column(String(40), default="referred")
    consent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (UniqueConstraint("owner_id", "scheme_id", name="uq_demo_referral"),)

class Benefit(Base):
    __tablename__ = "benefits"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    person_id: Mapped[str] = mapped_column(ForeignKey("persons.id"), index=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id"))
    department: Mapped[str] = mapped_column(String(180))
    benefit_type: Mapped[str] = mapped_column(String(30))
    amount: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True)
    quantity: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(40), nullable=True)
    period: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(40))
    source_reference: Mapped[str] = mapped_column(String(100))
    source_client_id: Mapped[str | None] = mapped_column(ForeignKey("integration_clients.id"), nullable=True)
    event_date: Mapped[date] = mapped_column(Date)
    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (UniqueConstraint("department", "source_reference", name="uq_benefit_source_transaction"),)

class Grievance(Base):
    __tablename__ = "grievances"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    reference: Mapped[str] = mapped_column(String(40), unique=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    application_id: Mapped[str | None] = mapped_column(ForeignKey("applications.id"), nullable=True)
    district: Mapped[str] = mapped_column(String(60), index=True)
    category: Mapped[str] = mapped_column(String(60))
    subject: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="received")
    response: Mapped[str] = mapped_column(Text, default="")
    history: Mapped[list] = mapped_column(JSON, default=list)
    revision: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)

class Content(Base):
    __tablename__ = "content_pages"
    slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    title_gu: Mapped[str] = mapped_column(String(180))
    body: Mapped[str] = mapped_column(Text)
    body_gu: Mapped[str] = mapped_column(Text)
    revision: Mapped[int] = mapped_column(Integer, default=1)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)

class ContentVersion(Base):
    __tablename__ = "content_versions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    slug: Mapped[str] = mapped_column(ForeignKey("content_pages.slug"))
    revision: Mapped[int] = mapped_column(Integer)
    snapshot: Mapped[dict] = mapped_column(JSON)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (UniqueConstraint("slug", "revision", name="uq_content_revision"),)

class IntegrationClient(Base):
    __tablename__ = "integration_clients"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(150))
    purpose: Mapped[str] = mapped_column(String(300))
    requested_scopes: Mapped[list] = mapped_column(JSON)
    approved_scopes: Mapped[list] = mapped_column(JSON, default=list)
    approved_scheme_ids: Mapped[list] = mapped_column(JSON, default=list)
    district: Mapped[str] = mapped_column(String(60))
    status: Mapped[str] = mapped_column(String(30), default="pending")
    credential_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(180))
    message: Mapped[str] = mapped_column(Text)
    link: Mapped[str] = mapped_column(String(200), default="/dashboard")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Audit(Base):
    __tablename__ = "audit_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    actor_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    actor_role: Mapped[str] = mapped_column(String(30))
    subject_user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(100), index=True)
    entity_type: Mapped[str] = mapped_column(String(40))
    entity_id: Mapped[str] = mapped_column(String(100))
    purpose: Mapped[str] = mapped_column(String(300))
    detail: Mapped[dict] = mapped_column(JSON, default=dict)
    event_hash: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Outbox(Base):
    __tablename__ = "outbox_events"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    event_type: Mapped[str] = mapped_column(String(100))
    aggregate_id: Mapped[str] = mapped_column(String(36), index=True)
    payload: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    available_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[str | None] = mapped_column(String(200), nullable=True)

class EventDelivery(Base):
    __tablename__ = "event_deliveries"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    event_id: Mapped[str] = mapped_column(ForeignKey("outbox_events.id"), unique=True)
    destination: Mapped[str] = mapped_column(String(80), default="local-demo-event-sink")
    delivered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Idempotency(Base):
    __tablename__ = "idempotency_records"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    actor_id: Mapped[str] = mapped_column(String(36))
    operation: Mapped[str] = mapped_column(String(160))
    key: Mapped[str] = mapped_column(String(120))
    request_hash: Mapped[str] = mapped_column(String(64))
    response: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (UniqueConstraint("actor_id", "operation", "key", name="uq_idempotency_actor_operation"),)

class RateBucket(Base):
    __tablename__ = "rate_buckets"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    count: Mapped[int] = mapped_column(Integer, default=0)
