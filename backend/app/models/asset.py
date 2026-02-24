import enum

import sqlalchemy as sa
from sqlalchemy import Boolean, Column, String, Enum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class AssetType(str, enum.Enum):
    STOCK = "stock"  # Actions (Apple, LVMH)
    CRYPTO = "crypto"  # Cryptomonnaies (BTC, ETH)
    ETF = "etf"  # Trackers (S&P 500, MSCI World)
    FOREX = "forex"  # Paires de devises (EUR/USD)
    COMMODITY = "commodity"  # Matières premières (Or, Pétrole)
    INDEX = "index"  # Indices boursiers (CAC 40, Nasdaq)


class Asset(Base):
    __tablename__ = "asset"

    ticker = sa.Column(String, primary_key=True, index=True)
    asset_type = sa.Column(sa.Enum(AssetType), nullable=False, default=AssetType.STOCK)
    name = sa.Column(String, nullable=False)
    currency_code = sa.Column(sa.String(3), sa.ForeignKey("currency.code"))
    current_price = sa.Column(sa.Numeric(precision=20, scale=4), nullable=False)
    last_updated_at = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(),
                                nullable=False)
