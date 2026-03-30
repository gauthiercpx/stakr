import logging
from collections.abc import Iterable
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.database import get_session_factory
from app.models import Portfolio, Position
from app.services.market_sync import MarketSyncService

logger = logging.getLogger(__name__)


def _extract_tickers(rows: Iterable[tuple[str]]) -> list[str]:
    seen: set[str] = set()
    tickers: list[str] = []
    for row in rows:
        value = row[0] if row else None
        if not value:
            continue
        ticker = str(value).strip().upper()
        if not ticker or ticker in seen:
            continue
        seen.add(ticker)
        tickers.append(ticker)
    return tickers


def run_user_market_sync(user_id: UUID) -> dict[str, int]:
    """Best-effort sync of market data for tickers owned by one user."""
    db: Session | None = None
    try:
        session_factory = get_session_factory()
        db = session_factory()

        ticker_rows = (
            db.query(Position.asset_ticker)
            .join(Portfolio, Position.portfolio_id == Portfolio.id)
            .filter(Portfolio.user_id == user_id)
            .distinct()
            .all()
        )
        tickers = _extract_tickers(ticker_rows)

        if not tickers:
            return {"tickers": 0, "prices": 0, "dividends": 0}

        prices_added = 0
        dividends_added = 0

        try:
            prices_added = MarketSyncService.sync_price_histories_for_tickers(
                db, tickers=tickers, period="1mo"
            )
        except Exception:
            logger.exception("Failed price sync during login for user=%s", user_id)

        try:
            dividends_added = MarketSyncService.sync_dividends_for_tickers(
                db, tickers=tickers
            )
        except Exception:
            logger.exception("Failed dividends sync during login for user=%s", user_id)

        return {
            "tickers": len(tickers),
            "prices": prices_added,
            "dividends": dividends_added,
        }
    except Exception:
        logger.exception("Post-login sync failed for user=%s", user_id)
        return {"tickers": 0, "prices": 0, "dividends": 0}
    finally:
        if db is not None:
            db.close()
