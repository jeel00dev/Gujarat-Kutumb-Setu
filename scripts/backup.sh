#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
umask 077
backup_dir=".local/backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
docker compose -f compose.yaml -f compose.local.yaml exec -T db sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_dir/registry.dump"
tar -czf "$backup_dir/evidence.tar.gz" -C .local evidence
sha256sum "$backup_dir/registry.dump" "$backup_dir/evidence.tar.gz" > "$backup_dir/SHA256SUMS"
echo "Created $backup_dir (contains synthetic personal data; keep private)."
