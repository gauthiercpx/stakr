import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env from backend directory
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, encoding="utf-8")

# Base for all models
Base = declarative_base()

# Database URL (can be None for tests that don't need DB access)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Engine and SessionLocal (lazy initialization)
_engine = None
_SessionLocal = None

# Timeout used by psycopg2 (connect_timeout is in seconds).
# We accept both environment variable names for convenience:
# - DB_CONNECT_TIMEOUT_SECONDS: seconds (recommended)
# - DB_CONNECT_TIMEOUT: ms or seconds (legacy)
_raw_timeout = os.getenv("DB_CONNECT_TIMEOUT_SECONDS")
if _raw_timeout is None:
    _raw_timeout = os.getenv("DB_CONNECT_TIMEOUT")

DB_CONNECT_TIMEOUT_SECONDS = 2
if _raw_timeout:
    value = int(_raw_timeout)
    # If it looks like milliseconds (e.g. 5000), convert to seconds.
    DB_CONNECT_TIMEOUT_SECONDS = value // 1000 if value > 60 else value


def get_engine() -> Engine:
    """Get or create SQLAlchemy engine.

    Notes:
        We set a small connect timeout so health/readiness checks fail fast when the
        database is down (instead of blocking for OS-level TCP timeouts).
    """

    global _engine
    if _engine is None:
        if not SQLALCHEMY_DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL environment variable is not set. "
                "Set it in .env or as an env var to use database features."
            )

        connect_args = {}
        if SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
            connect_args = {"connect_timeout": DB_CONNECT_TIMEOUT_SECONDS}

        _engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_pre_ping=True,
            connect_args=connect_args,
        )

    return _engine


def get_session_factory():
    """Get or create SessionLocal factory."""
    global _SessionLocal
    if _SessionLocal is None:
        engine = get_engine()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal


def get_db():
    """Dependency for FastAPI routes to get DB session."""
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
