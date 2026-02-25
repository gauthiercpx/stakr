from datetime import datetime
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


def test_create_transaction_success(monkeypatch):
    db = MagicMock()
    app.dependency_overrides[get_db] = override_get_db_factory(db)
    app.dependency_overrides[deps.get_current_user] = lambda: fake_user()

    # Mock Portfolio query: return a portfolio
    db.query.return_value.filter.return_value.first.return_value = MagicMock()

    # Prepare a complete response-like dict matching TransactionResponse
    now = datetime.utcnow().isoformat()
    tx_resp = {
        "id": str(uuid4()),
        "portfolio_id": str(uuid4()),
        "asset_ticker": "ABC",
        "type": "buy",
        "quantity": "1",
        "price_at_transaction": "10.0",
        "fees": "0",
        "transaction_date": now,
        "created_at": now,
    }

    # Mock PortfolioService.add_transaction to return a full response-like dict
    monkeypatch.setattr(
        "app.routers.transaction.PortfolioService.add_transaction", lambda **kw: tx_resp
    )

    resp = client.post(
        "/transactions",
        json={
            "portfolio_id": str(uuid4()),
            "asset_ticker": "ABC",
            "type": "buy",
            "quantity": "1",
            "price": "10.0",
            "transaction_date": now,
        },
    )

    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["id"] == tx_resp["id"]

    app.dependency_overrides.clear()


def yield_db(db):
    try:
        yield db
    finally:
        pass
