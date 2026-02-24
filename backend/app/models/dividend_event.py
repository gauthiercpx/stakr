import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class DividendEvent(Base):
    __tablename__ = "dividend_event"

    id = sa.Column(
        UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuidv7()")
    )

    asset_ticker = sa.Column(
        sa.String,
        sa.ForeignKey("asset.ticker", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    amount_per_share = sa.Column(sa.Numeric(precision=20, scale=8), nullable=False)
    currency_code = sa.Column(
        sa.String(3), sa.ForeignKey("currency.code"), nullable=False
    )
    ex_date = sa.Column(sa.Date, nullable=False, index=True)
    payment_date = sa.Column(sa.Date, nullable=True)
    created_at = sa.Column(sa.DateTime(timezone=True), server_default=sa.func.now())

    asset = relationship("Asset")
    currency = relationship("Currency")
