import hashlib
import json
import secrets
from datetime import date, datetime, time, timezone
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
from sqlalchemy import select, func, text
from . import models as m, schemas as s, config
from .security import jurisdiction, utc, digest

STAFF = {"verifier", "approver", "admin"}
EDITABLE = {"draft", "needs_information"}
WITHDRAWABLE = {"draft", "submitted", "needs_information", "under_verification", "verified", "appealed"}
PROTECTED_KEYS = {"aadhaar", "aadhaar_number", "aadhar", "bank", "bank_account", "caste", "religion", "password", "role", "status", "public_id", "owner_id", "approved_by", "income", "biometrics"}

def plain(obj, fields):
    return jsonable_encoder({key: getattr(obj, key) for key in fields.split()})

def page(db, query, serializer, page=1, page_size=20):
    total = db.scalar(select(func.count()).select_from(query.order_by(None).subquery()))
    rows = db.scalars(query.offset((page - 1) * page_size).limit(page_size)).all()
    return {"items": [serializer(row) for row in rows], "total": total, "page": page, "page_size": page_size}

def opaque_public(prefix):
    # 96 random bits; no address/category/person information encoded.
    return f"{prefix}-{secrets.token_hex(12).upper()}"

def require_revision(obj, expected):
    if obj.revision != expected:
        raise HTTPException(409, "This record changed. Reload it and review the latest version before retrying.")

def require_district(value):
    if value not in config.SUPPORTED_DISTRICTS:
        raise HTTPException(422, "Choose a supported Gujarat district")

def validate_model(schema, payload):
    try:
        return schema.model_validate(payload)
    except ValidationError as error:
        raise HTTPException(422, [{"loc": ["body", "payload", *item["loc"]], "msg": item["msg"], "type": item["type"]} for item in error.errors()])

def validate_draft(payload):
    if len(json.dumps(payload, ensure_ascii=False)) > 60000:
        raise HTTPException(422, "Draft is too large")
    def visit(value):
        if isinstance(value, dict):
            if any(key.lower() in PROTECTED_KEYS for key in value):
                raise HTTPException(422, "This demonstration does not collect protected identity, bank, caste, religion or system-controlled fields")
            for nested in value.values():
                visit(nested)
        elif isinstance(value, list):
            if len(value) > 100:
                raise HTTPException(422, "Too many draft items")
            for nested in value:
                visit(nested)
        elif isinstance(value, str) and len(value) > 5000:
            raise HTTPException(422, "A draft field exceeds its allowed size")
    visit(payload)

def audit(db, actor, action, entity_type, entity_id, purpose, subject_user_id=None, detail=None):
    actor_id = getattr(actor, "id", None)
    role = getattr(actor, "role", "integration")
    stamp = m.now()
    event_id = m.uid()
    content = {"id": event_id, "actor": actor_id, "role": role, "subject": subject_user_id, "action": action, "entity_type": entity_type, "entity_id": entity_id, "purpose": purpose, "detail": detail or {}, "created_at": stamp.isoformat()}
    checksum = digest(json.dumps(content, sort_keys=True, ensure_ascii=False))
    db.add(m.Audit(id=event_id, actor_id=actor_id, actor_role=role, subject_user_id=subject_user_id, action=action, entity_type=entity_type, entity_id=str(entity_id), purpose=purpose, detail=detail or {}, event_hash=checksum, created_at=stamp))

def notify(db, user_id, title, message, link="/dashboard"):
    db.add(m.Notification(user_id=user_id, title=title, message=message, link=link))

def outbox(db, event_type, aggregate_id, payload):
    db.add(m.Outbox(event_type=event_type, aggregate_id=aggregate_id, payload=payload))

def family_for_user(db, user):
    if not user.person_id:
        return None
    return db.scalar(select(m.Family).join(m.Membership, m.Membership.family_id == m.Family.id).where(m.Membership.person_id == user.person_id, m.Membership.valid_to.is_(None)))

def family_authorized(db, family_id, user, allow_staff=False, lock=False):
    query = select(m.Family).where(m.Family.id == family_id)
    family = db.scalar(query.with_for_update() if lock else query)
    if not family:
        raise HTTPException(404, "Family record not found")
    own = family_for_user(db, user)
    if not (own and own.id == family.id) and not (allow_staff and user.role in STAFF and jurisdiction(user, family.district)):
        raise HTTPException(404, "Family record not found")
    return family

def active_members(db, family_id):
    return db.execute(select(m.Person, m.Membership).join(m.Membership, m.Membership.person_id == m.Person.id).where(m.Membership.family_id == family_id, m.Membership.valid_to.is_(None)).order_by(m.Membership.valid_from, m.Person.name)).all()

def family_dict(db, family, user=None):
    representative = db.scalar(select(m.Representative).where(m.Representative.family_id == family.id, m.Representative.valid_to.is_(None)))
    members = []
    sensitive_ids = authorized_person_ids(db, user) if user else set()
    for person, membership in active_members(db, family.id):
        data = plain(person, "id public_id name name_gu status")
        # Birth date is an individual fact; other adults' exact DOB is minimized.
        data["dob"] = person.dob.isoformat() if person.id in sensitive_ids else None
        data.update(relationship=membership.relationship, joined_at=jsonable_encoder(membership.valid_from), age_band="minor" if age_on(person.dob) < 18 else "adult")
        members.append(data)
    return {**plain(family, "id public_id status revision address updated_at"), "representative_id": representative.person_id if representative else None, "members": members}

def authorized_person_ids(db, user):
    if not user or not user.person_id:
        return set()
    ids = {user.person_id}
    represented = db.scalars(select(m.Representation).where(m.Representation.guardian_person_id == user.person_id, m.Representation.active.is_(True), m.Representation.valid_until >= date.today())).all()
    for relation in represented:
        person = db.get(m.Person, relation.represented_person_id)
        if person and age_on(person.dob) < 18:
            ids.add(person.id)
    return ids

def age_on(born, on=None):
    on = on or date.today()
    return on.year - born.year - ((on.month, on.day) < (born.month, born.day))

def application_access(db, application_id, user, lock=False, owner_only=False):
    query = select(m.Application).where(m.Application.id == application_id)
    app = db.scalar(query.with_for_update() if lock else query)
    if not app:
        raise HTTPException(404, "Application not found")
    if app.owner_id == user.id or (app.submitted_by == user.id and user.role == "operator" and jurisdiction(user, app.district)):
        return app
    if not owner_only and user.role in STAFF and jurisdiction(user, app.district) and app.status != "draft":
        return app
    raise HTTPException(404, "Application not found")

def app_dict(db, app, with_events=True):
    data = plain(app, "id reference kind branch status revision step district payload family_id created_at updated_at submitted_at channel policy_version")
    if with_events:
        events = db.scalars(select(m.ApplicationEvent).where(m.ApplicationEvent.application_id == app.id).order_by(m.ApplicationEvent.created_at, m.ApplicationEvent.id)).all()
        data["events"] = [plain(event, "id from_status to_status action reason actor_role created_at") for event in events]
    return data

def transition(db, app, user, status, action, reason=""):
    db.add(m.ApplicationEvent(application_id=app.id, from_status=app.status, to_status=status, action=action, reason=reason, actor_id=user.id, actor_role=user.role, payload_snapshot=app.payload if action in {"submit", "verify", "approve", "appeal"} else {}))
    app.status = status
    app.revision += 1
    app.updated_at = m.now()
    audit(db, user, f"application.{action}", "application", app.id, reason or "Resident application workflow", app.owner_id, {"status": status, "revision": app.revision, "policy_version": app.policy_version})
    if status != "draft":
        notify(db, app.owner_id, "Application status updated", f"Your application is now {status.replace('_', ' ')}. Sign in to view details.", f"/applications/{app.id}")
    outbox(db, "application.status_changed", app.id, {"application_id": app.id, "status": status, "revision": app.revision, "mode": "synthetic"})
    db.flush()

def idempotent(db, actor_id, operation, key, body, function, *, authorize):
    """Cache the result of an intent, never cache the caller's authority.

    Authorization runs again for every request, including replay, while workflow
    state/revision validation remains inside ``function`` for new intents only.
    Object-authorizing callbacks should lock mutable scope-bearing records.
    """
    if not key or len(key) < 8 or len(key) > 120:
        raise HTTPException(400, "An Idempotency-Key of 8 to 120 characters is required")
    request_hash = digest(json.dumps(jsonable_encoder(body), sort_keys=True))
    lock_key = digest(f"{actor_id}:{operation}:{key}")
    if db.bind.dialect.name == "postgresql":
        db.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": int(lock_key[:15], 16)})
    authorize()
    existing = db.scalar(select(m.Idempotency).where(m.Idempotency.actor_id == actor_id, m.Idempotency.operation == operation, m.Idempotency.key == key))
    if existing:
        if existing.request_hash != request_hash:
            raise HTTPException(409, "This idempotency key was already used for a different request")
        return existing.response
    result = jsonable_encoder(function())
    db.add(m.Idempotency(actor_id=actor_id, operation=operation, key=key, request_hash=request_hash, response=result))
    db.flush()
    return result

def validate_change(db, app, owner):
    payload = app.payload
    schema = {"address": s.AddressChange, "name": s.NameChange, "add_member": s.MemberChange, "death": s.DeathChange, "representative": s.RepresentativeChange}.get(app.kind)
    if not schema:
        raise HTTPException(422, "This change type is not implemented")
    values = validate_model(schema, payload)
    family = family_authorized(db, app.family_id, owner, lock=True)
    members = {person.id: (person, membership) for person, membership in active_members(db, family.id)}
    representative = db.scalar(select(m.Representative).where(m.Representative.family_id == family.id, m.Representative.valid_to.is_(None)))
    is_rep = representative and representative.person_id == owner.person_id
    if app.kind in {"address", "add_member", "representative", "death"} and not is_rep:
        raise HTTPException(403, "This family-wide request needs the current representative's authority")
    if app.kind == "name":
        if values.person_id not in members or values.person_id not in authorized_person_ids(db, owner):
            raise HTTPException(403, "You may request a name correction only for yourself or a represented minor")
    if app.kind == "add_member":
        if values.member.relationship == "self":
            raise HTTPException(422, "An added member cannot replace the existing applicant")
        if age_on(values.member.dob) >= 18:
            raise HTTPException(422, "An adult addition requires independently verified authority; the demo supports represented minors only")
        if values.member.relationship not in {"child", "grandchild"}:
            raise HTTPException(422, "Use the assisted dispute route for another type of minor representation")
        if any(person.name.casefold() == values.member.name.casefold() and person.dob == values.member.dob for person, _ in members.values()):
            raise HTTPException(409, "A matching member already exists in your family; request a correction instead")
    if app.kind == "death":
        if values.person_id not in members:
            raise HTTPException(404, "Member not found")
        person = members[values.person_id][0]
        if values.effective_date > date.today() or values.effective_date < person.dob:
            raise HTTPException(422, "Check the effective date")
        if representative and representative.person_id == values.person_id:
            raise HTTPException(409, "Appoint a living representative before recording the current representative's death")
        if person.status != "active":
            raise HTTPException(409, "This member is not currently active")
    if app.kind == "representative":
        person = members.get(values.person_id, (None, None))[0]
        if not person or person.status != "active" or age_on(person.dob) < 18:
            raise HTTPException(422, "Choose an active adult family member")
        if representative and representative.person_id == person.id:
            raise HTTPException(409, "That person is already the representative")
    return family, values

def submit_application(db, app, user, revision):
    require_revision(app, revision)
    if app.status not in EDITABLE:
        raise HTTPException(409, "Only drafts or information responses may be submitted")
    owner = db.scalar(select(m.User).where(m.User.id == app.owner_id).with_for_update())
    if app.kind == "enrollment":
        if family_for_user(db, owner):
            raise HTTPException(409, "You already belong to a family. Use a change request.")
        conflict = db.scalar(select(m.Application.id).where(m.Application.owner_id == owner.id, m.Application.kind == "enrollment", m.Application.id != app.id, m.Application.status.in_(["submitted", "under_verification", "needs_information", "verified", "appealed"])))
        if conflict:
            raise HTTPException(409, "An enrollment application is already active for this account")
        values = validate_model(s.Enrollment, app.payload)
        if values.address.district != app.district:
            raise HTTPException(422, "Application district must match its address")
        app.payload = values.model_dump(mode="json")
    else:
        family, values = validate_change(db, app, owner)
        require_revision(family, app.family_revision)
        app.payload = values.model_dump(mode="json")
    if not app.reference:
        app.reference = opaque_public("APP")
    app.submitted_at = app.submitted_at or m.now()
    app.verified_by = None
    transition(db, app, user, "submitted", "submit", "Submitted for authorized review; no permanent Family ID issued at this stage")
    return app_dict(db, app)

def minor_representation(db, guardian_id, person):
    if age_on(person.dob) < 18:
        try:
            expiry = person.dob.replace(year=person.dob.year + 18)
        except ValueError:
            expiry = person.dob.replace(year=person.dob.year + 18, day=28)
        db.add(m.Representation(guardian_person_id=guardian_id, represented_person_id=person.id, valid_until=expiry))

def implement(db, app, user):
    owner = db.scalar(select(m.User).where(m.User.id == app.owner_id).with_for_update())
    effective_at = m.now()
    if app.kind == "enrollment":
        if family_for_user(db, owner) or owner.person_id:
            raise HTTPException(409, "This account already has a person/family record")
        values = validate_model(s.Enrollment, app.payload)
        family = m.Family(public_id=opaque_public("GKS"), district=app.district, address=values.address.model_dump())
        db.add(family)
        db.flush()
        created = []
        for member in values.members:
            person = m.Person(public_id=opaque_public("GKP"), name=member.name, name_gu=member.name_gu, dob=member.dob)
            db.add(person)
            db.flush()
            db.add(m.Membership(family_id=family.id, person_id=person.id, relationship=member.relationship))
            created.append((person, member))
            if member.relationship == "self":
                owner.person_id = person.id
                owner.district = app.district
                owner.display_name = member.name
                db.add(m.Representative(family_id=family.id, person_id=person.id))
        for person, member in created:
            if member.relationship in {"child", "grandchild"}:
                minor_representation(db, owner.person_id, person)
        app.family_id = family.id
        # Newly issued ID becomes an authentication alias only for the reviewed owner.
        existing_auth = db.scalar(select(m.AuthIdentifier).where(m.AuthIdentifier.user_id == owner.id).limit(1))
        if existing_auth:
            db.add(m.AuthIdentifier(user_id=owner.id, identifier_hash=digest(family.public_id), identifier_type="family_id", masked_destination=existing_auth.masked_destination))
        old, new = {}, {"family_id": family.id, "member_count": len(created), "address": family.address}
    else:
        family, values = validate_change(db, app, owner)
        require_revision(family, app.family_revision)
        old, new = {}, app.payload
        if app.kind == "address":
            old = {"address": family.address}
            family.address = values.address.model_dump()
            family.district = values.address.district
            for member, _ in active_members(db, family.id):
                linked = db.scalar(select(m.User).where(m.User.person_id == member.id))
                if linked:
                    linked.district = family.district
        elif app.kind == "name":
            person = db.get(m.Person, values.person_id)
            old = {"name": person.name, "name_gu": person.name_gu}
            person.name, person.name_gu = values.name, values.name_gu
            person.revision += 1
            if person.id == owner.person_id:
                owner.display_name = values.name
        elif app.kind == "add_member":
            member = values.member
            person = m.Person(public_id=opaque_public("GKP"), name=member.name, name_gu=member.name_gu, dob=member.dob)
            db.add(person)
            db.flush()
            db.add(m.Membership(family_id=family.id, person_id=person.id, relationship=member.relationship, reason="reviewed_addition"))
            minor_representation(db, owner.person_id, person)
            new = {"person_id": person.id, **new}
        elif app.kind == "death":
            person = db.get(m.Person, values.person_id)
            old = {"status": person.status, "death_date": None}
            person.status, person.death_date = "deceased", values.effective_date
            effective_at = datetime.combine(values.effective_date, time.min, tzinfo=timezone.utc)
            person.revision += 1
            # Membership history remains. Benefits are not cancelled by registry.
        elif app.kind == "representative":
            previous = db.scalar(select(m.Representative).where(m.Representative.family_id == family.id, m.Representative.valid_to.is_(None)).with_for_update())
            old = {"person_id": previous.person_id}
            previous.valid_to = m.now()
            db.flush()
            db.add(m.Representative(family_id=family.id, person_id=values.person_id))
        family.revision += 1
        family.updated_at = m.now()
    db.add(m.FactHistory(family_id=family.id, person_id=app.payload.get("person_id"), application_id=app.id, fact_type=app.kind, old_value=jsonable_encoder(old), new_value=jsonable_encoder(new), effective_at=effective_at))
    outbox(db, "registry.family_issued" if app.kind == "enrollment" else "registry.family_changed", family.id, {"family_id": family.id, "revision": family.revision, "change_type": app.kind, "application_id": app.id, "effective_at": effective_at.isoformat(), "mode": "synthetic", "does_not_cancel_benefits": True})
    transition(db, app, user, "implemented", "implement", "Registry transaction completed; department entitlement decisions remain separate")

def review_authorized(db, application_id, user, action):
    allowed_roles = {
        "start_review": {"verifier"}, "request_information": {"verifier", "approver"},
        "verify": {"verifier"}, "approve": {"approver"}, "reject": {"verifier", "approver"},
    }
    if user.role not in allowed_roles.get(action, set()):
        raise HTTPException(403, "This workflow action requires a different role")
    app = application_access(db, application_id, user, lock=True)
    if app.owner_id == user.id or app.submitted_by == user.id:
        raise HTTPException(403, "You cannot review your own or your own assisted application")
    return app

def review(db, app, user, values):
    require_revision(app, values.revision)
    if app.owner_id == user.id or app.submitted_by == user.id:
        raise HTTPException(403, "You cannot review your own or your own assisted application")
    action = values.action
    role_states = {
        "start_review": ({"verifier"}, {"submitted", "appealed"}, "under_verification"),
        "request_information": ({"verifier", "approver"}, {"submitted", "under_verification", "verified", "appealed"}, "needs_information"),
        "verify": ({"verifier"}, {"under_verification"}, "verified"),
        "approve": ({"approver"}, {"verified"}, "approved"),
        "reject": ({"verifier", "approver"}, {"submitted", "under_verification", "verified", "appealed"}, "rejected"),
    }
    roles, states, target = role_states[action]
    if user.role not in roles:
        raise HTTPException(403, "This workflow action requires a different role")
    if app.status not in states:
        raise HTTPException(409, "This action is not allowed in the current application state")
    if action == "verify":
        app.verified_by = user.id
    if action == "approve":
        if not app.verified_by or app.verified_by == user.id:
            raise HTTPException(403, "Independent verification is required before approval")
        app.approved_by = user.id
    transition(db, app, user, target, action, values.reason)
    if action == "approve":
        implement(db, app, user)
    return app_dict(db, app)

def scheme_dict(scheme):
    return plain(scheme, "id slug name name_gu category department summary summary_gu benefit_type eligibility documents application_url source_url status capability updated_at revision")

def benefit_dict(db, benefit):
    scheme, person = db.get(m.Scheme, benefit.scheme_id), db.get(m.Person, benefit.person_id)
    return {**plain(benefit, "id department benefit_type amount currency quantity unit period status reported_at event_date source_reference"), "scheme_name": scheme.name, "person_name": person.name, "coverage_note": "Synthetic source-reported event. Missing entries do not prove ineligibility; no real payment is performed."}

def grievance_dict(grievance):
    return plain(grievance, "id reference application_id district category subject description status response history revision created_at updated_at")

def client_dict(client):
    return plain(client, "id name purpose requested_scopes approved_scopes approved_scheme_ids district status created_at expires_at")
