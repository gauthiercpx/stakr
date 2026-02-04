"""Main FastAPI application for STAKR."""

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.version import APP_VERSION
from app.routers import auth, examples, health

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
        "url": "https://stakr.me",
        "email": "gauthier.coppeaux@gmail.com",
    },
    openapi_tags=[
        {"name": "Health", "description": "Liveness/readiness / ping endpoints"},
        {"name": "Examples", "description": "Example endpoints for the skeleton"},
        {"name": "Auth", "description": "Authentication and user endpoints"},
    ],
)

# 2. CORS configuration (browser security)
# Read CORS_ORIGINS from .env and split a comma-separated string into a list
raw_origins = os.getenv("CORS_ORIGINS", "")
origins = raw_origins.split(",") if raw_origins else []

# If no origins are provided, allow localhost by default to avoid blocking local dev
if not origins:
    origins = ["http://localhost:5173"]

print(f"🔒 Allowed CORS origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register routers
app.include_router(health.router)
app.include_router(examples.router)
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

    # When running outside Docker (e.g. local dev), try a repo-relative
    # `static/` directory.
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
            # Do not hijack API/docs/OpenAPI paths.
            if full_path.startswith(
                (
                    "auth/",
                    "health",
                    "ready",
                    "docs",
                    "redoc",
                    "openapi.json",
                )
            ):
                return {"detail": "Not Found"}
            return FileResponse(str(_index_file))
