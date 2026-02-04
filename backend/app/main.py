"""Main FastAPI application for STAKR."""

from fastapi import FastAPI

from app.core.version import APP_VERSION
from app.routers import auth, examples, health

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

app.include_router(health.router)
app.include_router(examples.router)
app.include_router(auth.router, prefix="/auth")
