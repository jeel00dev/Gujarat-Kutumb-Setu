# Gujarat Kutumb Setu · ગુજરાત કુટુંબ સેતુ

Local, persistent family-registry application: Gujarati/English resident portal, assisted intake, independent verification/approval, departmental scheme and payment workspace, administration, PostgreSQL, API and durable event worker.

**Use the same service screens for the intended deployment.** Residents sign in with a mobile number or Family ID and a verification code. Only the external provider adapters and synthetic fixtures are simulated; registration, review, registry changes, notifications, referrals, payment history and access controls run on the server and persist in PostgreSQL. There is no browser-only fake database. A small test-environment notice and optional testing helpers identify this installation honestly.

This is a working **synthetic local release**, not authorization to launch a statewide government registry. Real Aadhaar/PDS/SSO/SMS/treasury connectors, approved policies/brand assets, assurance and scale testing are explicit release gates. See [implementation coverage](docs/IMPLEMENTATION_COVERAGE.md) before treating any research-SRS feature as delivered. No real Aadhaar, bank information or citizen records should be entered here.

## Open it on this machine

**http://127.0.0.1:8095**

```bash
npm start
npm run status
npm run logs
npm stop
```

Requires Docker Engine with Compose v2 supporting `!reset`, Node.js 22+ / npm and curl. The start command installs/builds the frontend, migrates/seeds the database, and starts PostgreSQL, FastAPI, worker and Nginx containers. First start needs package/image downloads; runtime assets/fonts are served locally. It does not reset existing data. Port 8095 avoids other services on this machine.

### Synthetic accounts

| Use | Identifier | Verification |
|---|---|---|
| Resident with family | `9000000001` or `GKS-DEMO-AHMEDABAD-001` | OTP `123456` |
| New resident without family | `9000000002` | OTP `123456` |
| Separate Surat family (privacy check) | `9000000003` or `GKS-DEMO-SURAT-002` | OTP `123456` |
| Resident with submitted application | `9000000004` | OTP `123456` |
| Assisted operator | `operator@demo.local` | Staff password below |
| Verifier | `verifier@demo.local` | Staff password below |
| Approver | `approver@demo.local` | Staff password below |
| Department officer | `department@demo.local` | Staff password below |
| Administrator | `admin@demo.local` | Staff password below |

Staff use the **Staff access** tab and password `DemoPass@123!`. These credentials are intentionally public test fixtures, never production secrets. Seeded records are idempotent, not reset on startup. A previously used new-resident account may now have a family: use **Create an account** with another synthetic 10-digit mobile when demonstrating fresh registration. Codes expire and are single-use; resend/attempt limits still apply. Each independent staff role should use a separate browser profile/private window or sign out before switching roles.

See [demonstration walkthrough](docs/DEMO_WALKTHROUGH.md) for registration → approval → registry change → scheme referral → payment and grievance workflows.

## Container deployment modes

The default `npm start` uses `compose.yaml` + `compose.local.yaml`: application state is under `.local/` on the project drive, with cached base images and bind-mounted application builds. This machine's system/Docker drive is nearly full; this mode avoids deleting unrelated files/images and has been exercised here. `.local/postgres` contains the actual persisted database, not disposable build output.

On another local server with enough Docker disk space, the portable, self-contained image build is:

```bash
docker compose -f compose.yaml up -d --build
```

That mode uses Docker **named volumes**, a separate dataset from the project-drive mode. Do not switch modes expecting automatic data migration. Use backup/restore for migration. Never run `down -v` or remove `.local/postgres` to fix a startup problem. Main Compose keeps the web and diagnostic PostgreSQL ports bound to loopback; enable LAN binding only on a controlled test network, without real data. HTTPS, protected secrets and secure cookies are required before any real-data deployment.

Configuration names and synthetic defaults are in [.env.example](.env.example). `DEMO_MODE=false` is **not** a production switch: unsupported real providers fail closed and synthetic accounts/sessions are rejected. Implement and certify adapters first.

## Tests and engineering documentation

```bash
npm ci
npm run build
npm run test:api
npm run test:e2e
npm run test:load
cd backend && ../.venv/bin/python -m pytest -q
```

For a fresh machine, create the optional native test environment with `python3.12 -m venv .venv` and `.venv/bin/pip install -r backend/requirements.txt`. Browser tests need Chromium: `npx playwright install chromium` (or set `CHROMIUM_PATH` to a compatible installed executable). `BASE_URL` overrides the default test target `http://127.0.0.1:8095`. Independent HTTP security tests use `KUTUMB_TEST_BASE_URL=http://127.0.0.1:8095 .venv/bin/python -m pytest tests/security -q`. Tests create additional synthetic records; they do not erase seed families. Avoid simultaneous suites against the same host because abuse limits are intentional.

- [Database entities, relations and target extensions](docs/DATABASE_DESIGN.md)
- [Business rules and allowed operations](docs/BUSINESS_RULES_AND_OPERATIONS.md)
- [API endpoints](docs/API_ENDPOINTS.md), [client contract](docs/IMPLEMENTATION_CONTRACT.md), [OpenAPI snapshot](docs/openapi.json)
- [Local and statewide-target architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Research evidence and decisions](docs/RESEARCH_DECISIONS.md)
- [Actual implementation / pending production gates](docs/IMPLEMENTATION_COVERAGE.md)
- [Independent security review](docs/SECURITY_REVIEW.md)
- [Test report and limitations](docs/TEST_REPORT.md)
- [PNG/SVG database, workflow and architecture images](docs/graphs/README.md)
- [Operational guide](docs/OPERATIONS.md)

The original research SRS and frontend specification remain at the repository root. They describe a broader target than this local release. Original Excalidraw content was not present in this workspace; the existing research/specification and cited official sources were used, without claiming to have re-inspected missing embedded images.
