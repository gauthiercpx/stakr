"""Main FastAPI application for STAKR."""

import os
from pathlib import Path
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.version import APP_VERSION
from app.routers import auth, health

# Configure a module logger. In typical deployments Uvicorn/ASGI configures logging
# globally; here we just get a named logger so messages appear in the normal log pipeline.
logger = logging.getLogger(__name__)

# 1. Load environment variables from .env
load_dotenv()

app = FastAPI(
    title="STAKR API",
    version=APP_VERSION,
    description=(
        "Demo API for the STAKR project skeleton.\n"
        "This specification documents health endpoints and a few examples."
    ),
    contact={
        "name": "STAKR Team",
        "url": "https://www.stakr.me/",
        "email": "gauthier.coppeaux@gmail.com",
    },
    openapi_tags=[
        {"name": "Health", "description": "Liveness/readiness / ping endpoints"},
        {"name": "Auth", "description": "Authentication and user endpoints"},
    ],
)

# 2. CORS configuration (browser security)
# Read CORS_ORIGINS from .env and split a comma-separated string into a list
raw_origins = os.getenv("CORS_ORIGINS", "")
if raw_origins:
    # Split, trim and ignore empty fragments
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    origins = []

# If no origins are provided, allow localhost by default to avoid blocking local dev
if not origins:
    origins = ["http://localhost:5173"]

# Basic validation & helpful logging
# Warn if wildcard is used (may be acceptable in some envs but insecure in prod)
if "*" in origins:
    logger.warning("CORS configured with wildcard '*' — this allows any origin in browsers. Ensure this is intentional for your environment.")

# Warn about likely-misconfigured origins (no scheme)
_invalid = [o for o in origins if not (o.startswith("http://") or o.startswith("https://") or o.startswith("localhost") or o.startswith("http://localhost") or o.startswith("https://localhost"))]
if _invalid:
    logger.warning("Some CORS origins look invalid or lack a scheme: %s", _invalid)

logger.info("Allowed CORS origins: %s", ", ".join(origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register routers
app.include_router(health.router)
# Note: the auth router is mounted with prefix '/auth'
app.include_router(auth.router, prefix="/auth")

# 4. Serve the frontend build (optional)
# This backend is designed to be deployed separately from the frontend.
# If you want a single-container demo (backend serving a built SPA), enable it
# explicitly.
SERVE_FRONTEND = os.getenv("SERVE_FRONTEND", "0") == "1"

if SERVE_FRONTEND:
    # In Docker, the root Dockerfile (if used) copies Vite's dist to /app/static.
    _docker_static_dir = Path("/app/static")

    # When running outside Docker (e.g. local dev),
    # try a repo-relative `static/` directory.
    _repo_root = Path(__file__).resolve().parent
    while _repo_root.name not in {"backend", "app"} and _repo_root.parent != _repo_root:
        _repo_root = _repo_root.parent

    _candidate_local = (
        _repo_root.parent / "static"
        if _repo_root.name == "backend"
        else Path.cwd() / "static"
    )
    _local_static_dir = _candidate_local

    _static_dir = (
        _docker_static_dir if _docker_static_dir.exists() else _local_static_dir
    )
    _index_file = _static_dir / "index.html"

    if _static_dir.exists() and _index_file.exists():
        app.mount(
            "/", StaticFiles(directory=str(_static_dir), html=True), name="frontend"
        )

        # SPA fallback: send index.html for unknown (non-API) routes.
        @app.get("/{full_path:path}", include_in_schema=False)
        def spa_fallback(full_path: str):
            return FileResponse(str(_index_file))
