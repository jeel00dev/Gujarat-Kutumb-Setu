from datetime import date, timedelta
from uuid import uuid4
import pytest
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from app import models as m, config, worker
from app.seed import seed

API = "/api/v1"

def intent():
    return {"Idempotency-Key": str(uuid4())}

def valid_payload(district="Ahmedabad"):
    return {"applicant": {"name": "Kavya Shah", "name_gu": "કાવ્યા શાહ", "phone": "9000000002"}, "address": {"address_line": "20 Synthetic Road", "locality": "Test locality", "taluka": "City", "district": district, "pincode": "380001"}, "members": [{"client_id": "self-1", "name": "Kavya Shah", "name_gu": "કાવ્યા શાહ", "dob": "1992-01-15", "relationship": "self"}, {"client_id": "child-1", "name": "Reva Shah", "name_gu": "રેવા શાહ", "dob": "2018-02-03", "relationship": "child"}], "declarations": {"accuracy": True, "authority": True}}

def create(client, payload=None, district="Ahmedabad"):
    response = client.post(f"{API}/applications", json={"kind": "enrollment", "branch": "no_ration", "district": district, "payload": payload or valid_payload(district), "step": 6})
    assert response.status_code == 201, response.text
    return response.json()

def submit(client, application):
    response = client.post(f"{API}/applications/{application['id']}/submit", json={"revision": application["revision"]}, headers=intent())
    assert response.status_code == 200, response.text
    return response.json()

def action(client, application, operation):
    response = client.post(f"{API}/staff/applications/{application['id']}/action", json={"action": operation, "reason": "Synthetic documents and authority reviewed", "revision": application["revision"]}, headers=intent())
    assert response.status_code == 200, response.text
    return response.json()

def approve(environment, application):
    client, _ = environment
    verifier, approver = client("verifier@demo.local"), client("approver@demo.local")
    application = action(verifier, application, "start_review")
    application = action(verifier, application, "verify")
    return action(approver, application, "approve")

def test_public_and_openapi(environment):
    client, _ = environment
    browser = client()
    assert browser.get(f"{API}/health").json()["status"] == "ok"
    config_response = browser.get(f"{API}/public/config").json()
    assert "Vav-Tharad" in config_response["districts"]
    assert len(config_response["districts"]) == 34
    assert browser.get(f"{API}/public/content/privacy").status_code == 200
    assert browser.get(f"{API}/schemes").json()["total"] >= 6
    paths = browser.get(f"{API}/openapi.json").json()["paths"]
    assert "/api/v1/payments" in paths
    assert browser.get("/docs").status_code == 404

def test_password_csrf_logout_and_no_store(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    assert "HttpOnly" in browser.cookies.jar._cookies["testserver.local"]["/api/v1"]["kutumb_session"]._rest
    response = browser.get(f"{API}/auth/me")
    assert response.headers["Cache-Control"] == "no-store"
    csrf = browser.headers.pop("X-CSRF-Token")
    assert browser.post(f"{API}/auth/logout").status_code == 403
    browser.headers["X-CSRF-Token"] = csrf
    assert browser.post(f"{API}/auth/logout").status_code == 200
    assert browser.get(f"{API}/auth/me").status_code == 401

def test_cross_site_login_blocked(environment):
    client, _ = environment
    result = client().post(f"{API}/auth/login", json={"email": "resident@demo.local", "password": "DemoPass@123!"}, headers={"Origin": "https://evil.invalid"})
    assert result.status_code == 403

def test_expired_session_denied(environment):
    client, factory = environment
    browser = client("resident@demo.local")
    with factory.begin() as db:
        for session in db.scalars(select(m.AuthSession)):
            session.expires_at = m.now() - timedelta(seconds=1)
    assert browser.get(f"{API}/auth/me").status_code == 401

def test_registration_cannot_choose_role(environment):
    client, _ = environment
    response = client().post(f"{API}/auth/register", json={"email": "new@synthetic.local", "password": "LongDemoPass123!", "display_name": "Test", "role": "admin"})
    assert response.status_code == 422

def test_otp_one_time_and_attempt_limits(environment):
    client, factory = environment
    browser = client()
    challenge = browser.post(f"{API}/auth/challenges", json={"identifier": "9000000001", "purpose": "sign_in"}).json()
    assert challenge["delivery_mode"] == "simulated"
    assert browser.post(f"{API}/auth/verify", json={"challenge_id": challenge["challenge_id"], "code": "000000"}).status_code == 401
    result = browser.post(f"{API}/auth/verify", json={"challenge_id": challenge["challenge_id"], "code": "123456"})
    assert result.status_code == 200, result.text
    assert result.json()["user"]["email"] == "resident@demo.local"
    assert browser.post(f"{API}/auth/verify", json={"challenge_id": challenge["challenge_id"], "code": "123456"}).status_code == 401
    with factory() as db:
        row = db.get(m.AuthChallenge, challenge["challenge_id"])
        assert row.attempts == 2 and row.consumed

def test_otp_fifth_wrong_attempt_locks(environment):
    client, _ = environment
    browser = client()
    challenge = browser.post(f"{API}/auth/challenges", json={"identifier": "9000000002", "purpose": "sign_in"}).json()
    for _ in range(5):
        assert browser.post(f"{API}/auth/verify", json={"challenge_id": challenge["challenge_id"], "code": "000000"}).status_code == 401
    assert browser.post(f"{API}/auth/verify", json={"challenge_id": challenge["challenge_id"], "code": "123456"}).status_code == 401

def test_unknown_family_id_does_not_grant_access(environment):
    client, _ = environment
    browser = client()
    challenge = browser.post(f"{API}/auth/challenges", json={"identifier": "GKS-NOT-REAL", "purpose": "sign_in"}).json()
    assert browser.post(f"{API}/auth/verify", json={"challenge_id": challenge["challenge_id"], "code": "123456"}).status_code == 401

def test_new_mobile_account_has_no_family_authority(environment):
    client, _ = environment
    browser = client()
    challenge = browser.post(f"{API}/auth/challenges", json={"identifier": "9000012345", "purpose": "register", "display_name": "Synthetic User", "language": "gu"}).json()
    response = browser.post(f"{API}/auth/verify", json={"challenge_id": challenge["challenge_id"], "code": "123456"})
    assert response.status_code == 200
    assert response.json()["user"]["person_id"] is None
    assert response.json()["user"]["language"] == "gu"
    assert browser.get(f"{API}/families/mine").status_code == 404

def test_unconfigured_identity_provider_fails_closed(environment, monkeypatch):
    client, _ = environment
    monkeypatch.setattr(config, "IDENTITY_PROVIDER", "government")
    assert client().post(f"{API}/auth/challenges", json={"identifier": "9000000001", "purpose": "sign_in"}).status_code == 503

def test_full_enrollment_atomic_approval_and_stable_ids(environment):
    client, factory = environment
    browser = client("new.resident@demo.local")
    application = create(browser)
    assert application["reference"] is None
    assert browser.get(f"{API}/applications/{application['id']}/receipt").status_code == 409
    application = submit(browser, application)
    assert application["reference"].startswith("APP-") and application["family_id"] is None
    assert browser.get(f"{API}/applications/{application['id']}/receipt").status_code == 200
    implemented = approve(environment, application)
    assert implemented["status"] == "implemented"
    assert [event["to_status"] for event in implemented["events"]][-2:] == ["approved", "implemented"]
    family = browser.get(f"{API}/families/mine").json()
    assert family["public_id"].startswith("GKS-") and len(family["members"]) == 2
    assert browser.post(f"{API}/applications", json={"payload": valid_payload()}).status_code == 409
    with factory() as db:
        assert db.scalar(select(func.count()).select_from(m.FactHistory).where(m.FactHistory.application_id == implemented["id"])) == 1
        assert db.scalar(select(m.Outbox.id).where(m.Outbox.aggregate_id == family["id"], m.Outbox.event_type == "registry.family_issued"))

def test_submission_idempotency_and_key_payload_mismatch(environment):
    client, _ = environment
    browser = client("new.resident@demo.local")
    application = create(browser)
    key = intent()
    path = f"{API}/applications/{application['id']}/submit"
    first = browser.post(path, json={"revision": application["revision"]}, headers=key)
    second = browser.post(path, json={"revision": application["revision"]}, headers=key)
    assert first.status_code == second.status_code == 200 and first.json() == second.json()
    assert browser.post(path, json={"revision": application["revision"] + 1}, headers=key).status_code == 409

def test_stale_draft_conflict(environment):
    client, _ = environment
    browser = client("new.resident@demo.local")
    application = create(browser)
    body = {"revision": application["revision"], "payload": valid_payload(), "step": 4}
    assert browser.patch(f"{API}/applications/{application['id']}", json=body).status_code == 200
    assert browser.patch(f"{API}/applications/{application['id']}", json=body).status_code == 409

@pytest.mark.parametrize("mutate", ["future", "no_self", "missing_address", "false_declaration", "minor_self"])
def test_invalid_enrollment_cannot_submit(environment, mutate):
    client, _ = environment
    browser = client("new.resident@demo.local")
    payload = valid_payload()
    if mutate == "future":
        payload["members"][1]["dob"] = "2099-01-01"
    elif mutate == "no_self":
        payload["members"][0]["relationship"] = "spouse"
    elif mutate == "missing_address":
        payload["address"]["address_line"] = ""
    elif mutate == "false_declaration":
        payload["declarations"]["authority"] = False
    else:
        payload["members"][0]["dob"] = "2020-01-01"
    application = create(browser, payload)
    assert browser.post(f"{API}/applications/{application['id']}/submit", json={"revision": application["revision"]}, headers=intent()).status_code == 422

def test_sensitive_extra_data_rejected_before_draft(environment):
    client, _ = environment
    browser = client("new.resident@demo.local")
    payload = valid_payload()
    payload["members"][0]["aadhaar_number"] = "000000000000"
    assert browser.post(f"{API}/applications", json={"payload": payload}).status_code == 422

def test_resident_cross_object_and_staff_scope_denied(environment):
    client, _ = environment
    owner = client("new.resident@demo.local")
    app = submit(owner, create(owner, district="Surat"))
    stranger = client("resident@demo.local")
    assert stranger.get(f"{API}/applications/{app['id']}").status_code == 404
    verifier = client("verifier@demo.local")
    assert verifier.get(f"{API}/applications/{app['id']}").status_code == 404
    assert all(row["id"] != app["id"] for row in verifier.get(f"{API}/staff/applications").json()["items"])
    unrelated_family = client("other.resident@demo.local").get(f"{API}/families/mine").json()
    assert stranger.get(f"{API}/families/{unrelated_family['id']}").status_code == 404

def test_verifier_cannot_approve_and_approver_cannot_verify(environment):
    client, _ = environment
    browser = client("new.resident@demo.local")
    app = submit(browser, create(browser))
    verifier, approver = client("verifier@demo.local"), client("approver@demo.local")
    values = {"revision": app["revision"], "reason": "Attempt workflow bypass", "action": "approve"}
    assert verifier.post(f"{API}/staff/applications/{app['id']}/action", json=values, headers=intent()).status_code == 403
    assert approver.post(f"{API}/staff/applications/{app['id']}/action", json=values, headers=intent()).status_code == 409
    values["action"] = "verify"
    assert approver.post(f"{API}/staff/applications/{app['id']}/action", json=values, headers=intent()).status_code == 403

def test_information_response_and_appeal_keep_history(environment):
    client, _ = environment
    browser = client("new.resident@demo.local")
    verifier = client("verifier@demo.local")
    application = submit(browser, create(browser))
    application = action(verifier, application, "request_information")
    result = browser.patch(f"{API}/applications/{application['id']}", json={"revision": application["revision"], "payload": valid_payload(), "step": 6})
    application = submit(browser, result.json())
    application = action(verifier, application, "reject")
    result = browser.post(f"{API}/applications/{application['id']}/appeal", json={"revision": application["revision"], "reason": "Please reconsider the recorded decision"})
    assert result.status_code == 200 and result.json()["status"] == "appealed"
    assert len(result.json()["events"]) == 5

def test_assisted_submission_records_operator_and_authority(environment):
    client, _ = environment
    operator = client("operator@demo.local")
    invalid = operator.post(f"{API}/applications", json={"payload": valid_payload()})
    assert invalid.status_code == 422
    response = operator.post(f"{API}/applications", json={"payload": valid_payload(), "owner_email": "new.resident@demo.local", "assisted_authority": "Resident authorized synthetic assisted entry", "district": "Ahmedabad"})
    assert response.status_code == 201 and response.json()["channel"] == "assisted"
    application = submit(operator, response.json())
    owner = client("new.resident@demo.local")
    assert owner.get(f"{API}/applications/{application['id']}").status_code == 200
    assert operator.get(f"{API}/staff/applications").status_code == 403

def test_address_change_not_applied_until_approval(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    family = browser.get(f"{API}/families/mine").json()
    address = {**family["address"], "address_line": "88 Synthetic New Street"}
    draft = browser.post(f"{API}/changes", json={"family_id": family["id"], "change_type": "address", "payload": {"address": address}})
    assert draft.status_code == 201, draft.text
    assert browser.get(f"{API}/families/mine").json()["address"] != address
    approve(environment, submit(browser, draft.json()))
    updated = browser.get(f"{API}/families/mine").json()
    assert updated["address"] == address and updated["public_id"] == family["public_id"]
    assert updated["revision"] == family["revision"] + 1

def test_other_adult_private_dob_benefits_and_name_correction_denied(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    family = browser.get(f"{API}/families/mine").json()
    spouse = next(member for member in family["members"] if member["relationship"] == "spouse")
    assert spouse["dob"] is None
    benefits = browser.get(f"{API}/benefits").json()["items"]
    assert {benefit["person_name"] for benefit in benefits} == {"Mihir Patel", "Aarav Patel"}
    assert browser.post(f"{API}/changes", json={"family_id": family["id"], "change_type": "name", "payload": {"person_id": spouse["id"], "name": "New Adult Name"}}).status_code == 403

def test_unsupported_transfer_does_not_fake_success(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    family = browser.get(f"{API}/families/mine").json()
    assert browser.post(f"{API}/changes", json={"family_id": family["id"], "change_type": "transfer", "payload": {}}).status_code == 422

def test_death_of_representative_requires_successor(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    family = browser.get(f"{API}/families/mine").json()
    result = browser.post(f"{API}/changes", json={"family_id": family["id"], "change_type": "death", "payload": {"person_id": family["representative_id"], "effective_date": date.today().isoformat()}})
    assert result.status_code == 409

def test_evidence_signatures_quarantine_and_download_protection(environment):
    client, _ = environment
    browser = client("new.resident@demo.local")
    app = create(browser)
    path = f"{API}/applications/{app['id']}/evidence"
    assert browser.post(path, data={"evidence_type": "address"}, files={"file": ("bad.pdf", b"not a pdf", "application/pdf")}).status_code == 422
    result = browser.post(path, data={"evidence_type": "address"}, files={"file": ("../../safe.pdf", b"%PDF-1.4\nSynthetic fixture\n%%EOF", "application/pdf")})
    assert result.status_code == 201, result.text
    evidence = result.json()
    assert evidence["status"] == "quarantined" and evidence["filename"] == "safe.pdf"
    assert browser.get(f"{API}/evidence/{evidence['id']}/download").status_code == 423
    stranger = client("resident@demo.local")
    assert stranger.get(f"{API}/evidence/{evidence['id']}/download").status_code == 404

def test_registry_lookup_does_not_enumerate(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    other = browser.post(f"{API}/registry/check", json={"reference": "GKS-DEMO-SURAT-002"})
    missing = browser.post(f"{API}/registry/check", json={"reference": "not-real"})
    assert other.json() == missing.json()

def test_grievance_resolution_and_independent_conduct_review(environment):
    client, _ = environment
    resident = client("resident@demo.local")
    grievance = resident.post(f"{API}/grievances", json={"category": "staff_conduct", "subject": "Synthetic conduct concern", "description": "Please independently examine this test service interaction"}).json()
    verifier = client("verifier@demo.local")
    path = f"{API}/staff/grievances/{grievance['id']}/action"
    body = {"status": "in_review", "response": "Independent administrative review started"}
    assert verifier.post(path, json=body).status_code == 404
    assert verifier.get(f"{API}/grievances/{grievance['id']}").status_code == 404
    assert all(item["id"] != grievance["id"] for item in verifier.get(f"{API}/grievances").json()["items"])
    admin = client("admin@demo.local")
    assert admin.post(path, json=body).status_code == 200
    body.update(status="resolved", response="Independent review completed; written response recorded")
    assert admin.post(path, json=body).status_code == 200
    result = resident.get(f"{API}/grievances/{grievance['id']}").json()
    assert result["status"] == "resolved" and len(result["history"]) == 2

def test_scheme_referral_not_award_and_external_not_fake_apply(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    schemes = browser.get(f"{API}/schemes").json()["items"]
    external = next(row for row in schemes if row["capability"] == "external")
    assert browser.post(f"{API}/scheme-applications", json={"scheme_id": external["id"], "consent": True}, headers=intent()).status_code == 409
    connected = next(row for row in schemes if row["capability"] == "demo_connected")
    headers = intent()
    result = browser.post(f"{API}/scheme-applications", json={"scheme_id": connected["id"], "consent": True}, headers=headers)
    assert result.status_code == 201 and result.json()["status"] == "referred"
    assert browser.post(f"{API}/scheme-applications", json={"scheme_id": connected["id"], "consent": True}, headers=headers).json() == result.json()
    assert browser.post(f"{API}/scheme-applications", json={"scheme_id": connected["id"], "consent": True}, headers=intent()).status_code == 409

def test_content_revision_history_and_access_control(environment):
    client, factory = environment
    admin = client("admin@demo.local")
    content = admin.get(f"{API}/public/content/about").json()
    body = {name: content[name] for name in ["title", "title_gu", "body", "body_gu", "revision"]}
    body["body"] += " Updated test copy."
    assert client("resident@demo.local").put(f"{API}/admin/content/about", json=body).status_code == 403
    assert admin.put(f"{API}/admin/content/about", json=body).status_code == 200
    assert admin.put(f"{API}/admin/content/about", json=body).status_code == 409
    with factory() as db:
        assert db.scalar(select(func.count()).select_from(m.ContentVersion)) == 1

def test_integration_scope_purpose_jurisdiction_and_revocation(environment):
    client, _ = environment
    department = client("department@demo.local")
    purpose = "Validate family existence for synthetic service review"
    row = department.post(f"{API}/departments/clients", json={"name": "Testing source", "purpose": purpose, "requested_scopes": ["family:verify"]}).json()
    admin = client("admin@demo.local")
    approval = admin.post(f"{API}/admin/clients/{row['id']}/approve", json={}).json()
    assert "credential" in approval
    partner = client()
    partner.headers["Authorization"] = f"Bearer {approval['credential']}"
    path = f"{API}/integration/resolve"
    assert partner.post(path, json={"public_id": "GKS-DEMO-AHMEDABAD-001", "purpose": purpose}).status_code == 200
    assert partner.post(path, json={"public_id": "GKS-DEMO-SURAT-002", "purpose": purpose}).status_code == 404
    assert partner.post(path, json={"public_id": "GKS-DEMO-AHMEDABAD-001", "purpose": "different unapproved purpose"}).status_code == 403
    admin.post(f"{API}/admin/clients/{row['id']}/revoke")
    assert partner.post(path, json={"public_id": "GKS-DEMO-AHMEDABAD-001", "purpose": purpose}).status_code == 401

def test_outbox_delivery_is_durable_and_repeat_safe(environment):
    client, factory = environment
    browser = client("new.resident@demo.local")
    submit(browser, create(browser))
    assert worker.process_batch() > 0
    assert worker.process_batch() == 0
    with factory() as db:
        events = db.scalars(select(m.Outbox)).all()
        assert all(row.status == "delivered" for row in events)
        assert db.scalar(select(func.count()).select_from(m.EventDelivery)) == len(events)

def test_seed_repeat_safe_and_database_membership_constraint(environment):
    _, factory = environment
    with factory.begin() as db:
        before = db.scalar(select(func.count()).select_from(m.Person))
        seed(db)
        assert db.scalar(select(func.count()).select_from(m.Person)) == before
        membership = db.scalar(select(m.Membership).limit(1))
        with pytest.raises(IntegrityError), db.begin_nested():
            db.add(m.Membership(person_id=membership.person_id, family_id=membership.family_id, relationship="other"))
            db.flush()

def test_assisted_case_moved_out_of_scope_disappears_from_operator_list(environment):
    client, _ = environment
    operator = client("operator@demo.local")
    resident = client("new.resident@demo.local")
    response = operator.post(f"{API}/applications", json={"payload": valid_payload(), "owner_email": "new.resident@demo.local", "assisted_authority": "Resident authorized synthetic assisted entry", "district": "Ahmedabad"})
    application = response.json()
    assert response.status_code == 201
    moved = resident.patch(f"{API}/applications/{application['id']}", json={"payload": valid_payload("Surat"), "district": "Surat", "revision": application["revision"], "step": 2})
    assert moved.status_code == 200
    assert operator.get(f"{API}/applications/{application['id']}").status_code == 404
    assert all(row["id"] != application["id"] for row in operator.get(f"{API}/applications").json()["items"])

@pytest.mark.parametrize("change_type", ["name", "add_member", "death", "representative"])
def test_supported_registry_life_events_keep_ids_and_history(environment, change_type):
    client, factory = environment
    browser = client("resident@demo.local")
    family = browser.get(f"{API}/families/mine").json()
    self_person = next(person for person in family["members"] if person["relationship"] == "self")
    spouse = next(person for person in family["members"] if person["relationship"] == "spouse")
    data = {
        "name": {"person_id": self_person["id"], "name": "Mihir Synthetic Patel", "name_gu": "મિહિર પટેલ"},
        "add_member": {"member": {"name": "Isha Patel", "name_gu": "ઈશા પટેલ", "dob": "2025-01-05", "relationship": "child"}},
        "death": {"person_id": spouse["id"], "effective_date": "2026-08-01"},
        "representative": {"person_id": spouse["id"]},
    }[change_type]
    result = browser.post(f"{API}/changes", json={"family_id": family["id"], "change_type": change_type, "payload": data})
    assert result.status_code == 201, result.text
    application = approve(environment, submit(browser, result.json()))
    changed = browser.get(f"{API}/families/mine").json()
    assert changed["public_id"] == family["public_id"]
    assert {p["id"] for p in family["members"]}.issubset({p["id"] for p in changed["members"]})
    if change_type == "name":
        assert next(p for p in changed["members"] if p["id"] == self_person["id"])["name"] == data["name"]
    elif change_type == "add_member":
        assert len(changed["members"]) == len(family["members"]) + 1
    elif change_type == "death":
        assert next(p for p in changed["members"] if p["id"] == spouse["id"])["status"] == "deceased"
        with factory() as db:
            assert db.scalar(select(func.count()).select_from(m.Benefit).where(m.Benefit.person_id == spouse["id"])) == 1
            history = db.scalar(select(m.FactHistory).where(m.FactHistory.application_id == application["id"]))
            assert history.effective_at.date().isoformat() == data["effective_date"]
    else:
        assert changed["representative_id"] == spouse["id"]
        with factory() as db:
            assert db.scalar(select(func.count()).select_from(m.Representative).where(m.Representative.family_id == family["id"])) == 2

def test_pending_competing_change_cannot_overwrite_newer_registry(environment):
    client, _ = environment
    browser = client("resident@demo.local")
    family = browser.get(f"{API}/families/mine").json()
    application_ids = []
    for address_line in ["First proposed synthetic address", "Second proposed synthetic address"]:
        draft = browser.post(f"{API}/changes", json={"family_id": family["id"], "change_type": "address", "payload": {"address": {**family["address"], "address_line": address_line}}}).json()
        application_ids.append(submit(browser, draft))
    approve(environment, application_ids[0])
    verifier = client("verifier@demo.local")
    other = action(verifier, application_ids[1], "start_review")
    other = action(verifier, other, "verify")
    approver = client("approver@demo.local")
    response = approver.post(f"{API}/staff/applications/{other['id']}/action", json={"action": "approve", "reason": "Conflicting amendment attempted", "revision": other["revision"]}, headers=intent())
    assert response.status_code == 409
    assert browser.get(f"{API}/applications/{other['id']}").json()["status"] == "verified"
    assert browser.get(f"{API}/families/mine").json()["address"]["address_line"] == "First proposed synthetic address"

def test_submit_replay_rechecks_operator_scope_without_rechecking_stale_revision(environment):
    client, _ = environment
    owner, operator = client("new.resident@demo.local"), client("operator@demo.local")
    created = operator.post(f"{API}/applications", json={"payload": valid_payload(), "owner_email": "new.resident@demo.local", "assisted_authority": "Reviewed synthetic authority for this case", "district": "Ahmedabad"}).json()
    path = f"{API}/applications/{created['id']}/submit"
    headers, body = intent(), {"revision": created["revision"]}
    submitted = operator.post(path, json=body, headers=headers)
    assert submitted.status_code == 200
    # Same intent remains replayable despite its now-stale revision.
    assert operator.post(path, json=body, headers=headers).json() == submitted.json()
    requested = action(client("verifier@demo.local"), submitted.json(), "request_information")
    moved = owner.patch(f"{API}/applications/{created['id']}", json={"payload": valid_payload("Surat"), "district": "Surat", "revision": requested["revision"], "step": 6})
    assert moved.status_code == 200
    assert operator.get(f"{API}/applications/{created['id']}").status_code == 404
    assert operator.post(path, json=body, headers=headers).status_code == 404

def test_review_replay_rechecks_current_action_role(environment):
    client, factory = environment
    owner, verifier = client("new.resident@demo.local"), client("verifier@demo.local")
    application = submit(owner, create(owner))
    path = f"{API}/staff/applications/{application['id']}/action"
    headers = intent()
    body = {"action": "start_review", "revision": application["revision"], "reason": "Start a reviewed synthetic case"}
    initial = verifier.post(path, json=body, headers=headers)
    assert initial.status_code == 200
    assert verifier.post(path, json=body, headers=headers).json() == initial.json()
    with factory.begin() as db:
        user = db.scalar(select(m.User).where(m.User.email == "verifier@demo.local"))
        user.role = "approver"
    assert verifier.post(path, json=body, headers=headers).status_code == 403

def test_exact_tracking_is_owner_scoped_and_independent_of_list_pagination(environment):
    client, factory = environment
    owner = client("new.resident@demo.local")
    operator = client("operator@demo.local")
    created = operator.post(f"{API}/applications", json={"payload": valid_payload(), "owner_email": "new.resident@demo.local", "assisted_authority": "Reviewed synthetic authority for tracking", "district": "Ahmedabad"}).json()
    application = submit(operator, created)
    with factory.begin() as db:
        user = db.scalar(select(m.User).where(m.User.email == "new.resident@demo.local"))
        for index in range(25):
            db.add(m.Application(owner_id=user.id, submitted_by=user.id, district="Ahmedabad", payload={}, updated_at=m.now() + timedelta(seconds=index + 1)))
    first_page = owner.get(f"{API}/applications").json()
    assert first_page["total"] == 26
    assert all(row["id"] != application["id"] for row in first_page["items"])
    path = f"{API}/applications/track"
    assert owner.get(path, params={"reference": application["reference"]}).json()["id"] == application["id"]
    assert operator.get(path, params={"reference": application["reference"]}).status_code == 200
    stranger = client("resident@demo.local")
    foreign = stranger.get(path, params={"reference": application["reference"]})
    missing = stranger.get(path, params={"reference": "APP-UNKNOWN-NOT-A-RECORD"})
    assert foreign.status_code == missing.status_code == 404
    assert foreign.json() == missing.json()
    assert client().get(path, params={"reference": application["reference"]}).status_code == 401

@pytest.mark.parametrize("replay_operation", ["decision", "process", "reverse"])
def test_payment_cached_replay_rechecks_current_department_scheme_scope(environment, replay_operation):
    from app.payments import PaymentScope
    client, factory = environment
    resident, department = client("resident@demo.local"), client("department@demo.local")
    scheme = next(item for item in resident.get(f"{API}/schemes").json()["items"] if item["capability"] == "demo_connected")
    referral = resident.post(f"{API}/scheme-applications", json={"scheme_id": scheme["id"], "consent": True}, headers=intent()).json()
    path = f"{API}/staff/scheme-applications/{referral['id']}/decision"
    headers = intent()
    body = {"action": "sanction", "amount": "500.00", "period": "2026-09", "reason": "Synthetic reviewed service decision"}
    initial = department.post(path, json=body, headers=headers)
    assert initial.status_code == 200, initial.text
    payment = initial.json()
    if replay_operation in {"process", "reverse"}:
        path = f"{API}/staff/payments/{payment['id']}/process"
        headers = intent()
        body = {"revision": payment["revision"], "outcome": "paid", "reason": "Synthetic approved payment processing"}
        initial = department.post(path, json=body, headers=headers)
        assert initial.status_code == 200, initial.text
        payment = initial.json()
    if replay_operation == "reverse":
        path = f"{API}/staff/payments/{payment['id']}/reverse"
        headers = intent()
        body = {"revision": payment["revision"], "reason": "Synthetic authorized payment reversal"}
        initial = department.post(path, json=body, headers=headers)
        assert initial.status_code == 200, initial.text
    assert department.post(path, json=body, headers=headers).json() == initial.json()
    with factory.begin() as db:
        user = db.scalar(select(m.User).where(m.User.email == "department@demo.local"))
        grant = db.scalar(select(PaymentScope).where(PaymentScope.user_id == user.id, PaymentScope.scheme_id == scheme["id"]))
        db.delete(grant)  # Only this test's isolated SQLite fixture is mutated.
    assert department.post(path, json=body, headers=headers).status_code == 404

def test_integration_cached_benefit_rechecks_current_approved_scheme_scope(environment):
    client, factory = environment
    department, admin = client("department@demo.local"), client("admin@demo.local")
    resident = client("resident@demo.local")
    scheme = next(item for item in resident.get(f"{API}/schemes").json()["items"] if item["capability"] == "demo_connected")
    person_id = resident.get(f"{API}/auth/me").json()["user"]["person_id"]
    request = department.post(f"{API}/departments/clients", json={"name": "Reporting test", "purpose": "Report authorized synthetic benefit events", "requested_scopes": ["benefits:write"]}).json()
    approval = admin.post(f"{API}/admin/clients/{request['id']}/approve", json={"approved_scheme_ids": [scheme["id"]]}).json()
    partner = client()
    partner.headers["Authorization"] = f"Bearer {approval['credential']}"
    body = {"person_id": person_id, "scheme_id": scheme["id"], "source_reference": "TEST-REPLAY-SCOPE-001", "benefit_type": "service", "period": "2026-09", "status": "reported", "event_date": "2026-09-01"}
    headers = intent()
    path = f"{API}/integration/benefits"
    initial = partner.post(path, json=body, headers=headers)
    assert initial.status_code == 201, initial.text
    assert partner.post(path, json=body, headers=headers).json() == initial.json()
    with factory.begin() as db:
        row = db.get(m.IntegrationClient, request["id"])
        row.approved_scheme_ids = []
    assert partner.post(path, json=body, headers=headers).status_code == 403
