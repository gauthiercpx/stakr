import logging

import yfinance as yf
from sqlalchemy.orm import Session

from app.models import Asset, DividendEvent, PriceHistory

logger = logging.getLogger(__name__)


class MarketSyncService:
    @staticmethod
    def sync_all_price_histories(db: Session, period: str = "1mo") -> int:
        """
        Parcourt tous les actifs en base et télécharge leur historique de prix.

        period: "1mo" (1 mois), "1y" (1 an), "max", etc.
        Retourne le nombre total d'entrées insérées.
        """
        assets = db.query(Asset).all()
        total_added = 0

        for asset in assets:
            # Force a plain Python string for ticker to avoid typing/runtime issues
            ticker = str(asset.ticker)

            try:
                # 1. On interroge Yahoo pour cet actif spécifique
                ticker_data = yf.Ticker(ticker)
                hist = ticker_data.history(period=period)

                if hist.empty:
                    continue

                # 2. On parcourt les jours renvoyés par Yahoo
                for date, row in hist.iterrows():
                    record_date = date.to_pydatetime()

                    # Convertit explicitement en float Python
                    close_price = float(row["Close"])

                    # 3. On vérifie si on a déjà ce prix en base
                    existing_record = (
                        db.query(PriceHistory)
                        .filter(
                            PriceHistory.asset_ticker == ticker,
                            PriceHistory.timestamp == record_date,
                        )
                        .first()
                    )

                    # 4. On insère si ça n'existe pas
                    if not existing_record:
                        new_price = PriceHistory(
                            asset_ticker=ticker,
                            price=close_price,
                            timestamp=record_date,
                        )
                        db.add(new_price)
                        total_added += 1

                # Sauvegarde des changements pour cet actif
                db.commit()

            except Exception:
                logger.exception("Erreur lors de la synchro de %s", ticker)
                try:
                    db.rollback()
                except Exception:
                    # rollback should not crash the sync loop
                    logger.exception("Échec du rollback pour %s", ticker)

        return total_added

    @staticmethod
    def sync_dividends(db: Session) -> int:
        assets = db.query(Asset).all()
        total_added = 0

        for asset in assets:
            # Use plain Python string for ticker
            ticker = str(asset.ticker)
            try:
                ticker_data = yf.Ticker(ticker)
                div_series = ticker_data.dividends

                if div_series.empty:
                    continue

                for date, amount in div_series.items():
                    div_amount = float(amount)

                    # Convert to a date (sa.Date expects a date object)
                    div_date = date.to_pydatetime().date()

                    # Check for existing dividend by ticker and ex_date
                    exists = (
                        db.query(DividendEvent)
                        .filter(
                            DividendEvent.asset_ticker == ticker,
                            DividendEvent.ex_date == div_date,
                        )
                        .first()
                    )

                    if not exists:
                        # Insert new dividend event
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
                # log exception and rollback; keep loop running
                logger.exception("Error syncing dividends for %s", ticker)
                try:
                    db.rollback()
                except Exception:
                    logger.exception("Rollback failed for %s", ticker)

        return total_added
