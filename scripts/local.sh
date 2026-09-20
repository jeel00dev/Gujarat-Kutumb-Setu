#!/usr/bin/env bash
# Project-drive containers: persistent synthetic data, no destructive reset.
set -euo pipefail
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
export KUTUMB_UID="$(id -u)" KUTUMB_GID="$(id -g)"
compose=(docker compose -f compose.yaml -f compose.local.yaml)
action="${1:-start}"
case "$action" in
  start)
    command -v npm >/dev/null || { echo 'Node.js 22+ and npm are required for the local frontend build.' >&2; exit 1; }
    docker compose version >/dev/null
    mkdir -p .local/postgres .local/python .local/evidence .local/nginx-cache .local/nginx-run .local/nginx-tmp backend/data/uploads
    npm --prefix frontend ci
    npm --prefix frontend run build
    "${compose[@]}" up -d --no-build
    for attempt in {1..60}; do
      if curl --fail --silent "http://127.0.0.1:${WEB_PORT:-8095}/api/v1/health" >/dev/null; then
        echo "Kutumb Setu is ready: http://127.0.0.1:${WEB_PORT:-8095}"
        echo 'Synthetic data only. Resident mobile 9000000001; verification code 123456.'
        exit 0
      fi
      sleep 2
    done
    "${compose[@]}" ps
    echo 'Startup did not become healthy within two minutes; inspect npm run logs.' >&2
    exit 1
    ;;
  stop) "${compose[@]}" stop ;;
  status) "${compose[@]}" ps ;;
  logs) "${compose[@]}" logs --tail=80 api worker migrate web ;;
  restart) "${compose[@]}" restart api worker web ;;
  *) echo 'Usage: bash scripts/local.sh {start|stop|status|logs|restart}' >&2; exit 2 ;;
esac
