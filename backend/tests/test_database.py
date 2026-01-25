import importlib

import pytest

from app.core import database


def reload_db(monkeypatch, url="sqlite:///:memory:"):
    if url is None:
        monkeypatch.delenv("DATABASE_URL", raising=False)
    else:
        monkeypatch.setenv("DATABASE_URL", url)
    return importlib.reload(database)


def test_get_engine_success(monkeypatch):
    db = reload_db(monkeypatch, url="sqlite:///:memory:")
    engine = db.get_engine()
    assert str(engine.url).startswith("sqlite:///")

    # Session factory should bind to the same engine
    SessionLocal = db.get_session_factory()
    session = SessionLocal()
    try:
        result = session.execute(db.text("SELECT 1")).scalar()
        assert result == 1
    finally:
        session.close()


def test_get_engine_missing_url(monkeypatch):
    db = reload_db(monkeypatch, url=None)
    with pytest.raises(RuntimeError):
        db.get_engine()
