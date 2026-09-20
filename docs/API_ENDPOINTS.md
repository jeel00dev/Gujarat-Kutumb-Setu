# API operations and business-rule mapping

Base path: **`/api/v1`**, same origin as the frontend. These endpoints implement use cases, not unrestricted CRUD over every database table. See [shared request/response contract](IMPLEMENTATION_CONTRACT.md), [business rules](BUSINESS_RULES_AND_OPERATIONS.md), [generated OpenAPI snapshot](openapi.json) and runtime **`/api/v1/openapi.json`**. On 20 September 2026, the final running backend exposed **56 operation paths / 63 method-path operations**; every operation was reconciled to this catalog. The schema-document endpoint itself is available but not included in its own path list.

**Current schema limitation:** request bodies/parameters are generated from typed validation models, but the final audited build's 63 successful JSON response schemas are unconstrained `{}` because handlers do not declare response models. The narrative implementation contract, frontend types and executable tests define current response shapes. Do not claim full machine-checkable response conformance; explicit response models and consumer conformance tests are an external-integration release gate.

The frontend is the intended product surface. Government-ID/mobile verification and government-source reporting are provider adapters: this local environment uses **synthetic simulated providers**, not actual UIDAI, SMS or payment connections. Staff access is distinct from resident access. Any retained email/password test-account endpoint is a test/staff mechanism, not a redesign of the public resident journey.

## 1. Common contract

| Concern | Rule |
|---|---|
| Authentication | Expiring server session in HttpOnly cookie. Integration calls use an approved scoped bearer credential. Never put credentials in URLs. |
| CSRF | Cookie-authenticated unsafe methods send `X-CSRF-Token`, obtained through the access/session flow. |
| Idempotency | `Idempotency-Key` for submission, review decisions and connected referrals; same intent retains the same key across retries. Integration source events have their own stable source transaction ID. |
| Concurrency | Mutable case/content/scheme commands carry `revision`; stale state returns 409. The client must not manufacture a higher revision. |
| IDs/dates | Opaque identifiers as strings; date-only ISO dates; timestamp instants in UTC; distinguish display/reference/internal ID. |
| Lists | `{items,total,page,page_size}` with server-bounded page size. Staff search is jurisdiction-scoped; production cursor pagination may be added compatibly for large histories. |
| Errors | Safe `detail` and optional machine `code`, or validated field-error list. 401/403/404/409/422/429 represent different recovery paths. |
| Privacy | Private responses `Cache-Control: no-store`; only approved fields serialized. Masking in CSS is not authorization. |
| URLs/content | Plain content or sanitized approved format; HTTPS official source/application URLs under validated policy. No arbitrary script/iframe or server fetch from untrusted editor URLs. |
| Environment | Config identifies simulated providers. No production request silently falls back to fake fixtures. |

## 2. Public and access operations

| Method/path | Operation and authority | Business rules |
|---|---|---|
| `GET /health` | Service/database readiness with safe mode metadata; no secrets. | BR-33, 40. |
| `GET /public/config` | Public name/locales/features/notices/policy/assistance configuration. | BR-25, 32, 39–40. |
| `GET /public/content/{slug}` | Published bilingual about/help/accessibility/privacy/terms/services/contact. | BR-32. |
| `GET /schemes` | Search/filter/paginate published catalogue. | BR-25–26. |
| `GET /schemes/{slug}` | Scheme source, owner, capability, conditions and actual destination. | BR-25–27. |
| `GET /auth/demo-accounts` | Synthetic test helper only; disabled outside its test environment. | BR-02, 40. |
| `POST /auth/challenges` | Purpose (`sign_in`/`register`), Family ID or mobile and conditional registration fields → opaque challenge/masked destination/expiry. | BR-01–05, 40. |
| `POST /auth/verify` | Opaque challenge + OTP → protected session only after server expiry/attempt/one-time checks. | BR-01–05, 40. |
| `POST /auth/login` | Staff/test email-password session; no role selected by user. | BR-04–05. |
| `POST /auth/register` | Environment-gated synthetic resident-account helper, fixed resident role. | BR-01–05, 40. |
| `GET /auth/me` | Current minimized actor/session/CSRF state. | BR-04–05. |
| `POST /auth/logout` | Revoke session, clear cookie; CSRF checked. | BR-05. |

The identity-challenge endpoints use the current shared contract/OpenAPI. A challenge request records purpose, method, expiry and attempt policy; verification consumes an opaque challenge and test OTP, then establishes the same session contract. Provider assurance and authority remain distinct. An unimplemented production provider cannot be enabled merely to match a screen.

## 3. Resident applications and registry

| Method/path | Operation / input | Authorization and result | Rules |
|---|---|---|---|
| `GET /dashboard` | Current actor's task summary. | Own/role-minimized family, applications and notifications. | BR-04, 29, 39. |
| `GET /applications` | Own paginated applications. | Resident owner or current-jurisdiction assisted scope; not statewide queue. Losing scope also denies cached idempotent responses. | BR-04, 06. |
| `GET /applications/track?reference=...` | Exact reference lookup independent of list pagination. | Signed-in owner or currently authorized assisted operator only; foreign and unknown references both return the same 404, with no public private-case search. | BR-04, 10–11, 15. |
| `POST /applications` | New enrollment draft: branch, district, step, payload. | Persisted draft, no permanent ID; server ownership. | BR-06–09. |
| `GET /applications/{id}` | Case and transition history. | Owner or authorized staff only. | BR-04, 12, 15–16. |
| `PATCH /applications/{id}` | Revision + mutable draft/information payload. | Versioned saved state; immutable/protected fields rejected. | BR-06, 08–09, 13, 15. |
| `POST /applications/{id}/submit` | Revision + idempotency header. | Validated submitted case/reference; atomic audit/event. | BR-06, 08–11, 13–14. |
| `POST /applications/{id}/withdraw` | Revision + reason. | Allowed pre-implementation case action; retained history. | BR-13, 16. |
| `POST /applications/{id}/appeal` | Revision + grounds. | Rejected owned case enters review path, not auto approval. | BR-13, 16. |
| `GET /applications/{id}/receipt` | Protected receipt data. | Actual committed application/ref/time, not an invented card. | BR-04, 10–11. |
| `POST /applications/{id}/evidence` | Multipart file + evidence type. | Owner/authorized case; signature/size/path checks; quarantine. | BR-04, 22–23. |
| `GET /applications/{id}/evidence` | Metadata list. | Same case scope; no public object-store URLs. | BR-04, 22. |
| `GET /evidence/{id}/download` | Protected file delivery. | Foreign case denied; authorized access returns **423 while quarantined**. No scanner/release adapter is configured locally, so signature validation alone never enables download. | BR-04, 22–23. |
| `GET /families/mine` | Current authorized family summary. | 404 if no approved family; no sensitive adult dossier. | BR-01, 04, 11, 17. |
| `GET /families/{id}` | Authorized family summary. | Guessed foreign UUID/public ID does not grant access. | BR-04, 17. |
| `POST /registry/check` | Approved synthetic reference. | Own existing/no-match/review-required; no enumeration. | BR-04, 07. |
| `POST /changes` | Family ID, supported type, proposed payload. | New controlled application; current fact unchanged. | BR-13, 17–20. |
| `GET /notifications` | Own bounded notices. | Safe actual persisted messages. | BR-04, 33–34. |
| `POST /notifications/{id}/read` | Mark own item read. | Foreign notification denied. | BR-04–05. |
| `GET /access-history` | Own safe authority/purpose/time entries. | No other adult's restricted event details. | BR-04, 33. |

No generic `DELETE /persons/{id}` or unreviewed `PATCH /families/{id}` is exposed to bypass life-event review. No public application-reference endpoint returns private details without an access challenge.

## 4. Staff review and grievances

| Method/path | Operation | Authority / rule mapping |
|---|---|---|
| `GET /staff/applications` | Status/search/bounded queue. | Role + jurisdiction; BR-04, 12, 39. |
| `POST /staff/applications/{id}/action` | `start_review`, `request_information`, `verify`, `approve`, `reject`; reason + revision + idempotency. | Explicit state/role matrix, anti-self-approval; BR-10–20. |
| `GET /staff/reports` | Scoped operational counts/freshness. | No public census/statutory population claim; BR-39. |
| `GET /grievances` | Own or permitted staff cases. | Privacy/staff-conduct categories owner+admin only; ordinary case staff scope uses jurisdiction; BR-04, 24. |
| `POST /grievances` | Category, subject, description, optional application. | No permanent ID prerequisite; BR-24. |
| `GET /grievances/{id}` | Allowed case detail/response/history. | Foreign/accused-operator access restricted; BR-04, 24. |
| `POST /staff/grievances/{id}/action` | `in_review`, `resolved`, `reopened` + response. | Permitted reviewer and transition; history/reason; BR-24, 33. |

## 5. Schemes, clients and benefit reporting

| Method/path | Operation | Authority / rule mapping |
|---|---|---|
| `GET /recommendations` | Deterministic possibly relevant/missing-evidence results. | Own authorized scope, not final eligibility; BR-25–26. |
| `POST /scheme-applications` | Scheme ID, necessary authority/consent + idempotency. | Only connected simulated capability, persistent referral; BR-10, 25–27. |
| `GET /scheme-applications` | Own referrals and actual current state. | BR-04, 27–29. |
| `GET /benefits` | Own/represented authorized source-report history. | Named subject, type/status/source/freshness; BR-28–29. |
| `GET /payments` | Own/represented authorized payment orders. | Decimal-string amounts, source/provider and actual event history; BR-28–29, 41. |
| `GET /payments/{id}` | Permitted transaction detail. | Object/representation or scoped officer authorization; BR-04, 28–29, 41. |
| `GET /staff/payments` | Scoped officer payment queue. | Explicit scheme grants and jurisdiction; BR-30, 41. |
| `GET /staff/scheme-applications` | Scoped referral/decision queue. | Department/admin scope; BR-25–30, 41. |
| `POST /staff/scheme-applications/{id}/decision` | Sanction/reject + reason, positive exact amount and period for sanction; idempotency. | One order per approved referral, no self-decision; BR-10, 28, 41. |
| `POST /staff/payments/{id}/process` | Revision + idempotency; simulator process result. | Sanctioned/failed only; paid status only after provider result commits; BR-13–14, 28, 40–41. |
| `POST /staff/payments/{id}/reverse` | Revision + mandatory reason + idempotency. | Paid only, preserve original history; BR-13–14, 28, 41. |
| `GET /departments/clients` | Owner's client requests/approved metadata. | No reusable secret disclosure; BR-30. |
| `POST /departments/clients` | Name, purpose, requested scopes. | Pending request; no self-issued active permission; BR-30–31. |
| `POST /admin/clients/{id}/approve` | Approve bounded scopes/schemes under policy. | Admin; credential returned once, hash stored; BR-30. |
| `POST /admin/clients/{id}/revoke` | Revoke client. | Admin; immediate server enforcement; BR-30. |
| `POST /integration/resolve` | Public ID + approved purpose. | Bearer scope `family:verify`, district/purpose checks; minimal status/member count/as-of; BR-04, 30–31. |
| `POST /integration/benefits` | Validated person/scheme/source-event report. | Scope `benefits:write`, approved scheme/jurisdiction; unique transaction; BR-28–31. |

Changing a public scheme label or `capability` must not make an unapproved government provider active. Real adapters require signed field/purpose contracts and a tested enabled-provider configuration. Simulated payment/report state is persisted and auditable; no actual money moves.

## 6. Administration and contracts

| Method/path | Operation | Authority / rules |
|---|---|---|
| `GET /admin/overview` | Counts and safe queue/outbox/audit health. | Admin; BR-33–34, 39. |
| `GET /admin/audit` | Bounded purpose-limited audit view. | Admin/audit authority, no uncontrolled full export; BR-33. |
| `GET /admin/content` | Editable content/version list. | Authorized editor/admin; BR-32. |
| `PUT /admin/content/{slug}` | Bilingual plain content + revision. | Retain history, reject stale/conflicting edit; BR-13, 32. |
| `GET /admin/schemes` | Managed scheme records. | Authorized admin; BR-25, 32. |
| `POST /admin/schemes` | Validated bilingual/source-owned scheme definition. | No automatic official connector; BR-25, 32, 40. |
| `PATCH /admin/schemes/{id}` | Allowed changed fields + revision. | Conflict detection and source/capability validation; BR-13, 25, 32. |
| `GET /openapi.json` | Machine-readable current schemas. | Synthetic sandbox documentation; no credentials/private fixtures. |

## 7. Target-only operation families

Do not expose these as successful local actions until implemented and tested: cross-family transfer/split/merge; PDS import and reconciliation; certificate-owner correction/revocation; production identity recovery; delegated adult access; approved official source polling/webhooks; effective-dated scheme-rule/assessment snapshots; external utility/asset subjects and de-linking; full content four-eyes publishing; official fee collection; independent audit export; controlled managed-device offline sync; bulk export approval and privacy-suppressed analytics.

Their future contracts should be command resources such as transfer requests, import runs, source acknowledgments and assessment versions, not arbitrary database-row edits. See BR-21, 35–38 and the [target data model](DATABASE_DESIGN.md). Version APIs/events compatibly and publish consumer deprecation periods before retiring contracts.
