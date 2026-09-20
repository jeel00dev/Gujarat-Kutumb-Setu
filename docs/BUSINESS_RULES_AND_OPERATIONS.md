# Business rules and allowed operations

Scope: the production-shaped Kutumb Setu frontend and persistent local backend, with **simulated identity/government adapters and synthetic records**. Rules marked **target** are complete SRS design obligations, not claims that the local release already implements the operation. [API catalog](API_ENDPOINTS.md) maps these rules to commands; [coverage](IMPLEMENTATION_COVERAGE.md) records implementation boundaries.

## 1. Actor and authority matrix

| Actor | May do in the supported local scope | Cannot infer from role |
|---|---|---|
| Visitor | Read published services, scheme information, help and notices. | Private application status, family enumeration or passbook access. |
| Resident | Own application/draft, submitted receipt/history, own authorized family summary, controlled changes, grievance and permitted benefits/referrals. | Access every adult's detailed benefit record or any case whose reference they know. |
| Assisted operator | Scoped assisted intake with resident owner and operator recorded. | Approve own submission; override policy by changing intake channel. |
| Verifier | Assigned/jurisdiction-scoped review, clarification, verification and appropriate rejection. | Final approval using the verifier role, source certificate issuance or payment award. |
| Approver | Authorized verified case decision with recorded reason. | Verify and approve the same case, ignore stale evidence/revision or self-approve an assisted case. |
| Administrator | Approved content/scheme/client operations, scoped operational/audit views. | Automatic legal authority to certify caste, issue payment or bypass every case-control rule. |
| Department user/client | Request approved client scopes; perform permitted minimal identity resolution and synthetic source benefit reporting. | A full family dossier or arbitrary scheme reporting merely because a credential exists. |

Every server read/write checks both role and object scope. No client-provided role is honored during resident onboarding. Endpoint existence, public ID knowledge, phone control and membership are not interchangeable authorization grants. [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

## 2. Rule catalog

| Rule | Invariant / allowed operation | SRS anchors |
|---|---|---|
| BR-01 | Keep account, identity assurance, representation, draft, submitted application, permanent Family ID and PDS alias distinct. | FR-03, 12, 68, 98; NFR-58. |
| BR-02 | Resident access follows government-ID/mobile challenge screens; local adapter accepts only clearly synthetic test identifiers. A returned challenge/OTP is a simulation, not UIDAI e-KYC. | FR-03, 12, 99; NFR-12–13. |
| BR-03 | A phone is a contact channel; no universal unique phone→person/family rule. Changed/shared/no-phone recovery needs approved alternate authority before production. | FR-11, 66, 99. |
| BR-04 | Read and write private objects only under current server-side ownership, representation, role and jurisdiction scope. Avoid account/ID enumeration in errors. | FR-52, 56, 71, 129; NFR-09, 50, 58. |
| BR-05 | Session expiry/revocation, CSRF for cookie-authenticated writes, bounded challenge/login attempts and no private shared caching are mandatory controls. | NFR-08–09, 50, 58; FE-39–40. |
| BR-06 | A saved incomplete draft is not submitted. Retain actual save time/revision; validate the full selected policy at submit. | FR-03, 70; FE-14, 17–18. |
| BR-07 | Enroll without ration card through an independent route. Existing own match, no match, ambiguous match and source outage have different next steps. | FR-07–08, 62–63, 95–97. |
| BR-08 | Synthetic core intake collects person names/DOB, relationship, residence and applicable declaration/authority. No compulsory Aadhaar/bank/caste/religion/land fields. Unknown is not false. | FR-05, 64–69, 91. |
| BR-09 | One applicant/self member and at least one member in the supported local policy; impossible future birth dates and empty core values fail. Exceptional estimated-age/large-family cases require the approved production policy, not fabricated dates. | FR-10–11, 64, 100. |
| BR-10 | Every submit/decision intent is durable and retry-safe. Same actor + operation + key + payload returns the original outcome **only after current object/scope authorization**; a revoked scope cannot recover a private cached response. Same key with different payload conflicts. | NFR-16–17; FE-18. |
| BR-11 | Permanent synthetic Family ID is issued only at successful final approval/implementation, never draft creation or a browser-only success screen. | FR-14, 70, 98, 103. |
| BR-12 | Verification and approval are distinct role/state checks. Staff cannot approve their own assisted case; every decision has reason and recorded actor. | FR-25–30, 133, 136; NFR-57. |
| BR-13 | Mutations lock/revision-check the current case; stale tabs and competing decisions fail safely rather than overwrite. | NFR-16–17; FE-41. |
| BR-14 | Application transition, resulting registry mutation, history/audit and outbox event commit atomically. Success means committed state. | FR-30, 51; NFR-16, 60. |
| BR-15 | Information requests retain the original submission, identify required action, allow a controlled response, and produce a new auditable transition. | FR-25, 28, 70–73, 102. |
| BR-16 | Rejection retains history/reason and a review/appeal route. Withdrawal is a case action, not deletion of person/family records. | FR-21, 29, 72, 102. |
| BR-17 | Current approved membership is coherent. Stable person identity survives dated representative/life-event changes. | FR-15–22; NFR-17, 59. |
| BR-18 | A controlled change stores proposed values first. Pending/rejected changes do not update current registry facts; accepted changes retain before/after, source, effective and recorded time. | FR-126–128; NFR-60. |
| BR-19 | Supported local changes: address, authorized name, member addition, death recording and representative. Unsupported transfer/split/merge must return an explicit unsupported/manual-route outcome, not fake success. | FR-17–19, 126–131. |
| BR-20 | Death does not hard-delete identity/history, and registry change does not unilaterally cancel a department's benefit. | FR-21, 119, 130; NFR-59. |
| BR-21 | **Target:** transfer/split/merge preserves person identity, intervals, predecessor/successor history, both-side authority, disputes and approved source notifications. | FR-18–24, 131; NFR-17, 52, 59. |
| BR-22 | Evidence upload validates permitted type/signature, length and protected paths; authorization applies to download. Quarantine/scan status is not issuer verification. | FR-09, 67, 74; FE-16. |
| BR-23 | No claim of malware-cleared evidence without an actual scanner. Production uploads stay gated until scanner/quarantine/retention controls are approved. | NFR-08, 20, 28. |
| BR-24 | Grievances do not require an already-issued Family ID. Reporter sees status/response; privacy/staff-conduct reads and decisions are owner/admin-restricted where appropriate, not exposed to every local verifier or potentially accused staff member. No self-resolution. | FR-29, 132–136; NFR-57, 61. |
| BR-25 | A real scheme's information/source link is not an active connector. Catalog, discovery, referral, source application, decision and delivery are distinct capabilities/states. | FR-41, 45–49, 107, 112–117. |
| BR-26 | Recommendation is potentially relevant/missing evidence, never a final legal entitlement. No arbitrary browser-side eligibility engine. | FR-45, 109–114; NFR-32, 47, 63. |
| BR-27 | External link clicks create no internal application receipt. A connected simulated referral is persisted, scoped, authorized and deduplicated. | FR-47–50, 113–115; FE-25. |
| BR-28 | Benefit reports identify named subject, scheme, department, source reference, period and date. Monetary/in-kind states, failure and reversal are distinct; duplicate source reports do not create duplicate awards. | FR-48–49, 115–118, 129; NFR-62. |
| BR-29 | Passbook disclosure is person/representation-scoped. Missing/delayed feed gives coverage warning, not a false no-benefit assertion. | FR-49, 116–117, 129; NFR-44, 54, 58, 62. |
| BR-30 | Client onboarding starts pending; admin approval grants only specified scopes/schemes/jurisdiction and revocable expiring credentials. Store credential digests. | FR-33, 42–43, 50–52; NFR-09, 40. |
| BR-31 | Integration resolution returns the minimal approved proof/summary, not names/DOB/caste/bank/private benefit profiles. A purpose string does not itself confer authority. | FR-43–44, 52, 85; NFR-28–30, 44. |
| BR-32 | Bilingual content/scheme edits validate owner/source, allowed URL and revision; retain prior content. Full editorial four-eyes publication remains a target if not implemented locally. | FR-58–59, 61; FE-34–35. |
| BR-33 | Audit every sensitive decision/disclosure with purpose/object/outcome, but do not put private payloads/identifiers in general telemetry. A local hash is not proof against privileged rewriting. | FR-30, 57, 137; NFR-10, 19, 27–30. |
| BR-34 | Outbox delivery is at least once; each consumer deduplicates and reports actual acceptance. Source outage is not a final negative eligibility decision. | FR-34–40, 51; NFR-16, 18, 42. |
| BR-35 | **Target:** source facts and certificates retain issuer/holder/list/version/effective status. Caste, NCL, EWS, domicile and income remain separate; never inherited automatically from head/spouse. | FR-75–94; NFR-28–39. |
| BR-36 | **Target:** policy/version/date and exact assessed/contributor set reproduce every scheme assessment, including smaller units in joint households. | FR-108–109, 140; NFR-43, 65. |
| BR-37 | **Target:** benefit exclusivity/compatibility/top-up is owner-defined for the period; no silent cancellation or retroactive rate recalculation. | FR-118–120; NFR-45, 53. |
| BR-38 | **Target:** utility/land/animal/enterprise references have typed external authority and dated beneficiary role; family address/membership proves neither title nor subsidy. | FR-138–139; NFR-64. |
| BR-39 | Published metrics are scoped administrative coverage with date/denominator; no census claim, unrestricted person export or unsuppressed sensitive small cells. | FR-53–54, 60; NFR-25, 39, 51. |
| BR-40 | Simulated connectors and synthetic credentials are environment configuration, not a replacement frontend. Switching to an approved real adapter requires conformance/security/policy gates; failures never fall back to synthetic success. | NFR-07, 12, 20, 38; FE-37–42. |
| BR-41 | A scoped scheme officer explicitly sanctions/rejects the referral; a positive exact amount and benefit period create one payment order. Simulator processing can fail/retry or become paid, and only paid orders may reverse. Preserve event history and deny self-sanction, foreign scheme/jurisdiction, stale revision and duplicate intent. A real adapter never accepts a browser-selected result or moves funds without an approved mandate. | FR-114–118, 129; NFR-16, 44–45, 53, 58, 62. |

## 3. Application state machine

Exact allowed actions are enforced by the backend and reflected by UI buttons. This table is the contract; compare current implementation/test evidence before widening a state transition.

| Current state | Operation / actor | New state | Required checks / side effects |
|---|---|---|---|
| None | Create / resident or authorized operator | `draft` | Owner/submitter/channel; no permanent ID. |
| `draft` | Save / owner or authorized operator | `draft` | Revision; scoped mutable fields; real persisted save time. |
| `draft` | Submit / owner or authorized operator | `submitted` | Complete form validation, authority, idempotency, reference, audit/outbox. |
| `submitted` | Start review / verifier | `under_verification` | Jurisdiction and current revision; record staff action. |
| Reviewable state | Request information / authorized reviewer | `needs_information` | Required reason/action; do not erase previous submitted payload/history. |
| `needs_information` | Amend and resubmit / owner | `submitted` | New revision/snapshot; same case continuity, no second family. |
| `under_verification` | Verify / verifier | `verified` | Evidence/outcome and reason; not final issuance. |
| `verified` | Approve / independent approver | `approved` then `implemented` | Atomic registry mutation, one permanent synthetic ID, actor separation, current family revision for changes. |
| Reviewable state | Reject / permitted reviewer/approver | `rejected` | Reason, history, no silent change to current registry. |
| `rejected` | Appeal / owner | `appealed` | Stated grounds; history retained; re-review, not automatic overturn. |
| `appealed` | Start authorized re-review | `under_verification` | Role/jurisdiction/record revision. |
| Allowed pre-implementation state | Withdraw / owner | `withdrawn` | Reason, no hard delete; no unsupported rollback of implemented identity. |

An internal `approved` timeline event followed by `implemented` in one atomic local operation is valid for an entirely local change. A real upstream-owned correction must instead wait for its source acknowledgment. It must not be labeled implemented merely because a message entered a queue.

## 4. Commands for each change kind

| Kind | Payload / authorization | Outcome if approved | Do not do |
|---|---|---|---|
| Address | New structured address for own authorized family; relevant jurisdiction. | Current projection changes, previous value retained, family revision increments. | Treat postal PIN as title or silently rewrite the authoritative PDS source. |
| Name | Named own/represented person, source-script values and reason. | Person display revision and fact history. | Let one adult rename any unrelated adult or change an issued certificate. |
| Add member | New proposed **minor child/grandchild** under current representative's reviewed local authority. Adult additions are rejected pending an independently verified authority flow. | New canonical person/membership under supported local policy. | Claim broad identity deduplication or legal parentage verification from typed fields. |
| Death | Named authorized non-representative member, effective date and review. Current representative's death requires replacing that role first in this local slice. | Record deceased state with history and event. | Delete person or stop all department benefits; claim a complete single-person-death/estate authority workflow. |
| Representative | Existing eligible family member under reviewed local rule. | End old representative role, begin new role, preserve identity. | Imply ownership of every adult's passbook or force male headship. |
| Transfer/split/merge | Target design only unless later explicit implementation/tests exist. | Stable person IDs and dated lineage/membership once approved. | Accept an unsupported request as already implemented. |

## 5. Scheme/report state separation

`catalogue listed → potentially relevant → authorized referral → source application → source decision → reported payment/delivery` is not one boolean. Production schemes may skip or add stages only through their approved contract. The local simulator may provide deterministic source responses and persist transaction history, but must identify the provider/environment and never claim actual Treasury/PFMS/bank activity.

For reports distinguish `sanctioned`, `payment initiated`, `paid as reported`, `failed`, `reversed` and `in-kind issued` where the connector supports them. Keep period/currency/unit and source freshness. Two reports of the same event are a retry; a reversal is a new linked source event. No double-posting, no rupees-plus-kilograms total, no automatic pension disqualification from a fuzzy duplicate.

The local payment register implements `sanctioned → processing → paid | failed`, `failed → processing` retry, and `paid → reversed` through a provider interface. It stores exact amounts, revision, provider reference and immutable event history; no raw account/card data. Process/reverse commands are idempotent and scope-checked. The simulator may synchronously return a test outcome; production processing requires authenticated asynchronous status/settlement reconciliation and cannot hold a DB transaction open across arbitrary network waits. [Payment-state diagram](graphs/payment-flow.png).

## 6. Error and recovery contract

| Condition | Expected behavior |
|---|---|
| Unauthenticated / expired | 401; safe sign-in recovery and server-saved draft. |
| Wrong role/scope or foreign object | 403 or privacy-preserving 404; no private contents. |
| Invalid body/field or unsupported operation | 422/400 with safe actionable field/reason; retain draft. |
| Stale revision / conflicting intent | 409; reload/compare; never blindly resubmit a changed approval. |
| Rate limited | 429 and bounded retry guidance; do not present provider timeout as invalid identity. |
| Source down / adapter not approved | Explicit unavailable/pending capability; no synthetic success fallback in live mode. |
| Response lost after commit | Recover by original idempotency intent/reference; do not issue a second ID. |
| Worker or process restart | Pending committed outbox survives; duplicate effects prevented by delivery key. |

## 7. Operations not authorized by this implementation

Real Aadhaar authentication, official ID issuance, government data ingestion, payment execution, clinical/caste profiling, bulk exports, unreviewed automated adverse decisions and publication of official service contacts/fees without supplied approval are not performed. These exclusions preserve a production-shaped product and clear extension contracts; they are not frontend placeholders that pretend a government integration has succeeded.
