from datetime import datetime
from decimal import Decimal
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app import app
from app.api import deps
from app.core.database import get_db

client = TestClient(app)


def override_get_db_factory(db):
    def _override_get_db():
        return db

    return _override_get_db


def fake_user_super():
    u = MagicMock()
    u.id = "user-1"
    u.is_superuser = True
    return u


def fake_user_normal():
    u = MagicMock()
    u.id = "user-1"
    u.is_superuser = False
    return u


def test_search_assets_endpoint(monkeypatch):
    # Mock MarketDataService.search_assets
    monkeypatch.setattr(
        "app.services.market_data.MarketDataService.search_assets",
        lambda q: [{"ticker": "ABC", "shortname": "ABC Corp"}],
    )

    resp = client.get("/assets/search", params={"asset": "ABC"})
    assert resp.status_code == 200
    assert "results" in resp.json()


def test_get_asset_history_and_sync_endpoints(monkeypatch):
    # Mock DB history query with dicts matching the schema
    fake_history = [{"timestamp": datetime(2020, 1, 1), "price": Decimal("10.5")}]
    db = MagicMock()
    db.query.return_value.filter.return_value.order_by.return_value.all.return_value = (
        fake_history
    )

    # Override get_db and current_user
    app.dependency_overrides[get_db] = override_get_db_factory(db)
    app.dependency_overrides[deps.get_current_user] = lambda: fake_user_normal()

    # Test get history
    resp = client.get("/assets/TST/history")
    assert resp.status_code == 200
    j = resp.json()
    assert j["ticker"] == "TST"

    # Now test sync endpoints which require superuser
    app.dependency_overrides[deps.get_current_user] = lambda: fake_user_super()

    monkeypatch.setattr(
        "app.services.market_sync.MarketSyncService.sync_all_price_histories",
        lambda db, period="1mo": 5,
    )
    monkeypatch.setattr(
        "app.services.market_sync.MarketSyncService.sync_dividends", lambda db: 3
    )

    resp2 = client.post("/assets/sync-history")
    assert resp2.status_code == 200
    assert resp2.json()["new_records_inserted"] == 5

    resp3 = client.post("/assets/sync-dividends")
    assert resp3.status_code == 200
    assert resp3.json()["new_dividends_inserted"] == 3

    app.dependency_overrides.clear()
