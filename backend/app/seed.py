from decimal import Decimal
from app.core.database import get_session_factory
from app.models.currency import Currency

import logging

logger = logging.getLogger(__name__)


def seed_currencies():
    # On récupère la factory puis on crée la session
    SessionFactory = get_session_factory()
    db = SessionFactory()

    try:
        currencies = [
            Currency(code="EUR", symbol="€", rate_to_eur=Decimal("1.0")),
            Currency(code="USD", symbol="$", rate_to_eur=Decimal("0.92")),
            Currency(code="GBP", symbol="£", rate_to_eur=Decimal("1.15")),
            Currency(code="CHF", symbol="CHF", rate_to_eur=Decimal("1.02")),
        ]

        for c in currencies:
            db.merge(c)

        db.commit()
        logger.info("Devises insérées avec succès (%d items).", len(currencies))
    except Exception as e:
        logger.exception("Erreur lors du seeding des devises: %s", e)
        try:
            db.rollback()
        except Exception:
            logger.exception("Rollback failed while handling seed exception")
    finally:
        try:
            db.close()
        except Exception:
            logger.exception("Failed to close DB session after seeding")


if __name__ == "__main__":
    seed_currencies()