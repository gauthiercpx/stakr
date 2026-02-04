# Multi-stage Dockerfile: build frontend, then package backend + static assets

# ----------------------
# 1) Frontend build stage
# ----------------------
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Install deps (cached)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build
COPY frontend/ ./
RUN npm run build


# ----------------------
# 2) Backend runtime stage
# ----------------------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# System dependencies (PostgreSQL client libs)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN useradd --create-home --shell /usr/sbin/nologin appuser

# Copy only what is needed at runtime
COPY --chown=appuser:appuser backend/entrypoint.sh /app/entrypoint.sh
COPY --chown=appuser:appuser backend/alembic.ini /app/alembic.ini
COPY --chown=appuser:appuser backend/alembic /app/alembic
COPY --chown=appuser:appuser backend/app /app/app

# Copy frontend build output into the backend container
# Vite outputs to frontend/dist by default
COPY --from=frontend-build --chown=appuser:appuser /frontend/dist /app/static

# Harden file permissions: sources are read-only, entrypoint executable
RUN chmod a-w /app/entrypoint.sh /app/alembic.ini \
    && chmod -R a-w /app/alembic /app/app /app/static \
    && chmod +x /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
