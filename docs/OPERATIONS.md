# Local operations and production boundary

## Services and health

`npm start` starts only the `kutumb_setu_demo` Compose project. `npm stop` stops it without removing data. `npm run status` reports health. Web: `127.0.0.1:8095`; project PostgreSQL diagnostics: `127.0.0.1:55432`. The API is reached through `/api/v1` on the web origin; it has no host port in default Compose. A native developer API on port 8005 and Vite on 5175 are optional development processes, not required by the container installation.

`GET /api/v1/health` checks database connectivity and identifies synthetic mode. Nginx `/healthz` is web-only liveness. Staff monitoring and worker receipt/outbox tables provide local delivery counters; they are not a production metrics/alerting service. Container restart policies do not establish HA. Nginx resolves the API service periodically so a recreated container does not leave a stale upstream address.

## Data locations

Project-drive mode (`compose.local.yaml`): `.local/postgres` database, `.local/evidence` protected uploads, `.local/python` container packages. Frontend static files are in `frontend/dist`. Named-volume image mode uses Compose-managed `postgres_data` and `evidence`; these are **different stores**. Never alternate modes without an explicit migration.

The database is initialized by Alembic and idempotent seed code before API/worker startup. On upgrades use the same path; do not substitute `create_all` for migration history. Private views require authenticated, purpose/role/object-scoped calls. Cookie sessions and private responses are not cached; service/application data is not placed in localStorage. Only non-sensitive UI preferences may persist there.

## Backup and non-destructive restore test

`npm run backup` produces a PostgreSQL custom-format dump, evidence archive and SHA-256 manifest in a timestamped private directory. It does not stop services or delete files. These local synthetic backups are unencrypted on this machine; production requires encrypted backups in a separately administered failure domain, retention policy and measured restore drills.

Restore first to a **new, empty scratch database**, never directly over the active registry. Use PostgreSQL's `createdb` and `pg_restore --exit-on-error --no-owner` targeting that explicitly named scratch database. Validate row counts, constraints, migration revision and sample histories before planning controlled cutover. The test report records whether a restore was actually exercised. Production object/database consistency needs a coordinated backup strategy; separate live `pg_dump` and evidence archive alone do not guarantee point-in-time consistency.

## Safe updates

Rebuild the frontend with `npm --prefix frontend run build`; project-drive Nginx serves the updated immutable assets. `bash scripts/local.sh restart` reloads API/worker source and Nginx configuration. For migrations run the migration service before restarting dependents, using the same Compose files/data mode. Preserve `.local/` when transferring source on the same machine. Do not include this directory, private logs, uploads or credentials in a public repository.

Synthetic tests add records and can trigger intentional abuse limits. They do not clean the active database. If an account already has a family, register another synthetic mobile rather than deleting its history. Evidence is quarantined with no release/download bypass. Access logs are disabled in this local setup to avoid putting identifiers in ordinary request logs; deploy privacy-reviewed structured telemetry before production.

## Production activation is a separate release

Do not expose this HTTP synthetic installation publicly or populate it with real citizen data. `DEMO_MODE=false` rejects simulator-backed accounts and unsupported identity/payment adapters. There is no fallback from unavailable live identity to an accepted test code.

Real deployment requires approved policy and branding, government source agreements, real authentication/providers, staff MFA/recovery, scanned evidence, TLS and secure cookies, key/secret custody, backup/DR, tamper-evident audit, security/accessibility reviews, full response contracts and district pilot sign-off. Complete missing required SRS lifecycle and exception operations before advertising them. The [target architecture](SYSTEM_ARCHITECTURE.md) supplies the scaling path; a small local load test is not Gujarat-wide capacity evidence.
