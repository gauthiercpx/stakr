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
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN useradd --create-home --shell /usr/sbin/nologin appuser

# Copy only what is needed at runtime (avoid recursive copy of the whole build context)
COPY --chown=appuser:appuser entrypoint.sh /app/entrypoint.sh
COPY --chown=appuser:appuser alembic.ini /app/alembic.ini
COPY --chown=appuser:appuser alembic /app/alembic
COPY --chown=appuser:appuser app /app/app

# Harden file permissions: sources are read-only, entrypoint executable
RUN chmod a-w /app/entrypoint.sh /app/alembic.ini \
    && chmod -R a-w /app/alembic /app/app \
    && chmod +x /app/entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
