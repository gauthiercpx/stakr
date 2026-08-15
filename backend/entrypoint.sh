#!/usr/bin/env sh
set -eu

# `entrypoint.sh migrate` applies migrations and exits. The deploy pipeline's
# Container Apps job runs the image this way.
#
# It is a subcommand rather than a container command override because the az
# CLI parses any value starting with a dash as one of its own options, so
# `--command "python" "-m" "app.migrate"` fails with
# `unrecognized arguments: -m app.migrate`. Keeping the word dash-free sidesteps
# the whole quoting problem.
if [ "${1:-}" = "migrate" ]; then
  exec python -m app.migrate
fi

# Migrations are a deploy-time concern, not a boot-time one.
#
# They used to run on every container start, which put two extra interpreter
# boots (Alembic, then the seed script) in front of every cold start and let
# concurrent replicas race each other into the same `upgrade head`. Production
# now runs them once per deploy from the CI pipeline; see
# .github/workflows/backend-deploy.yml.
#
# Set RUN_MIGRATIONS=1 to restore the old inline behaviour -- docker-compose.dev
# does this so a local stack still comes up with a migrated, seeded database.
if [ "${RUN_MIGRATIONS:-0}" = "1" ]; then
  echo "RUN_MIGRATIONS=1; applying migrations before start."
  python -m app.migrate
fi

echo "Starting API..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
