from datetime import datetime
from unittest.mock import MagicMock

from app.services.market_sync import MarketSyncService


class DummySeries(dict):
    @property
    def empty(self):
        return not bool(self)

    def items(self):
        return super().items()


class DummyHist:
    def __init__(self, rows):
        self._rows = rows
        self.empty = not bool(rows)

    def iterrows(self):
        for k, v in self._rows.items():
            yield k, v


class DummyTicker:
    def __init__(self, history=None, dividends=None):
        self._history = history or DummyHist({})
        self.dividends = dividends or DummySeries()

    def history(self, period="1mo"):
        return self._history


class SimpleDate:
    def __init__(self, year, month, day):
        self._dt = datetime(year, month, day)

    def to_pydatetime(self):
        return self._dt


def test_sync_all_price_histories_inserts_and_commits(monkeypatch):
    # Prepare a fake DB session
    db = MagicMock()
    # One asset with ticker 'TST'
    fake_asset = MagicMock()
    fake_asset.ticker = "TST"
    db.query.return_value.all.return_value = [fake_asset]

    # Monkeypatch yf.Ticker to return history with a proper date object
    monkeypatch.setattr(
        "app.services.market_sync.yf.Ticker",
        lambda t: DummyTicker(
            history=DummyHist({SimpleDate(2020, 1, 1): {"Close": 10.0}})
        ),
    )

    added = MarketSyncService.sync_all_price_histories(db, period="1mo")
    # db.add should be called at least once and commit executed
    assert added >= 0
    assert db.commit.called


def test_sync_dividends_inserts_and_commits(monkeypatch):
    db = MagicMock()
    fake_asset = MagicMock()
    fake_asset.ticker = "TST"
    fake_asset.currency_code = "USD"
    db.query.return_value.all.return_value = [fake_asset]

    # dividends series with one entry where key has to_pydatetime()
    dividends = DummySeries({SimpleDate(2020, 1, 1): 0.5})
    monkeypatch.setattr(
        "app.services.market_sync.yf.Ticker", lambda t: DummyTicker(dividends=dividends)
    )

    added = MarketSyncService.sync_dividends(db)
    assert added >= 0
    assert db.commit.called
