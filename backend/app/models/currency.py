import sqlalchemy as sa

from app.core.database import Base


class Currency(Base):
    __tablename__ = "currency"
    code = sa.Column(sa.String(3), primary_key=True)  # "EUR", "USD"
    symbol = sa.Column(sa.String(5))  # "€"
    rate_to_eur = sa.Column(sa.Numeric(precision=20, scale=6))  # Taux de change
