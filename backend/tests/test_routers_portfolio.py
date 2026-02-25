from unittest.mock import MagicMock
from uuid import uuid4

from fastapi.testclient import TestClient

from app import app
from app.api import deps
from app.core.database import get_db

client = TestClient(app)


def override_get_db_factory(db):
    def _override_get_db():
        return db

    return _override_get_db


def fake_user():
    u = MagicMock()
    u.id = uuid4()
    return u


class DummyPortfolio:
    def __init__(self, user_id=None, name=None):
        self.id = uuid4()
        self.user_id = user_id
        self.name = name


def test_create_portfolio_and_summary(monkeypatch):
    db = MagicMock()
    app.dependency_overrides[get_db] = override_get_db_factory(db)
    app.dependency_overrides[deps.get_current_user] = lambda: fake_user()

    # Monkeypatch Portfolio constructor used in the router to return DummyPortfolio
    monkeypatch.setattr("app.routers.portfolio.Portfolio", DummyPortfolio)

    # Test create portfolio
    resp = client.post("/portfolios", json={"name": "My Portfolio"})
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert (
        data.get("portfolio_name") == "My Portfolio"
        or data.get("name") == "My Portfolio"
    )

    # Clear overrides
    app.dependency_overrides.clear()


def yield_db(db):
    try:
        yield db
    finally:
        pass
