from unittest.mock import MagicMock

import pytest

from app.models.transaction import TransactionType
from app.services.portfolio_service import PortfolioService


def test_add_transaction_buy_creates_position(monkeypatch):
    db = MagicMock()
    # AssetService.get_or_create_asset returns an object with ticker
    asset = MagicMock()
    asset.ticker = "ABC"
    monkeypatch.setattr(
        "app.services.portfolio_service.AssetService.get_or_create_asset",
        lambda db_, t: asset,
    )

    # No existing position
    db.query.return_value.filter.return_value.first.return_value = None

    # Ensure commit is a no-op
    db.commit = MagicMock()

    tx = PortfolioService.add_transaction(
        db, "portfolio-1", "ABC", TransactionType.BUY, 10, 2.5, "2020-01-01"
    )
    assert tx is not None
    assert db.commit.called


def test_add_transaction_sell_insufficient_quantity_raises(monkeypatch):
    db = MagicMock()
    asset = MagicMock()
    asset.ticker = "ABC"
    monkeypatch.setattr(
        "app.services.portfolio_service.AssetService.get_or_create_asset",
        lambda db_, t: asset,
    )

    pos = MagicMock()
    pos.quantity = 2
    # Return existing position
    db.query.return_value.filter.return_value.first.return_value = pos

    with pytest.raises(ValueError):
        PortfolioService.add_transaction(
            db, "portfolio-1", "ABC", TransactionType.SELL, 5, 2.5, "2020-01-01"
        )
