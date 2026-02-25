from app.services.market_data import MarketDataService


class DummyTicker:
    def __init__(self, info=None, history=None, dividends=None):
        self.info = info or {}
        self._history = history
        self.dividends = dividends

    def history(self, period="1mo"):
        return self._history


class DummyResponse:
    def __init__(self, data):
        self._data = data

    def raise_for_status(self):
        return None

    def json(self):
        return self._data


def test_get_asset_info_success(monkeypatch):
    info = {
        "longName": "Test Corp",
        "currency": "EUR",
        "quoteType": "EQUITY",
        "currentPrice": 12.34,
    }

    monkeypatch.setattr(
        "app.services.market_data.yf.Ticker", lambda ticker: DummyTicker(info=info)
    )

    res = MarketDataService.get_asset_info("TEST")
    assert res["name"] == "Test Corp"
    assert res["currency"] == "EUR"
    assert res["type"] == "stock"
    assert res["price"] == 12.34


def test_search_assets_success(monkeypatch):
    data = {
        "quotes": [{"symbol": "ABC", "shortname": "ABC Corp", "quoteType": "EQUITY"}]
    }

    def fake_get(url, headers=None):
        return DummyResponse(data)

    monkeypatch.setattr("app.services.market_data.requests.get", fake_get)

    results = MarketDataService.search_assets("ABC")
    assert isinstance(results, list)
    assert results and results[0]["ticker"] == "ABC"


def test_get_dividends_history(monkeypatch):
    # Simulate dividends attribute (could be any object, service just returns it)
    div = {"2020-01-01": 0.5}
    monkeypatch.setattr(
        "app.services.market_data.yf.Ticker", lambda t: DummyTicker(dividends=div)
    )

    out = MarketDataService.get_dividends_history("TST")
    assert out == div
