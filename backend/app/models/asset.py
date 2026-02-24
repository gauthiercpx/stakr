import enum

import sqlalchemy as sa
from sqlalchemy import String

from app.core.database import Base


class AssetType(str, enum.Enum):
    STOCK = "stock"  # Shares (Apple, LVMH)
    CRYPTO = "crypto"  # Cryptocurrencies (BTC, ETH)
    ETF = "etf"  # Exchange-traded funds (S&P 500, MSCI World)
    FOREX = "forex"  # Currency pairs (EUR/USD)
    COMMODITY = "commodity"  # Commodities (Gold, Oil)
    INDEX = "index"  # Stock indices (CAC 40, Nasdaq)


class Asset(Base):
    __tablename__ = "asset"

    ticker = sa.Column(String, primary_key=True, index=True)
    asset_type = sa.Column(sa.Enum(AssetType), nullable=False, default=AssetType.STOCK)
    name = sa.Column(String, nullable=False)
    currency_code = sa.Column(sa.String(3), sa.ForeignKey("currency.code"))
    current_price = sa.Column(sa.Numeric(precision=24, scale=10), nullable=False)
    last_updated_at = sa.Column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )
