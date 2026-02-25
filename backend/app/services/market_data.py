import logging
from typing import Dict, Optional

import requests
import yfinance as yf

logger = logging.getLogger(__name__)


class MarketDataService:
    @staticmethod
    def get_asset_info(ticker: str) -> Optional[Dict]:
        """Fetch basic asset info from Yahoo Finance.

        Returns a dict with name, currency, type and price or None on error.
        """
        try:
            asset = yf.Ticker(ticker)
            info = asset.info

            # 1. Get raw Yahoo type (default EQUITY)
            raw_type = info.get("quoteType", "EQUITY").upper()

            # 2. Map Yahoo types to our AssetType values
            type_mapping = {
                "EQUITY": "stock",
                "CRYPTOCURRENCY": "crypto",
                "ETF": "etf",
                "MUTUALFUND": "fund",
                "CURRENCY": "crypto",  # sometimes used for cryptos
            }

            db_asset_type = type_mapping.get(raw_type, "stock")

            return {
                "name": info.get("longName") or info.get("shortName") or ticker,
                "currency": info.get("currency", "USD"),
                "type": db_asset_type,
                "price": info.get("currentPrice")
                or info.get("regularMarketPrice")
                or 0.0,
            }
        except Exception as e:
            logger.exception("Failed fetching asset info for %s: %s", ticker, e)
            return None

    @staticmethod
    def search_assets(query: str):
        """Search assets by name/ticker via Yahoo's public search API."""
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
        # Yahoo blocks some requests without a User-Agent; pretend to be a browser
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            results = []
            for quote in data.get("quotes", []):
                # Keep only real assets (actions, cryptos, etfs)
                if "symbol" in quote and "shortname" in quote:
                    results.append(
                        {
                            "ticker": quote["symbol"],
                            "name": quote["shortname"],
                            "type": quote.get("quoteType", "UNKNOWN"),
                            "exchange": quote.get("exchange", "UNKNOWN"),
                        }
                    )
            return results
        except Exception as e:
            logger.exception("Search failed for %s: %s", query, e)
            return []

    @staticmethod
    def get_dividends_history(ticker: str):
        """Return historical dividends as a pandas Series (Date -> Amount)."""
        try:
            asset = yf.Ticker(ticker)
            dividends = asset.dividends
            return dividends
        except Exception as e:
            logger.exception("Failed fetching dividends for %s: %s", ticker, e)
            return []
