#!/usr/bin/env sh
set -eu

# Optional: wait for DATABASE_URL to be available.
# If DATABASE_URL isn't set, skip migrations (useful for local smoke tests).
if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running Alembic migrations..."
  python -m alembic upgrade head
else
  echo "DATABASE_URL is not set; skipping migrations."
fi

echo "Starting API..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
