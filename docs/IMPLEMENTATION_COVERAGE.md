# Implementation coverage and remaining production gates

This is an honest boundary map against the **140 FR and 65 NFR** in the research SRS. A grouped row covers every identifier in its stated range but does **not** mark every requirement in that range complete. The local release provides the intended resident/staff/frontend flows with persistent PostgreSQL state and simulated provider adapters. It does not claim live government access or statewide capacity.

Status vocabulary:

- **Local implementation:** executable source/database/API/UI exists for the described subset. Final test results must come from the repository's test report, not this design inventory.
- **Partial:** an executable foundation exists, but substantial policy, exception, integration or operational work remains.
- **Simulated adapter:** actual server-side test behavior and persisted workflow, with no government network/payment side effect.
- **Target/gated:** designed/documented but not enabled as a completed local operation.

## 1. Functional coverage

| SRS IDs | Local implementation scope | Remaining target / production gate |
|---|---|---|
| FR-01–13 | Public bilingual service shell, resident Family ID/mobile challenge via simulator, staff access, persisted application drafts, core personal/member/address declarations, non-PDS route, protected evidence handling and ID-limit explanations. **Partial + simulated adapter.** | Official authentication/alternate-access policy, real PDS/e-KYC, comprehensive assisted authorizations, accepted evidence matrix, actual helpline/fees/mandate. |
| FR-14–24 | Distinct approved synthetic Family/person IDs, dated membership and representative tables, fact history, controlled address/name/addition/death/representative requests. **Partial.** | Transfer/split/merge/dedup adjudication, full aliases/lineage, historical interval exclusion, source-qualified per-fact lifecycle and overlapping dispute handling. |
| FR-25–32 | Application transitions, jurisdiction-scoped queues, separate verify/approve roles, clarification/rejection/appeal, notices and grievances. **Partial.** | Real authority assignments, field-check logistics, multi-level statutory appeal, e-District/Jan Seva integration, signed human-service SLAs/escalation. |
| FR-33–40 | Outbox, durable local worker/receipt, minimal source-scoped benefit ingestion and safe adapter boundary. **Partial.** | Government source inventory/agreements, batch import/quarantine/checkpoints, real PDS feed, field stewardship, reconciliation dashboards and source correction acknowledgment. |
| FR-41–55 | Scheme catalogue/discovery, persisted simulated referral, scoped client onboarding/approval/revocation, minimal family resolution, source report/passbook and payment-status simulation, API contracts. **Partial + simulated adapters.** | Complete policy/evidence engine, production OAuth/mTLS onboarding, real feeds, ordered per-consumer replay, approved analytics/suppression and new-scheme conformance programme. |
| FR-56–61 | Fixed roles/jurisdictions, content revisions, scheme admin, audit/access history and operational counters. **Partial.** | Time-bounded delegated roles, independent auditors, full approved reference-data governance, bilingual four-eyes CMS, dependency/contract inventory and production monitoring. |
| FR-62–74 | Independent no-ration enrollment, member editor, structured residence, core declarations, server validation, receipt/status, revision conflicts and protected uploads. **Partial.** | Full unknown/estimated-age, no-contact/changed-phone/guardian exceptions, legally approved forms/retention/evidence, district/taluka/village official codes and accessible approved alternatives. |
| FR-75–94 | Deliberately does not collect an inherited family caste or issue certificates; source/subject boundaries are preserved in design. **Target/gated.** | Entire authorized category/certificate/list-version ecosystem, issuer feeds, individual consent/purpose, source conflict/revocation/appeal and category-based assessment conformance. |
| FR-95–106 | Distinct account/draft/submitted/permanent IDs, own-family reference check, ration/no-ration/unsure routing, review and linked correction history. **Partial + simulated reference check.** | Approved PDS seeding/recovery, source discrepancies and reissued card crosswalks, authoritative later PDS acquisition, actual duplicate/person matching and verified no-mobile recovery. |
| FR-107–124 | Catalogue versus connected capability; potentially relevant lead; referral; officer sanction/rejection; simulated payment success/failure/retry/reversal; source-reported benefit view. **Partial + simulated payment.** | Complete effective-dated policy versions, contributor sets, proactive jobs, source decision/settlement callbacks, pension stacking/offset, all named health/education/agriculture/utility programme contracts. |
| FR-125–137 | Task navigation, controlled updates, current versus proposed values, application timeline, receipts, passbook/payment history, grievances and resident access history. **Partial.** | Verified official service charges/times, independent misconduct investigation, full two-family changes, authorized civil-event feed, propagated source acknowledgment and override dual-control operations. |
| FR-138–140 | Full typed external-subject and dated subfamily/contributor design documented. **Target/gated.** | Executable utility/land/livestock/enterprise adapters and de-linking; complete assessed/contributor snapshot model and owner-reviewed eligibility rules. |

## 2. Nonfunctional coverage

| SRS IDs | Local contribution | Remaining measurable/operational evidence |
|---|---|---|
| NFR-01–07 | Relational integrity, bounded list APIs, modular stateless-ready API, portable Compose and explicit target topology/capacity worksheet. | Gujarat-scale representative dataset/load; HA, multi-site RPO/RTO, availability SLO and infrastructure approval. Single host cannot prove these. |
| NFR-08–13 | Hash-protected credentials/sessions, CSRF, object/role/jurisdiction checks, minimized data, test-only providers and fail-closed unsupported adapter. | Production TLS/storage encryption/key custody, independent tamper-evident audit, staff MFA, legal/privacy/identity approvals and accessible identity alternatives. |
| NFR-14–15 | Gujarati/English frontend, semantic controls and local self-hosted assets. | Full GIGW/WCAG audit, real screen-reader/keyboard/device testing and native-language review. Automated checks are not certification. |
| NFR-16–19 | Idempotency records, revision checks, transactional registry/history/outbox, durable worker and operational counters. | Production multi-consumer events, connector lag SLOs, worker crash/failure drills at load, centralized privacy-safe alerting and owners. |
| NFR-20–23 | Versioned manifests, API schema, Alembic, isolated synthetic DB and documented backup/restore direction. | Penetration/security assurance, contract deprecation policy, real-data migration reconciliation and encrypted independent restore test. |
| NFR-24–27 | Server drafts, recoverable requests, scoped operational views and no unapproved AI dependency. | Managed offline intake, representative usability, independently sampled exclusion/match accuracy, production incident/retention obligations. |
| NFR-28–33 | Restricted certificate/caste fields absent by design; no universal sensitive family profile or public enumeration. | Entire person-specific certificate access/list/version/unknown-status test suite before category integration. |
| NFR-34–39 | Non-PDS route, synthetic fixtures, versioned test policy and source-aware extension design. | Statewide outage/load scenarios, policy migration, independent non-PDS fairness metrics, protected aggregates and approved field rules. |
| NFR-40–47 | Versioned API/adapters, recommendation/referral/decision/payment separation, person/representation-based report views. | Complete scheme conformance, reproducible as-of assessments, batch scheduling at statewide peaks, benefit stacking/subfamily/period and exclusion quality tests. |
| NFR-48–54 | No browser offline PII vault, no mandatory GPS, rate counters, distinct source/benefit fields, configurable provider boundary. | Managed-device offline controls, full reconciliation counts, reissue/out-of-order PDS cases, retention per source and effective-dated award rules. |
| NFR-55–58 | Core resident/staff journeys, reasoned case history, private status/passbook and simulated changed-state behavior. | Real channel/district pilot measurements, signed stage deadlines, independent misconduct auditing, comprehensive changed/shared/no-phone access policy. |
| NFR-59–63 | Local controlled life-event history; simulated payment failure/retry/reversal; human review and no hidden automated entitlement. | Full source event ordering, propagation acknowledgments, fee reconciliation, real report-delay/correction contracts and any future AI approval/evaluation. |
| NFR-64–65 | Normalized target design explicitly covers external subjects and assessed/contributor sets. | Executable owner-approved connectors, dated linkage reconciliation and historical assessment tests. |

## 3. What the local tests must establish

The root test suite/report is the authority for **actually run checks and measured results**. It should record build versions, host, date, commands, pass/fail counts, screenshots/traces and workload limits. This coverage document does not invent counts or mark unrun tests passed.

Independent black-box security regressions are in [`tests/security/test_http_security.py`](../tests/security/test_http_security.py). They refuse a non-synthetic server and create only isolated synthetic records. The [security review](SECURITY_REVIEW.md) records concrete discovered issues, fix/retest status and remaining limitations. Existing family members/benefits are not edited by this suite.

Current local restrictions: post-issue member addition supports represented minor child/grandchild only; evidence remains quarantined (authorized download 423) until a scanner/release workflow exists; current-representative death requires prior role change. Adult authorization, single-person-death recovery and full source corrections remain target work. Natural scheme names and normal service screens do not imply that a provider is actually connected.

Required local critical paths: Family ID/mobile challenge and wrong/expired/reused OTP; staff role separation; draft/save/reload/submit; repeated intent and stale revision; cross-account/jurisdiction denial; verification/approval/permanent family; correction approval without pre-mutation; rejection/appeal; grievance response; connected referral; scheme review/sanction; simulated failed payment/retry/paid/reversal; revoked client; duplicate source benefit; protected evidence; outbox persistence; mobile rendering and navigation.

## 4. Production activation checklist

1. Approve real identity and data-sharing authority; implement/test real provider adapters and recovery. No live mode accepting simulator codes or test-user helpers.
2. Approve field dictionary, family/representation/evidence policy, source ownership, service fees/times, helplines, brand assets and human-reviewed translations.
3. Replace test-only policy/scheme/payment amounts with owner-approved versioned contracts. A simulated sanction amount is not a current Gujarat entitlement.
4. Complete source, certificate, PDS, scheme and payment reporting/settlement conformance; prevent browser-chosen payment outcome in a real adapter.
5. Deliver unresolved required identity lifecycle operations and exception paths before advertising them as available; preserve stable IDs/history.
6. Install TLS, secrets/key custody, staff MFA, anti-abuse controls, scanned evidence storage, independent audit, backup/restore and operational monitoring.
7. Run independent security/accessibility review, real user validation and controlled pilot with data-owner sign-off.
8. Demonstrate measured capacity/failover/DR at agreed demand before statewide launch. The NeGD precedent and population figures are not those measurements.
