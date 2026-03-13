from decimal import Decimal
from types import SimpleNamespace
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


def test_get_portfolio_positions(monkeypatch):
    db = MagicMock()
    # Three queries are expected: portfolio, positions, dividends aggregation.
    q_portfolio = MagicMock()
    q_positions = MagicMock()
    q_dividends = MagicMock()
    db.query.side_effect = [q_portfolio, q_positions, q_dividends]

    # portfolio existence
    portfolio_exists = SimpleNamespace(
        id=str(uuid4()),
        user_id=str(uuid4()),
    )
    q_portfolio.filter.return_value.first.return_value = portfolio_exists

    # prepare one position tuple (pos, asset)
    pos = SimpleNamespace(
        id=str(uuid4()),
        portfolio_id=str(uuid4()),
        asset_ticker="ABC",
        quantity=Decimal("2"),
        average_buy_price=Decimal("5"),
    )
    asset = SimpleNamespace(
        ticker="ABC",
        name="ABC Corp",
        asset_type="stock",
        currency_code="USD",
        current_price=Decimal("10"),
    )

    q_positions.join.return_value.filter.return_value.all.return_value = [(pos, asset)]
    q_dividends.filter.return_value.group_by.return_value.all.return_value = []

    app.dependency_overrides[get_db] = override_get_db_factory(db)
    app.dependency_overrides[deps.get_current_user] = lambda: fake_user()

    resp = client.get(f"/portfolios/{pos.portfolio_id}/positions")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert data[0]["asset_ticker"] == "ABC"

    app.dependency_overrides.clear()


def test_get_portfolio_summary(monkeypatch):
    db = MagicMock()
    q_portfolio = MagicMock()
    q_positions = MagicMock()
    q_dividends = MagicMock()
    db.query.side_effect = [q_portfolio, q_positions, q_dividends]

    portfolio_id = uuid4()
    # portfolio exists
    portfolio_obj = SimpleNamespace(
        id=str(portfolio_id),
        user_id=str(uuid4()),
        name="P",
    )
    q_portfolio.filter.return_value.first.return_value = portfolio_obj

    # Two positions
    pos1 = SimpleNamespace(
        quantity=Decimal("1"),
        average_buy_price=Decimal("5"),
        asset_ticker="AAA",
    )
    asset1 = SimpleNamespace(ticker="AAA", current_price=Decimal("10"))
    pos2 = SimpleNamespace(
        quantity=Decimal("2"),
        average_buy_price=Decimal("7"),
        asset_ticker="BBB",
    )
    asset2 = SimpleNamespace(ticker="BBB", current_price=Decimal("11"))

    monkeypatch.setattr(
        "app.routers.portfolio.MarketDataService.get_current_price",
        lambda _ticker: None,
    )

    q_positions.join.return_value.filter.return_value.all.return_value = [
        (pos1, asset1),
        (pos2, asset2),
    ]
    q_dividends.filter.return_value.group_by.return_value.all.return_value = []

    app.dependency_overrides[get_db] = override_get_db_factory(db)
    app.dependency_overrides[deps.get_current_user] = lambda: fake_user()

    resp = client.get(f"/portfolios/{portfolio_id}/summary")
    assert resp.status_code == 200
    data = resp.json()
    # total_value = 1*10 + 2*11 = 32
    assert float(data["total_value"]) == 32.0

    app.dependency_overrides.clear()
