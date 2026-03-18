from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PortfolioCreate(BaseModel):
    name: str
    description: str = ""


class PortfolioResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class PortfolioSummary(BaseModel):
    portfolio_id: UUID
    portfolio_name: str
    total_value: Decimal
    total_invested: Decimal
    global_pnl: Decimal
    global_pnl_percent: Decimal
    total_dividends_received: Decimal

    model_config = ConfigDict(from_attributes=True)
