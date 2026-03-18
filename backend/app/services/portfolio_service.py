from sqlalchemy.orm import Session

from app.models.position import Position
from app.models.transaction import Transaction, TransactionType
from app.services.asset_service import AssetService


class PortfolioService:
    @staticmethod
    def add_transaction(db: Session, portfolio_id, ticker, type, quantity, price, date):
        # Ensure the referenced asset exists.
        asset = AssetService.get_or_create_asset(db, ticker)

        # Persist the transaction.
        new_tx = Transaction(
            portfolio_id=portfolio_id,
            asset_ticker=asset.ticker,
            type=type,
            quantity=quantity,
            price_at_transaction=price,
            transaction_date=date,
        )
        db.add(new_tx)

        # Update or create the aggregated position.
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
                # First buy for this asset in the portfolio.
                pos = Position(
                    portfolio_id=portfolio_id,
                    asset_ticker=asset.ticker,
                    quantity=quantity,
                    average_buy_price=price,
                )
                db.add(pos)
            else:
                # Weighted average cost update on buy.
                total_cost = (pos.quantity * pos.average_buy_price) + (quantity * price)
                pos.quantity += quantity
                pos.average_buy_price = total_cost / pos.quantity

        elif type == TransactionType.SELL:
            if not pos or pos.quantity < quantity:
                raise ValueError("Quantité insuffisante pour vendre.")
            pos.quantity -= quantity
            # Average buy price remains unchanged on sell.

        db.commit()
        return new_tx
