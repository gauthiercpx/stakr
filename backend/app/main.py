"""Main FastAPI application for STAKR."""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.version import APP_VERSION
from app.routers import asset, auth, health, portfolio, transaction

# Configure a module logger. In typical deployments Uvicorn/ASGI configures
# logging globally; here we get a named logger so messages appear in the
# normal log pipeline.
logger = logging.getLogger(__name__)

# 1. Load environment variables from .env
load_dotenv()


def parse_cors_origins(raw_origins: str) -> list:
    """Parse a comma-separated CORS_ORIGINS string into a list of origins.

    - trims fragments
    - ignores empty fragments
    - returns an empty list if input is empty
    """
    if not raw_origins:
        return []
    return [o.strip() for o in raw_origins.split(",") if o.strip()]


# Prefixes an origin may legitimately start with. "https://localhost" is not
# listed because "https://" already covers it.
_VALID_ORIGIN_PREFIXES = ("https://", "localhost", "http://localhost")


def find_invalid_origins(origins: list) -> list:
    """Return origins that look invalid (no scheme and not localhost).

    This mirrors the check used in the module to warn about likely-misconfigured
    origins. Kept small and pure so it is easy to unit-test.
    """
    return [o for o in origins if not o.startswith(_VALID_ORIGIN_PREFIXES)]


# 2. CORS configuration (browser security)
# Read CORS_ORIGINS from .env and parse it into a list
raw_origins = os.getenv("CORS_ORIGINS", "")
origins = parse_cors_origins(raw_origins)

# If no origins are provided, allow localhost by default to avoid blocking local dev
if not origins:
    origins = ["http://localhost:5173"]

# Basic validation & helpful logging
# Warn if wildcard is used (may be acceptable in some envs but insecure in prod)
if "*" in origins:
    logger.warning(
        "CORS configured with wildcard '*' — this allows any origin in browsers. "
        "Ensure this is intentional for your environment."
    )

# Warn about likely-misconfigured origins (no scheme)
_invalid = find_invalid_origins(origins)
if _invalid:
    logger.warning("Some CORS origins look invalid or lack a scheme: %s", _invalid)

logger.info("Allowed CORS origins: %s", ", ".join(origins))

app = FastAPI(
    title="STAKR API",
    version=APP_VERSION,
    description=(
        "Demo API for the STAKR project skeleton.\n"
        "This specification documents health and authentication endpoints."
    ),
    contact={
        "name": "STAKR Team",
        "url": "https://www.stakr.me/",
        "email": "gauthier.coppeaux@gmail.com",
    },
    openapi_tags=[
        {"name": "Health", "description": "Liveness/readiness / ping endpoints"},
        {"name": "Auth", "description": "Authentication and user endpoints"},
        {"name": "Portfolios", "description": "Portfolio management endpoints (CRUD)"},
        {
            "name": "Transactions",
            "description": "Transaction management endpoints (CRUD)",
        },
    ],
)

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

app.include_router(portfolio.router)

app.include_router(transaction.router)

app.include_router(asset.router)

# The API no longer serves the SPA. The frontend is deployed to Cloudflare
# Pages, and the backend image contains no static bundle to mount.
