import sqlalchemy as sa
import uuid6
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Position(Base):
    __tablename__ = "position"

    # 1) Unique ID (UUIDv7)
    id = sa.Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid6.uuid7,
        server_default=sa.text("uuidv7()"),
        index=True,
    )

    # 2) Reference to the parent portfolio
    portfolio_id = sa.Column(
        UUID(as_uuid=True),
        sa.ForeignKey("portfolio.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # 3) Linked asset by ticker (natural string key)
    asset_ticker = sa.Column(
        sa.String,
        sa.ForeignKey("asset.ticker", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # 4) Financial fields
    # - quantity: supports up to 18 decimals (e.g. wei)
    quantity = sa.Column(sa.Numeric(precision=36, scale=18), nullable=False, default=0)

    # - average_buy_price (unit cost) with sufficient precision
    average_buy_price = sa.Column(sa.Numeric(precision=24, scale=10), nullable=False, default=0)

    # 5) Timestamps
    created_at = sa.Column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at = sa.Column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    # 6) Relationships
    # - portfolio: back-reference to Portfolio (positions collection)
    portfolio = relationship("Portfolio", back_populates="positions")

    # - asset: relationship to Asset model (no back_populates required here)
    asset = relationship("Asset")
