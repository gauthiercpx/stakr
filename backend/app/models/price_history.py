import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = sa.Column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuidv7()")
    )

    asset_ticker = sa.Column(
        sa.String,
        sa.ForeignKey("asset.ticker", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    price = sa.Column(sa.Numeric(precision=24, scale=10), nullable=False)
    timestamp = sa.Column(sa.DateTime(timezone=True), nullable=False, index=True)

    asset = relationship("Asset")
