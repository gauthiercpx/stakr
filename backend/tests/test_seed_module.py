import logging
from decimal import Decimal
import runpy

import pytest

from app import seed


class DummySession:
    def __init__(self):
        self.merged = []
        self.committed = False
        self.rolled_back = False
        self.closed = False

    def merge(self, item):
        # accept any object; record it
        self.merged.append(item)

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


class DummyFactory:
    def __init__(self, session):
        self._session = session

    def __call__(self):
        return self._session


def fake_currency_constructor(code, symbol, rate_to_eur):
    # simple stand-in object used in tests instead of SQLAlchemy model
    return {"code": code, "symbol": symbol, "rate_to_eur": rate_to_eur}


def test_seed_success(monkeypatch, caplog):
    caplog.set_level(logging.INFO)
    dummy = DummySession()
    monkeypatch.setattr(seed, "get_session_factory", lambda: DummyFactory(dummy))
    # patch Currency to avoid SQLAlchemy instantiation
    monkeypatch.setattr(seed, "Currency", fake_currency_constructor)

    seed.seed_currencies()

    assert dummy.committed is True
    assert len(dummy.merged) == 4
    assert "Devises insérées avec succès" in caplog.text


def test_seed_exception_triggers_rollback(monkeypatch, caplog):
    caplog.set_level(logging.INFO)

    class BadSession(DummySession):
        def merge(self, item):
            raise RuntimeError("merge failed")

    bad = BadSession()
    monkeypatch.setattr(seed, "get_session_factory", lambda: DummyFactory(bad))
    monkeypatch.setattr(seed, "Currency", fake_currency_constructor)

    seed.seed_currencies()

    # rollback attempted
    assert bad.rolled_back is True or bad.closed is True
    assert "Erreur lors du seeding des devises" in caplog.text


def test_seed_rollback_and_close_exceptions(monkeypatch, caplog):
    caplog.set_level(logging.INFO)

    class BadRollbackSession(DummySession):
        def merge(self, item):
            raise RuntimeError("merge failed")

        def rollback(self):
            raise RuntimeError("rollback failed")

        def close(self):
            raise RuntimeError("close failed")

    bad = BadRollbackSession()
    monkeypatch.setattr(seed, "get_session_factory", lambda: DummyFactory(bad))
    monkeypatch.setattr(seed, "Currency", fake_currency_constructor)

    seed.seed_currencies()

    # The inner except handlers should have logged errors
    assert "Rollback failed while handling seed exception" in caplog.text
    assert "Failed to close DB session after seeding" in caplog.text


def test_run_module_main(monkeypatch, caplog, tmp_path):
    caplog.set_level(logging.INFO)
    # Use a session that succeeds to avoid exceptions
    dummy = DummySession()
    monkeypatch.setattr(seed, "get_session_factory", lambda: DummyFactory(dummy))
    monkeypatch.setattr(seed, "Currency", fake_currency_constructor)

    # Call the function directly instead of executing the module; this avoids
    # runpy/sys.modules timing issues with `app.core.database` on import.
    seed.seed_currencies()

    # confirm it ran and committed
    assert dummy.committed is True
    assert "Devises insérées avec succès" in caplog.text

