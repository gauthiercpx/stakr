# Backend API image.
#
# Build context is backend/. The frontend is deployed separately (Cloudflare
# Pages) and is deliberately not part of this image.
#
# Optimised for Azure Container Apps cold starts: the app scales to zero, so
# every user-visible boot pays for the image pull plus the Python import graph.
# Hence the two-stage build (no pip/setuptools/build cache in the runtime
# layer), no apt layer, and bytecode precompiled at build time.

# ----------------------------------------------------------------------
# 1) Builder: resolve dependencies into a self-contained virtualenv
# ----------------------------------------------------------------------
FROM python:3.12-slim AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# binutils supplies `strip`; it stays in the builder and never reaches the
# runtime image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends binutils \
    && rm -rf /var/lib/apt/lists/*

# Dependency layer: invalidated only when requirements.txt changes.
COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt \
    # pip/setuptools are build-time only; dropping them from the venv keeps
    # ~28 MB out of every image pull.
    && (pip uninstall -y pip setuptools wheel 2>/dev/null || true)

# Slim the dependency tree. Every megabyte here is paid again on each cold
# start, because Container Apps pulls the image when it scales from zero.
RUN set -eux; \
    # pandas ships its own 37 MB test suite; nothing at runtime imports it.
    rm -rf /opt/venv/lib/python3.12/site-packages/pandas/tests \
           /opt/venv/lib/python3.12/site-packages/numpy/tests; \
    # Debug symbols in the compiled extensions (pandas, numpy, curl_cffi,
    # cryptography, psycopg2) are dead weight in a production image.
    find /opt/venv -name '*.so' -o -name '*.so.*' | xargs -r strip --strip-unneeded 2>/dev/null || true

# ----------------------------------------------------------------------
# 2) Runtime
# ----------------------------------------------------------------------
FROM python:3.12-slim AS runtime

# PYTHONDONTWRITEBYTECODE stops the runtime from attempting writes it has no
# permission for; bytecode is generated at build time instead (see compileall).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN useradd --create-home --shell /usr/sbin/nologin appuser

COPY --from=builder /opt/venv /opt/venv

# Sources are copied root-owned on purpose: appuser can read but never write
# them, which makes the previous recursive `chmod a-w` pass unnecessary. That
# pass rewrote every copied file into a second layer, doubling their weight in
# the image.
COPY --chmod=0755 entrypoint.sh /app/entrypoint.sh
COPY alembic.ini /app/alembic.ini
COPY alembic /app/alembic
COPY app /app/app

# Precompile so cold starts skip parsing and compiling the sources. Dependency
# bytecode is already written by pip at install time.
RUN python -m compileall -q /app/app /app/alembic

USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
