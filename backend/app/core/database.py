import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env from backend directory
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Base for all models
Base = declarative_base()

# Database URL (can be None for tests that don't need DB access)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Engine and SessionLocal (lazy initialization)
_engine = None
_SessionLocal = None


def get_engine():
    """Get or create SQLAlchemy engine."""
    global _engine
    if _engine is None:
        if not SQLALCHEMY_DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL environment variable is not set. "
                "Set it in .env or as an env var to use database features."
            )
        _engine = create_engine(SQLALCHEMY_DATABASE_URL)
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
