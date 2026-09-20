"""Independent black-box security/business regressions against a synthetic server.

Run: KUTUMB_TEST_BASE_URL=http://127.0.0.1:8005 .venv/bin/python -m pytest \
     tests/security/test_http_security.py -q

Only creates synthetic, uniquely named test records. Never drops/resets a DB or
changes seeded family membership. Refuses a server that is not synthetic_demo.
"""
from concurrent.futures import ThreadPoolExecutor
import os
import secrets
from uuid import uuid4

import httpx
import pytest


BASE = os.getenv("KUTUMB_TEST_BASE_URL", "http://127.0.0.1:8005").rstrip("/")
API = BASE + "/api/v1"
PASSWORD = "DemoPass@123!"


@pytest.fixture(scope="module", autouse=True)
def synthetic_only():
    response = httpx.get(API + "/health", timeout=10)
    assert response.status_code == 200, response.text
    assert response.json().get("mode") == "synthetic_demo", "Refusing real-data server"


def client() -> httpx.Client:
    return httpx.Client(base_url=API, timeout=20, headers={"Origin": BASE})


def attach_csrf(session: httpx.Client, response: httpx.Response) -> dict:
    assert response.status_code in {200, 201}, response.text
    data = response.json()
    session.headers["X-CSRF-Token"] = data["csrf_token"]
    return data


@pytest.fixture(scope="module")
def actors():
    result = {}
    for role, email in {
        "resident": "resident@demo.local",
        "other": "other.resident@demo.local",
        "operator": "operator@demo.local",
        "verifier": "verifier@demo.local",
        "approver": "approver@demo.local",
        "admin": "admin@demo.local",
    }.items():
        session = client()
        attach_csrf(session, session.post("/auth/login", json={"email": email, "password": PASSWORD}))
        result[role] = session
    yield result
    for session in result.values():
        session.close()


@pytest.fixture(scope="module")
def isolated_resident():
    session = client()
    email = f"security-{uuid4().hex}@synthetic.local"
    data = attach_csrf(session, session.post("/auth/register", json={
        "email": email, "password": PASSWORD,
        "display_name": "Synthetic Security Resident", "language": "en",
    }))
    yield session, email, data["user"]
    session.close()


def test_private_views_require_authentication():
    with client() as anonymous:
        for path in ["/dashboard", "/applications", "/families/mine", "/benefits", "/payments", "/admin/audit"]:
            response = anonymous.get(path)
            assert response.status_code == 401, (path, response.status_code)
            assert "no-store" in response.headers.get("cache-control", "")


def test_resident_cannot_escalate_role_during_registration():
    with client() as anonymous:
        response = anonymous.post("/auth/register", json={
            "email": f"invalid-role-{uuid4().hex}@synthetic.local", "password": PASSWORD,
            "display_name": "Synthetic Role Test", "language": "en", "role": "admin",
        })
        assert response.status_code == 422
        assert PASSWORD not in response.text


def test_wrong_otp_attempts_remain_committed_after_rejection():
    with client() as anonymous:
        mobile = "9" + f"{secrets.randbelow(10**9):09d}"
        created = anonymous.post("/auth/challenges", json={
            "identifier": mobile, "purpose": "register", "display_name": "Synthetic OTP Attempts", "language": "en",
        })
        assert created.status_code == 200, created.text
        challenge_id = created.json()["challenge_id"]
        for _ in range(5):
            response = anonymous.post("/auth/verify", json={"challenge_id": challenge_id, "code": "000000"})
            assert response.status_code == 401
        correct_after_limit = anonymous.post("/auth/verify", json={"challenge_id": challenge_id, "code": "123456"})
        assert correct_after_limit.status_code == 401, "Failed-attempt transaction rolled back"
        assert anonymous.get("/auth/me").status_code == 401


def test_otp_can_be_consumed_only_once_under_concurrency():
    with client() as anonymous:
        mobile = "9" + f"{secrets.randbelow(10**9):09d}"
        created = anonymous.post("/auth/challenges", json={
            "identifier": mobile, "purpose": "register", "display_name": "Synthetic OTP Race", "language": "en",
        })
        assert created.status_code == 200, created.text
        body = {"challenge_id": created.json()["challenge_id"], "code": "123456"}
    def verify_once():
        with client() as fresh:
            return fresh.post("/auth/verify", json=body)
    with ThreadPoolExecutor(max_workers=3) as executor:
        responses = list(executor.map(lambda _: verify_once(), range(3)))
    statuses = [response.status_code for response in responses]
    assert statuses.count(200) == 1, [(r.status_code, r.text) for r in responses]
    assert statuses.count(401) == 2


def test_csrf_and_cross_origin_are_enforced(actors):
    resident = actors["resident"]
    body = {"reference": "GKS-NOT-A-REAL-RECORD"}
    absent = resident.post("/registry/check", json=body, headers={"X-CSRF-Token": ""})
    assert absent.status_code == 403
    foreign = resident.post("/registry/check", json=body, headers={"Origin": "https://untrusted.invalid"})
    assert foreign.status_code == 403


def test_foreign_family_and_registry_enumeration_are_denied(actors):
    own = actors["resident"].get("/families/mine").json()
    foreign = actors["other"].get("/families/" + own["id"])
    assert foreign.status_code in {403, 404}
    known = actors["other"].post("/registry/check", json={"reference": own["public_id"]})
    unknown = actors["other"].post("/registry/check", json={"reference": "GKS-UNKNOWN-SECURITY"})
    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json(), "Lookup revealed another family's existence"


def test_other_adult_dob_and_benefits_not_in_family_wide_view(actors):
    family = actors["resident"].get("/families/mine").json()
    spouse = next(item for item in family["members"] if item["relationship"] == "spouse")
    assert spouse["dob"] is None
    reports = actors["resident"].get("/benefits").json()["items"]
    assert not any(item["person_name"] == spouse["name"] for item in reports)
    private_name_change = actors["resident"].post("/changes", json={
        "family_id": family["id"], "change_type": "name",
        "payload": {"person_id": spouse["id"], "name": "Unauthorized synthetic edit", "name_gu": ""},
    })
    assert private_name_change.status_code == 403


@pytest.mark.parametrize("category", ["privacy", "staff_conduct"])
def test_sensitive_grievances_are_owner_admin_only(category, actors, isolated_resident):
    resident, _, _ = isolated_resident
    created = resident.post("/grievances", json={
        "category": category, "subject": "Synthetic independent-review concern",
        "description": "Synthetic report about an assigned reviewer; must not appear in ordinary staff views.",
    })
    assert created.status_code == 201, created.text
    grievance_id = created.json()["id"]
    for role in ["operator", "verifier", "approver", "other"]:
        detail = actors[role].get("/grievances/" + grievance_id)
        assert detail.status_code in {403, 404}, (role, detail.status_code, detail.text)
        listing = actors[role].get("/grievances?page_size=100").json()["items"]
        assert not any(item["id"] == grievance_id for item in listing), role
    assert resident.get("/grievances/" + grievance_id).status_code == 200
    assert actors["admin"].get("/grievances/" + grievance_id).status_code == 200


def test_assisted_list_revokes_access_after_jurisdiction_change(actors, isolated_resident):
    owner, email, _ = isolated_resident
    operator = actors["operator"]
    created = operator.post("/applications", json={
        "kind": "enrollment", "branch": "no_ration", "district": "Ahmedabad",
        "payload": {}, "step": 1, "owner_email": email,
        "assisted_authority": "Synthetic reviewed testing authority for this case only",
    })
    assert created.status_code == 201, created.text
    draft = created.json()
    changed = owner.patch("/applications/" + draft["id"], json={
        "revision": draft["revision"], "payload": {}, "step": 1, "district": "Surat",
    })
    assert changed.status_code == 200, changed.text
    assert operator.get("/applications/" + draft["id"]).status_code in {403, 404}
    listing = operator.get("/applications?page_size=100").json()["items"]
    assert not any(item["id"] == draft["id"] for item in listing), "List bypasses detail jurisdiction check"
    assert owner.get("/applications/" + draft["id"]).status_code == 200


def test_parallel_submission_is_one_durable_intent_and_rejects_stale_payload(isolated_resident, actors):
    resident, _, _ = isolated_resident
    payload = {
        "applicant": {"name": "Synthetic Security Resident", "name_gu": "", "phone": ""},
        "address": {"address_line": "Synthetic Security Lane", "locality": "Synthetic locality", "taluka": "Ahmedabad City", "district": "Ahmedabad", "pincode": "380001"},
        "members": [{"client_id": "test-self", "name": "Synthetic Security Resident", "name_gu": "", "dob": "1988-01-12", "relationship": "self"}],
        "declarations": {"accuracy": True, "authority": True},
    }
    created = resident.post("/applications", json={"kind": "enrollment", "branch": "no_ration", "district": "Ahmedabad", "payload": payload, "step": 5})
    assert created.status_code == 201, created.text
    draft = created.json()
    cookies, headers = dict(resident.cookies), dict(resident.headers)
    intent = str(uuid4())
    def submit_once():
        with httpx.Client(base_url=API, headers=headers, cookies=cookies, timeout=20) as parallel:
            return parallel.post("/applications/" + draft["id"] + "/submit", json={"revision": draft["revision"]}, headers={"Idempotency-Key": intent})
    with ThreadPoolExecutor(max_workers=3) as executor:
        responses = list(executor.map(lambda _: submit_once(), range(3)))
    assert all(response.status_code == 200 for response in responses), [(r.status_code, r.text) for r in responses]
    assert len({response.json()["reference"] for response in responses}) == 1
    current = resident.get("/applications/" + draft["id"]).json()
    assert current["status"] == "submitted"
    assert sum(event["action"] == "submit" for event in current["events"]) == 1
    assert current["family_id"] is None
    tracked = resident.get("/applications/track", params={"reference": current["reference"]})
    assert tracked.status_code == 200, tracked.text
    assert tracked.json()["id"] == current["id"]
    foreign_track = actors["other"].get("/applications/track", params={"reference": current["reference"]})
    unknown_track = actors["other"].get("/applications/track", params={"reference": "APP-UNKNOWN-SECURITY"})
    assert foreign_track.status_code == unknown_track.status_code == 404
    assert foreign_track.json() == unknown_track.json(), "Tracking revealed a foreign case's existence"
    changed_intent = resident.post("/applications/" + draft["id"] + "/submit", json={"revision": current["revision"]}, headers={"Idempotency-Key": intent})
    assert changed_intent.status_code == 409
    stale = resident.patch("/applications/" + draft["id"], json={"revision": draft["revision"], "payload": payload, "step": 5})
    assert stale.status_code == 409


def test_logout_revokes_replayed_cookie_immediately():
    with client() as session:
        attach_csrf(session, session.post("/auth/login", json={"email": "new.resident@demo.local", "password": PASSWORD}))
        stolen_before_logout = dict(session.cookies)
        assert session.post("/auth/logout").status_code == 200
    with httpx.Client(base_url=API, cookies=stolen_before_logout, timeout=10) as replay:
        assert replay.get("/auth/me").status_code == 401


def test_quarantined_evidence_cannot_be_downloaded_or_read_cross_account(actors, isolated_resident):
    resident, _, _ = isolated_resident
    created = resident.post("/applications", json={"kind": "enrollment", "branch": "no_ration", "district": "Ahmedabad", "payload": {}, "step": 1})
    assert created.status_code == 201, created.text
    application_id = created.json()["id"]
    uploaded = resident.post("/applications/" + application_id + "/evidence", data={"evidence_type": "synthetic-proof"}, files={"file": ("synthetic.pdf", b"%PDF-1.7\nSynthetic test-only content\n%%EOF", "application/pdf")})
    assert uploaded.status_code == 201, uploaded.text
    assert uploaded.json()["status"] == "quarantined"
    evidence_id = uploaded.json()["id"]
    own_download = resident.get("/evidence/" + evidence_id + "/download")
    assert own_download.status_code == 423
    foreign_download = actors["other"].get("/evidence/" + evidence_id + "/download")
    assert foreign_download.status_code in {403, 404}
    fake_extension = resident.post("/applications/" + application_id + "/evidence", data={"evidence_type": "synthetic-proof"}, files={"file": ("unsafe.exe", b"%PDF-1.7\nNot executable, only a signature test", "application/pdf")})
    assert fake_extension.status_code == 422


def test_idempotency_replay_rechecks_current_jurisdiction(actors):
    """A cached successful response must not outlive the actor's access scope."""
    operator, verifier = actors["operator"], actors["verifier"]
    with client() as owner:
        email = f"scope-replay-{uuid4().hex}@synthetic.local"
        attach_csrf(owner, owner.post("/auth/register", json={"email": email, "password": PASSWORD, "display_name": "Synthetic Scoped Resident", "language": "en"}))
        payload = {
            "applicant": {"name": "Synthetic Scoped Resident", "name_gu": "", "phone": ""},
            "address": {"address_line": "Synthetic scope lane", "locality": "Synthetic locality", "taluka": "Ahmedabad City", "district": "Ahmedabad", "pincode": "380001"},
            "members": [{"client_id": "self", "name": "Synthetic Scoped Resident", "name_gu": "", "dob": "1985-05-05", "relationship": "self"}],
            "declarations": {"accuracy": True, "authority": True},
        }
        created = operator.post("/applications", json={"kind": "enrollment", "branch": "no_ration", "district": "Ahmedabad", "payload": payload, "step": 5, "owner_email": email, "assisted_authority": "Synthetic per-case assistance authority for security regression"})
        assert created.status_code == 201, created.text
        draft = created.json()
        key = str(uuid4())
        submit_body = {"revision": draft["revision"]}
        submitted = operator.post("/applications/" + draft["id"] + "/submit", json=submit_body, headers={"Idempotency-Key": key})
        assert submitted.status_code == 200, submitted.text
        clarification = verifier.post("/staff/applications/" + draft["id"] + "/action", json={"action": "request_information", "revision": submitted.json()["revision"], "reason": "Synthetic review: correct the current residence district"}, headers={"Idempotency-Key": str(uuid4())})
        assert clarification.status_code == 200, clarification.text
        payload["address"].update(district="Surat", taluka="Surat City", pincode="395001")
        changed = owner.patch("/applications/" + draft["id"], json={"revision": clarification.json()["revision"], "payload": payload, "step": 5, "district": "Surat"})
        assert changed.status_code == 200, changed.text
        assert operator.get("/applications/" + draft["id"]).status_code in {403, 404}
        replay = operator.post("/applications/" + draft["id"] + "/submit", json=submit_body, headers={"Idempotency-Key": key})
        assert replay.status_code in {403, 404}, "Idempotency cache bypassed current object authorization: " + replay.text
