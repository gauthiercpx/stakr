import logging
from collections.abc import Iterable

import yfinance as yf
from sqlalchemy.orm import Session

from app.models import Asset, DividendEvent, PriceHistory

logger = logging.getLogger(__name__)


class MarketSyncService:
    @staticmethod
    def _normalize_tickers(tickers: Iterable[str]) -> list[str]:
        normalized: list[str] = []
        seen: set[str] = set()
        for ticker in tickers:
            value = str(ticker).strip().upper()
            if not value or value in seen:
                continue
            seen.add(value)
            normalized.append(value)
        return normalized

    @staticmethod
    def sync_all_price_histories(db: Session, period: str = "1mo") -> int:
        """
        Fetch price history for every tracked asset.

        period examples: "1mo", "1y", "max".
        Returns the number of inserted rows.
        """
        assets = db.query(Asset).all()
        return MarketSyncService.sync_price_histories_for_tickers(
            db=db,
            tickers=[str(asset.ticker) for asset in assets],
            period=period,
        )

    @staticmethod
    def sync_price_histories_for_tickers(
        db: Session, tickers: Iterable[str], period: str = "1mo"
    ) -> int:
        total_added = 0
        for ticker in MarketSyncService._normalize_tickers(tickers):
            try:
                ticker_data = yf.Ticker(ticker)
                hist = ticker_data.history(period=period)

                if hist.empty:
                    continue

                for date, row in hist.iterrows():
                    record_date = date.to_pydatetime()
                    close_price = float(row["Close"])

                    existing_record = (
                        db.query(PriceHistory)
                        .filter(
                            PriceHistory.asset_ticker == ticker,
                            PriceHistory.timestamp == record_date,
                        )
                        .first()
                    )

                    if not existing_record:
                        new_price = PriceHistory(
                            asset_ticker=ticker,
                            price=close_price,
                            timestamp=record_date,
                        )
                        db.add(new_price)
                        total_added += 1

                db.commit()
            except Exception:
                logger.exception("Failed to sync price history for %s", ticker)
                try:
                    db.rollback()
                except Exception:
                    logger.exception("Rollback failed for %s", ticker)

        return total_added

    @staticmethod
    def sync_dividends(db: Session) -> int:
        assets = db.query(Asset).all()
        return MarketSyncService.sync_dividends_for_tickers(
            db=db,
            tickers=[str(asset.ticker) for asset in assets],
        )

    @staticmethod
    def sync_dividends_for_tickers(db: Session, tickers: Iterable[str]) -> int:
        total_added = 0

        for ticker in MarketSyncService._normalize_tickers(tickers):
            try:
                asset = db.query(Asset).filter(Asset.ticker == ticker).first()
                if not asset:
                    continue

                ticker_data = yf.Ticker(ticker)
                div_series = ticker_data.dividends

                if div_series.empty:
                    continue

                for date, amount in div_series.items():
                    div_amount = float(amount)
                    div_date = date.to_pydatetime().date()

                    exists = (
                        db.query(DividendEvent)
                        .filter(
                            DividendEvent.asset_ticker == ticker,
                            DividendEvent.ex_date == div_date,
                        )
                        .first()
                    )

                    if not exists:
                        new_div = DividendEvent(
                            asset_ticker=ticker,
                            amount_per_share=div_amount,
                            ex_date=div_date,
                            currency_code=asset.currency_code,
                        )
                        db.add(new_div)
                        total_added += 1

                db.commit()
            except Exception:
                logger.exception("Error syncing dividends for %s", ticker)
                try:
                    db.rollback()
                except Exception:
                    logger.exception("Rollback failed for %s", ticker)

        return total_added
