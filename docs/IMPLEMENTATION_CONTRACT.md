# Local implementation contract — Gujarat Kutumb Setu

This is the shared engineering contract for the **production-shaped application running locally with simulated providers and synthetic records**, not an authorization to connect government databases. Programme name is approved by the user. The public/resident/staff frontend is the intended live frontend, not a separate demo UI. Simulated identity, source and payment adapters must be replaceable without redesigning those screens. Policy defaults below are explicitly test defaults and must be replaced by signed policies before real-person deployment.

## Stack and ownership

- Frontend: React + TypeScript + Vite, self-hosted assets, same-origin `/api/v1`.
- Backend: FastAPI, SQLAlchemy 2, Alembic, PostgreSQL; explicit validated schemas, parameterized database access.
- Delivery: Docker Compose PostgreSQL + migration/seed job + API + durable outbox worker + Nginx/frontend. Local bind defaults to `127.0.0.1:8095` (8080 is occupied by an unrelated existing application on this machine); no existing database is modified.
- Frontend owns `frontend/`; backend agent owns `backend/`; root owns root deployment/test scripts; architecture agent owns design/research documents and `docs/graphs/`.
- Private responses `Cache-Control: no-store`. Cookie session with server-side expiry/revocation, HttpOnly/SameSite, CSRF header on authenticated writes. Cookies Secure in TLS deployments. Resident authentication uses **Family ID/registered mobile → OTP**; a local identity-provider adapter simulates delivery/verification. Staff use separate staff credentials. Neither simulates completed Aadhaar e-KYC or genuine government database access.

## JSON conventions

Snake case. UUID opaque internal IDs as strings. Dates `YYYY-MM-DD`, instants ISO8601 UTC. All lists `{items: [...], total: number, page: number, page_size: number}` with bounded pages. Single objects are returned directly. Errors `{detail: string | [{loc,msg,type}], code?: string}`. API status strings are stable machine labels; frontend localizes them. Every committed application/family write increments `revision`. Stale revision -> 409. Unauthorized object -> 404 or 403 without contents. Mutations must persist; no mock fallback in production frontend.

## Accounts and authentication

Roles: `resident`, `operator`, `verifier`, `approver`, `admin`, `department`. Staff/department jurisdiction scopes enforced server-side; no resident may choose a role at registration.

Demo seed password: `DemoPass@123!` (only synthetic local demo). Accounts: `resident@demo.local` (existing family), `new.resident@demo.local` (no family), `other.resident@demo.local` (unrelated Surat family), `operator@demo.local`, `verifier@demo.local`, `approver@demo.local`, `admin@demo.local`, `department@demo.local`. Staff Ahmedabad-scoped except admin; department minimal authorized scope. Do not present a real public helpline, government emblem approval, or operational certification.

User: `{id,email,display_name,role,district,person_id,language}`.

| Endpoint | Request/result |
|---|---|
| `GET /health` | `{status,database,mode}` health without private configuration. |
| `GET /public/config` | `{name,name_gu,mode,languages,features,notices,centres,policy_version,fee_note,service_note}`. |
| `GET /auth/demo-accounts` | Test-only `{items:[{email,display_name,role,mobile?,public_id?}],password,otp?}` in a collapsed testing helper, never the main sign-in screen. Disabled outside test mode. |
| `POST /auth/challenges` | `{identifier,purpose:"sign_in"|"register",display_name?,language?}` -> `{challenge_id,masked_destination,expires_in,resend_after,delivery_mode}`. Identifier is synthetic Family ID or mobile. Purpose register requires mobile; sign-in cannot silently create a new family. |
| `POST /auth/verify` | `{challenge_id,code}` -> `{user,csrf_token}` + cookie; server verifies hashed one-time code, expiry, attempts and purpose. Test OTP `123456` only in simulated provider; not hard-coded success in frontend. |
| `POST /auth/login` | Separate staff access/testing helper `{email,password}` -> `{user,csrf_token}` + session cookie. |
| `POST /auth/register` | Compatibility test API `{email,password,display_name,language}` -> same; role fixed resident. Resident UI uses mobile challenge instead. |
| `GET /auth/me` | `{user,csrf_token}` or 401. |
| `POST /auth/logout` | CSRF required -> `{ok:true}`, revoke session. |

Frontend API fetch always includes credentials. Store CSRF token only in memory, reload from `/auth/me`; send `X-CSRF-Token` on authenticated unsafe methods. Idempotency key on submit, review decisions and connected referral via `Idempotency-Key`; reuse same key on a retry of the same intent. A successful OTP proves control of the provider-mapped contact, not blanket authority over every family adult. A Family ID challenge returns access only for its authorized seeded account, never whichever person types the identifier.

The normal interface uses natural service names and the production task hierarchy. A discreet persistent test-environment label and provider-specific simulation notice prevent synthetic records being mistaken for actual government decisions. Test persona controls are secondary/collapsed. No visual redesign should be required to replace an approved provider adapter.

## Public content and schemes

Scheme fields: `{id,slug,name,name_gu,category,department,summary,summary_gu,benefit_type,eligibility,documents,application_url,source_url,status,capability,updated_at}`. String fields may contain plain text only. `capability`: `information_only`, `external`, `demo_connected`. Real Gujarat schemes are reference-only/external; synthetic connected scheme explicitly has DEMO in its name. No invented cash-entitlement claims.

`GET /schemes?q=&category=&page=&page_size=` list; `GET /schemes/{slug}` detail. `GET /public/content/{slug}` -> `{slug,title,title_gu,body,body_gu,updated_at}` for about, help, accessibility, privacy, terms, services and contact. Public aggregate stats label synthetic registry counts, never population/census. Content is useful even if an integration is unavailable.

## Applications, family registry and receipts

Application states: `draft`, `submitted`, `needs_information`, `under_verification`, `verified`, `approved`, `implemented`, `rejected`, `withdrawn`, `appealed`. Enrollment approval creates a family and changes application to `implemented`, with separate approved/implemented timeline events in one transaction. ID not issued at draft/submit. Verifier cannot approve and approver cannot verify. Staff cannot approve their own assisted submission.

Application: `{id,reference,kind,branch,status,revision,step,district,payload,family_id,created_at,updated_at,submitted_at,events:[{id,from_status,to_status,action,reason,actor_role,created_at}]}`.

Enrollment payload:

```json
{"applicant":{"name":"Synthetic Resident","name_gu":"","phone":"9000000001"},"address":{"address_line":"Demo Lane","locality":"Demo locality","taluka":"Ahmedabad City","district":"Ahmedabad","pincode":"380001"},"members":[{"client_id":"local-1","name":"Synthetic Resident","name_gu":"","dob":"1990-01-01","relationship":"self"}],"declarations":{"accuracy":true,"authority":true}}
```

Demo requires one self member, at least one member, supported district, and core name/date/address/declarations; no Aadhaar, bank, caste, religion or property collection. Validation blocks impossible dates/empty mandatory data. Phone is contact, never identity or globally unique. Full draft payload may be incomplete; server validates at submission. Future/protected identity fields rejected. UI keeps member/client IDs stable.

| Endpoint | Request/result |
|---|---|
| `GET /dashboard` | `{user,family,applications,notifications,counts}`; minimized owner/role view. |
| `GET /applications` | Own applications (staff queue separately). |
| `POST /applications` | `{kind:"enrollment",branch:"no_ration"|"ration"|"unsure",district:"Ahmedabad",payload:{},step:1}` -> draft. |
| `GET /applications/{id}` | Owner/authorized staff application + events. |
| `PATCH /applications/{id}` | `{revision,payload,step,district?}` -> updated draft/information response. |
| `POST /applications/{id}/submit` | `{revision}` + idempotency -> submitted application with permanent tracking reference, NOT permanent Family ID. |
| `POST /applications/{id}/withdraw` | `{revision,reason}` -> allowed withdrawal without history deletion. |
| `POST /applications/{id}/appeal` | `{revision,reason}` -> linked auditable appeal; rejection required. |
| `GET /applications/{id}/receipt` | Protected printable receipt data `{application,issued_at,notice}`. HTML client print is primary. |
| `GET /families/mine` | `{id,public_id,status,revision,address,representative_id,members:[{id,public_id,name,name_gu,dob,relationship,status,joined_at}],updated_at}` or 404. |
| `GET /families/{id}` | Same, authorized only. Other adults' sensitive facts excluded. |
| `POST /registry/check` | `{reference}` -> `{result:"existing"|"no_match"|"review_required",family_id?,message}`; only own allowed source/ID match, never household enumeration. |
| `POST /changes` | `{family_id,change_type,payload}` -> draft change application. |
| `GET /notifications` | Own bounded list; `POST /notifications/{id}/read` -> `{ok:true}`. |
| `GET /access-history` | Own safe authority/purpose/time entries. |

Demo change types (go through same submit/review process): `address` payload `{address:{...}}`; `name` `{person_id,name,name_gu}` (self or represented minor); `add_member` `{member:{name,name_gu,dob,relationship}}`; `death` `{person_id,effective_date}`; `representative` `{person_id}`. Additional transfer/split/merge need explicit source/destination authorization and historical membership logic; backend must not silently claim to implement them if absent. Root and backend agent should extend safe controlled operations where feasible and document exact scope. Never fake a successful unsupported change.

Evidence: `POST /applications/{id}/evidence` multipart `file`, `evidence_type`; `GET /applications/{id}/evidence`; `GET /evidence/{id}/download`. Demo files limited PDF/PNG/JPEG with signature, size and safe path validation; quarantine until authorized review. Demo cannot claim malware-certified safety without scanner. Sensitive upload defaults off for non-demo deployment until scanning is configured.

## Review, grievances, benefits

`GET /staff/applications?status=&q=&page=` bounded assigned/jurisdiction queue. `POST /staff/applications/{id}/action` `{action:"start_review"|"request_information"|"verify"|"approve"|"reject",reason,revision}` + idempotency. Reasons required. Actions server-authorized per role/state. `GET /staff/reports` scoped aggregate counts and freshness.

`GET /grievances` own/scoped staff list; `POST /grievances` `{category,subject,description,application_id?}` -> `{id,reference,status,...}`; `GET /grievances/{id}`; `POST /staff/grievances/{id}/action` `{status:"in_review"|"resolved"|"reopened",response}`. Complaint authors see actual response; operators cannot decide own misconduct complaint.

`GET /benefits` -> list of own authorized `{id,scheme_name,department,person_name,benefit_type,amount,currency,quantity,unit,period,status,reported_at,event_date,source_reference,coverage_note}`; `GET /recommendations` -> list `{scheme,reason,status:"may_be_relevant"|"more_information_needed",notice}` (demo deterministic discovery, not awards).

`POST /scheme-applications` `{scheme_id,consent:true}` + idempotency -> real persisted demo referral `{id,reference,status,scheme_id,created_at}` only if `demo_connected`; `GET /scheme-applications` own list. External link clicks do not create referral. Real payment access absent.

## Administration and departments

`GET /admin/overview` counts + recent audit + outbox/integration health. `GET /admin/audit` bounded minimal audit list. `GET /admin/content`; `PUT /admin/content/{slug}` `{title,title_gu,body,body_gu,revision}`; version conflicts 409.

`GET /admin/schemes`; `POST /admin/schemes`; `PATCH /admin/schemes/{id}` validated fields+revision. Publishing requires both language content, source/owner; real arbitrary URLs constrained HTTPS. `GET /departments/clients`; `POST /departments/clients` `{name,purpose,requested_scopes:[...]}` creates pending request; admin `POST /admin/clients/{id}/approve` issues scoped credential once; `POST /admin/clients/{id}/revoke`. Credential hashes only at rest.

`POST /integration/resolve` scoped bearer integration credential `{public_id,purpose}` -> minimal `{public_id,status,member_count,as_of}`, not full household profile. Scope `family:verify`. `POST /integration/benefits` scope `benefits:write`, typed validated synthetic person/scheme/event payload, idempotent source transaction. Not usable by knowing ID alone. Source delivery/reporting may not exceed client's approved scheme/purpose.

`GET /openapi.json` machine-readable contracts. Frontend developer page shows truthful endpoint scopes and download link; default remote-CDN Swagger assets must not be a runtime dependency. Backend endpoints unsupported by UI remain documented, not silently advertised as integrated.

## Payment register and provider boundary (production-shaped screens)

Payments are **department-reported benefits**, not a fabricated fee for obtaining a Family ID. Enrollment is free in the local test policy. A named department reviews a connected scheme application, records a sanction and then processes a payment through a provider interface. In this environment that provider is simulated, uses no real bank/card details and moves no money. The citizen sees the same processing/paid/failed/reversed timeline, amount, period, source and receipt fields that a real approved reporting integration will supply.

Payment object: `{id,reference,scheme_application_id,scheme_name,department,person_name,amount,currency,period,status,revision,provider,provider_reference,created_at,updated_at,events:[{action,from_status,to_status,reason,created_at}]}`. Amounts are decimal strings. No raw account number. A payment is not paid until the provider result is committed; browser redirect alone is never proof.

| Endpoint | Access and contract |
|---|---|
| `GET /payments` | Resident's authorized payments, bounded list. |
| `GET /payments/{id}` | Owner/approved representative or scoped payment officer; unauthorized object returns404. |
| `GET /staff/payments` | Department's explicitly granted schemes/jurisdiction or admin; bounded list. |
| `GET /staff/scheme-applications` | Same scoped review queue, includes application, applicant, scheme, amount/status where applicable. |
| `POST /staff/scheme-applications/{id}/decision` | `{action:"sanction"|"reject",reason,amount?,period?}` + idempotency. Sanction requires positive precise amount and creates one payment order; no automatic entitlement. |
| `POST /staff/payments/{id}/process` | `{revision,outcome:"paid"|"failed",reason?}` + idempotency. Simulator only; production adapter does not accept client-chosen payment outcome. State/revision/provider validation and audit mandatory. |
| `POST /staff/payments/{id}/reverse` | `{revision,reason}` + idempotency; only a paid transaction can be reversed through the configured provider; preserve original event/history. |

In the normal staff interface use Review, Sanction, Process payment and View transaction; simulated failure/outcome controls belong in a secondary testing panel. Production requires a separately approved payment/reporting mandate and provider callback/settlement reconciliation. Both the original event and any reversal are retained, not silently edited out of history. No default bank-information collection is introduced.

## Demo safety and state persistence

Seed is repeatable/idempotent, not database drop-and-recreate. Reset utility, if provided, must require explicit demo-only confirmation. Existing machine databases/services are out of scope. No full registry or unrestricted export routes. PostgreSQL enforces uniqueness/references and active membership coherence; application transitions, registry mutation, audit, notifications and outbox commit atomically. Worker claims durable outbox records with locking/retry and does not impersonate actual government delivery. Source integrations explicitly simulated. Local load tests report actual machine/workload measurements, never statewide proof.
