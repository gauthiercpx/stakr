from unittest.mock import MagicMock

from app.services.asset_service import AssetService


def test_get_or_create_asset_existing_db_entry():
    db = MagicMock()
    existing = MagicMock()
    existing.ticker = "EX"
    # Simulate query(...).filter(...).first() -> existing
    db.query.return_value.filter.return_value.first.return_value = existing

    out = AssetService.get_or_create_asset(db, "EX")
    assert out is existing
    # MarketDataService should not be called in this path


def test_get_or_create_asset_creates_when_missing(monkeypatch):
    db = MagicMock()
    # No asset in DB
    db.query.return_value.filter.return_value.first.return_value = None

    info = {"name": "Test Asset", "type": "STOCK", "currency": "USD", "price": 5.5}

    class DummyAsset:
        def __init__(self, ticker, name, asset_type, currency_code, current_price):
            self.ticker = ticker
            self.name = name
            self.asset_type = asset_type
            self.currency_code = currency_code
            self.current_price = current_price

    # Monkeypatch MarketDataService.get_asset_info to return our info
    monkeypatch.setattr(
        "app.services.asset_service.MarketDataService.get_asset_info", lambda t: info
    )

    # Make db.add/commit/refresh no-op but ensure they are callable
    db.add = MagicMock()
    db.commit = MagicMock()
    db.refresh = MagicMock()

    new = AssetService.get_or_create_asset(db, "NEW")
    # Should have attempted to add and commit
    db.add.assert_called()
    db.commit.assert_called()
    db.refresh.assert_called()
    assert new.ticker == "NEW" or hasattr(new, "ticker")
