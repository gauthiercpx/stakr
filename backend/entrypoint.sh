#!/usr/bin/env sh
set -eu

# Optional: Run migrations on startup.
# - If DATABASE_URL isn't set: skip migrations (useful for local smoke tests / static serving)
# - If SKIP_MIGRATIONS=1: skip migrations explicitly
if [ "${SKIP_MIGRATIONS:-}" = "1" ]; then
  echo "SKIP_MIGRATIONS=1; skipping migrations."
elif [ -n "${DATABASE_URL:-}" ]; then
  echo "Running Alembic migrations..."
  if ! python -m alembic upgrade head; then
    echo "ERROR: Alembic migrations failed."
    echo "Tip: verify DATABASE_URL and ensure your env file is UTF-8 encoded."
    exit 1
  fi
else
  echo "DATABASE_URL is not set; skipping migrations."
fi

echo "Starting API..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
