from sqlalchemy.orm import Session

from app.models.position import Position
from app.models.transaction import Transaction, TransactionType
from app.services.asset_service import AssetService


class PortfolioService:
    @staticmethod
    def add_transaction(db: Session, portfolio_id, ticker, type, quantity, price, date):
        # 1. S'assurer que l'actif existe
        asset = AssetService.get_or_create_asset(db, ticker)

        # 2. Enregistrer la transaction
        new_tx = Transaction(
            portfolio_id=portfolio_id,
            asset_ticker=asset.ticker,
            type=type,
            quantity=quantity,
            price_at_transaction=price,
            transaction_date=date,
        )
        db.add(new_tx)

        # 3. Mettre à jour la Position
        pos = (
            db.query(Position)
            .filter(
                Position.portfolio_id == portfolio_id,
                Position.asset_ticker == asset.ticker,
            )
            .first()
        )

        if type == TransactionType.BUY:
            if not pos:
                # Première fois qu'on achète cet actif
                pos = Position(
                    portfolio_id=portfolio_id,
                    asset_ticker=asset.ticker,
                    quantity=quantity,
                    average_buy_price=price,
                )
                db.add(pos)
            else:
                # Recalcul du PRU (moyenne pondérée)
                total_cost = (pos.quantity * pos.average_buy_price) + (quantity * price)
                pos.quantity += quantity
                pos.average_buy_price = total_cost / pos.quantity

        elif type == TransactionType.SELL:
            if not pos or pos.quantity < quantity:
                raise ValueError("Quantité insuffisante pour vendre.")
            pos.quantity -= quantity
            # On ne change pas le PRU lors d'une vente

        db.commit()
        return new_tx
