# Architecture and data diagrams

These are project-authored, editable diagrams. **PNG and SVG files are actual rendered images**, not placeholders or Mermaid text. They are distinct from the official comparator screenshots under [`../frontend-research/`](../frontend-research/README.md).

The diagram visual language follows the supplied government process-flow reference: a white report canvas, top-left title, top-right navy scope band, navy system headers, orange actions, green verification/approved state, white blue-outlined data stores, decision diamonds, dashed responsibility boundaries and thin desaturated-blue connectors. Every image says whether it depicts the **actual local implementation/workflow** or a **proposed target**; color never changes that scope statement.

| Image | Scope | Visual description | Editable source |
|---|---|---|---|
| [Local database ERD — PNG](local-erd.png) / [SVG](local-erd.svg) | Implemented local schema; selected FK relationships shown, repeated actor links omitted for legibility. | Four dashed domains group identity/registry, applications, schemes/payments and reliability tables; thin blue relationship lines connect color-banded entity cards. | [DOT](local-erd.dot) |
| [Target domain ERD — PNG](target-domain-erd.png) / [SVG](target-domain-erd.svg) | Full logical target including conditional source/certificate/scheme-subject extensions. **Not all entities are migrated in the local implementation.** | Dashed green, blue and orange domains connect the authoritative family model to evidence, accountable casework, policy assessment and benefit reporting. | [DOT](target-domain-erd.dot) |
| [Enrollment and review — PNG](enrollment-review-flow.png) / [SVG](enrollment-review-flow.svg) | Draft, submission, verification, approval/implementation, clarification and appeal. | Citizen intake flows through orange draft/submission actions into a dashed verification boundary with green authority and approval states, then into the family-registry cylinder. | [DOT](enrollment-review-flow.dot) |
| [Scheme/payment flow — PNG](payment-flow.png) / [SVG](payment-flow.svg) | Referral, officer sanction/rejection, provider processing, failure/retry and reversal. Simulated provider moves no funds. | A four-row flow uses decision diamonds for sanction, provider result and reversal, with an explicit cylinder for the provider adapter and a production-acceptance note. | [DOT](payment-flow.dot) |
| [Local deployment — PNG](local-architecture.png) / [SVG](local-architecture.svg) | Browser, same-origin Nginx, FastAPI, PostgreSQL, evidence and durable worker on this machine. | Access enters a dashed single-machine boundary containing navy web/API services, orange adapters, a green worker and a white PostgreSQL cylinder; production-only systems remain outside. | [DOT](local-architecture.dot) |
| [Statewide target — PNG](statewide-target-architecture.png) / [SVG](statewide-target-architecture.svg) | Proposed multi-node controlled-hosting architecture; requires measured capacity and production approvals. | Statewide access passes through a controlled edge into separate application and protected-data boundaries, followed by government owners, operations, analytics and recovery controls. | [DOT](statewide-target-architecture.dot) |

Regenerate with Graphviz installed:

```bash
python3 docs/graphs/render.py
```

Graphviz uses locally installed fonts (`DejaVu Sans`) and no network services. The renderer produces scalable SVG plus 144-dpi PNG and rejects undersized output. Diagram titles intentionally distinguish actual local components from target-only infrastructure. A drawn box does not establish a deployed connector, certified security control, achieved throughput or legally authorized data flow. See [system architecture](../SYSTEM_ARCHITECTURE.md), [database design](../DATABASE_DESIGN.md) and [implementation coverage](../IMPLEMENTATION_COVERAGE.md).
