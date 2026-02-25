import enum

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class TransactionType(str, enum.Enum):
    BUY = "buy"
    SELL = "sell"
    DIVIDEND = "dividend"
    DEPOSIT = "deposit"  # cash deposit
    WITHDRAW = "withdraw"


class Transaction(Base):
    __tablename__ = "transaction"

    # Primary key (UUIDv7 generated in Postgres)
    id = sa.Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=sa.text("uuidv7()"),
        index=True,
    )

    # FK to portfolio
    portfolio_id = sa.Column(
        UUID(as_uuid=True),
        sa.ForeignKey("portfolio.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Optional FK to an asset (by ticker)
    asset_ticker = sa.Column(
        sa.String,
        sa.ForeignKey("asset.ticker", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    # Transaction details
    type = sa.Column(sa.Enum(TransactionType), nullable=False)
    quantity = sa.Column(sa.Numeric(precision=36, scale=18), nullable=False)
    price_at_transaction = sa.Column(sa.Numeric(precision=24, scale=10), nullable=False)
    fees = sa.Column(sa.Numeric(precision=24, scale=10), server_default=sa.text("0"))

    # Timestamps
    transaction_date = sa.Column(sa.DateTime(timezone=True), nullable=False, index=True)
    created_at = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())

    # Relationships (no back_populates to avoid cycles here)
    portfolio = relationship("Portfolio")
    asset = relationship("Asset")
