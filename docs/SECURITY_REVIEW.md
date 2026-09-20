# Independent security and business-rule review

Date: **20 September 2026**. Scope: actual FastAPI/SQLAlchemy backend, React frontend, PostgreSQL-backed HTTP behavior and the local simulated-provider environment. This is an engineering review and regression suite, **not penetration-test certification or authorization for real resident data**.

Review changes are confined to documentation and [`tests/security/test_http_security.py`](../tests/security/test_http_security.py). Backend/frontend fixes are applied by their respective owners. The independent suite refuses a server whose health mode is not `synthetic_demo`, creates uniquely named synthetic records, never resets/drops the database, and does not mutate seeded family membership or benefits.

## 1. Findings and remediation evidence

| ID / priority | Concrete finding | Remediation / status |
|---|---|---|
| SEC-01 — P1 confidentiality | `/applications` originally listed every case with `submitted_by=operator`, regardless of current jurisdiction. A resident moved an assisted draft Ahmedabad→Surat; the operator's detail read correctly failed, but the list still exposed its complete payload. | Backend owner added role/current-jurisdiction constraints to the list. Independently reproduced against the earlier running build; regression `test_assisted_list_revokes_access_after_jurisdiction_change`. Final live retest recorded below. |
| SEC-02 — P1 reporter privacy | Privacy/staff-conduct complaint actions were admin-restricted, but ordinary district verifiers/approvers could read full descriptions through list/detail. Potentially accused staff could learn protected reporter details. | Backend owner restricted these categories to owner/admin for list/detail/action. Reproduced both categories with synthetic complaints; regression `test_sensitive_grievances_are_owner_admin_only`. Final live retest below. |
| SEC-03 — P1 authorization revocation | Idempotency replay returned a stored successful private response before rechecking current target authorization. An operator submitted an Ahmedabad case, a verifier requested information, the owner moved the case to Surat, and the same original submit key returned the old complete payload despite detail access now being denied. Payments had the same replay-before-current-scope pattern. | Backend owner added current-object authorization before returning cached data for case submit/review, referral/reporting and payment operations, preserving valid replay without re-running obsolete state/revision rules. Source reviewed; regression `test_idempotency_replay_rechecks_current_jurisdiction`; final live retest below. |
| SEC-04 — P2 per-adult payment privacy | Payment visibility originally used representation expiry inclusive of today's date without checking that the represented person was still a minor; core benefit visibility correctly checked age. On an eighteenth birthday, the two paths could disagree. | Root owner changed payments to reuse `services.authorized_person_ids`, centralizing the minor-age/authority check. Code reviewed; exhaustive real guardianship/adult delegation remains a production gate. |
| SEC-05 — P1 workflow completeness | Operator entry omitted backend-required resident owner/assistance-authority fields, causing 422; operator staff landing attempted reviewer-only APIs, causing 403. This was a frontend/backend contract mismatch, not permission to loosen backend rules. | Frontend owner added a role-specific assisted workspace, resident owner and recorded-authority inputs, and correct scoped API calls. Fix source reviewed in `Enrollment.tsx` / `StaffPages.tsx`; rendered workflow evidence belongs to the browser suite. |
| SEC-06 — P1 workflow completeness | A change application (`name`, `address`, etc.) sent to `needs_information` had no edit/resubmit path; only enrollment applications showed Continue. | Frontend owner added a same-case edit route, guarded draft/information state, PATCH with current revision, and resubmission using the existing case ID. Source reviewed in `ResidentPages.tsx`; browser suite must verify the rendered journey. |
| SEC-07 — P2 contract quality | All 62 successful JSON response schemas in the first audited OpenAPI build were `{}`; the final 63-operation build has the same limitation. Request validation exists, but response payloads are not machine-constrained by response models. | Explicitly documented in [API catalog](API_ENDPOINTS.md); typed response models and consumer conformance are required before external-department rollout. This does not negate the HTTP behavior tests. |
| SEC-08 — P2 truthful UI | Admin case view offered verify/approve actions the backend intentionally denied; notification button checked `read_at` rather than actual `read`; tracking searched only the first 20 application rows. | Source fixes preserve strict verifier/approver actions, use returned `read`, and call an authenticated owner/current-assisted-scope exact reference endpoint. Independent HTTP suite additionally checks own tracking and indistinguishable foreign/unknown results; backend suite covers lookup beyond the first 20 cases. |

Priorities denote impact within the intended product. P1 requires fixing before calling the affected local journey complete; P2 needs a fix or an explicitly bounded release gate. This table records actual issues rather than treating missing production infrastructure as a secretly implemented feature.

## 2. Independent HTTP regressions

Run against the intended local API:

```bash
KUTUMB_TEST_BASE_URL=http://127.0.0.1:8005 .venv/bin/python -m pytest tests/security/test_http_security.py -q
```

The same suite can use `http://127.0.0.1:8095` after the Compose API is ready. It checks:

- Authentication required for private views; no-store responses; role escalation rejected without echoing credentials.
- Five incorrect OTP attempts remain committed despite error responses; three concurrent verification attempts consume one challenge only once.
- CSRF and foreign-origin writes denied; guessed foreign family denied; known foreign/unknown reference responses indistinguishable.
- Another adult's DOB and benefit details withheld; unauthorized spouse name change denied.
- Sensitive complaint owner/admin visibility; assisted-list jurisdiction revocation; cached-response authorization revocation.
- Three concurrent submissions of one intent yield one reference/transition; contradictory idempotency reuse and stale edit rejected; immediate read sees committed state.
- Exact reference tracking resolves the owned committed case without scanning a paginated browser list and does not distinguish foreign from nonexistent cases.
- Logout invalidates replay of the old cookie immediately.
- Uploaded synthetic evidence remains quarantined; own download 423, foreign download denied, mismatched executable extension rejected.

**Run evidence:** the initial 12-test run passed 9 and reproduced SEC-01 plus both SEC-02 categories. A focused two-test addition passed the quarantine test and reproduced SEC-03. These failures identified real running-build behavior, not weakened assertions.

**Final post-fix run, 20 September 2026:** **14 passed in 1.87 seconds**, against the restarted native API at `http://127.0.0.1:8005`. SEC-01, SEC-02 and SEC-03 are independently verified fixed for the reproduced HTTP paths. The same final run checks legitimate concurrent replay, owner-only exact tracking, OTP one-time consumption/attempt persistence, privacy boundaries and quarantine behavior. The live OpenAPI then contained 56 paths / 63 operations. The backend owner's isolated suite supplies additional payment-scope replay and tracking-beyond-pagination tests; browser journey evidence is separate from this HTTP suite.

## 3. Additional production gates and limitations

1. Identity and payment adapters intentionally simulate test results. The fixed local OTP and disclosed test personas are never production assurance. Provider selection must fail closed when an approved real adapter is absent.
2. File signatures/type checks do not prove malware safety or document truth. Current uploads are quarantined, with no configured scanner/release path; this is an explicit restricted capability, not a complete evidence-review integration.
3. Other-adult authority, adult member addition, transfer/split/merge, representative recovery and single-person-death handling are not complete production workflows. The local add-member command permits represented minor child/grandchild only.
4. A local per-event audit hash is not independently tamper-proof against a privileged database editor. Separate anchored append-only audit, encryption/key custody, staff MFA, approved authentication recovery, abuse controls and incident response remain required.
5. A worker that writes a local delivery receipt does not prove SMS, government source propagation, exactly-once remote delivery or Treasury settlement. Actual consumers require agreement, deduplication, reconciliation and retry/failure tests.
6. These tests use small synthetic workloads. They establish neither Gujarat-scale throughput/HA nor full WCAG/GIGW conformance, Gujarati linguistic correctness, security certification or statutory compliance.
7. Full intended functionality is tracked in [implementation coverage](IMPLEMENTATION_COVERAGE.md); do not describe all 140 FR/65 NFR as implemented merely because every identifier is mapped.
