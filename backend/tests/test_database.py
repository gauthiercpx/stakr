import importlib

import pytest
from sqlalchemy import text

from app.core import database


def reload_db(monkeypatch, url="sqlite:///:memory:"):
    if url is None:
        monkeypatch.setenv("DATABASE_URL", "")
    else:
        monkeypatch.setenv("DATABASE_URL", url)
    return importlib.reload(database)


def test_get_engine_success(monkeypatch):
    db = reload_db(monkeypatch, url="sqlite:///:memory:")
    engine = db.get_engine()
    assert str(engine.url).startswith("sqlite:///")

    SessionLocal = db.get_session_factory()
    session = SessionLocal()
    try:
        result = session.execute(text("SELECT 1")).scalar()
        assert result == 1
    finally:
        session.close()

    # cached path
    SessionLocal_cached = db.get_session_factory()
    assert SessionLocal_cached is SessionLocal


def test_get_db_generator(monkeypatch):
    db = reload_db(monkeypatch, url="sqlite:///:memory:")
    gen = db.get_db()
    session = next(gen)
    try:
        result = session.execute(text("SELECT 1")).scalar()
        assert result == 1
    finally:
        gen.close()


def test_get_engine_missing_url(monkeypatch):
    db = reload_db(monkeypatch, url=None)
    with pytest.raises(RuntimeError):
        db.get_engine()
