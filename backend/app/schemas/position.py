from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PositionResponse(BaseModel):
    # Infos de la Position
    id: UUID
    portfolio_id: UUID
    asset_ticker: str
    quantity: Decimal
    average_buy_price: Decimal

    # Infos de l'Asset (issues de la jointure)
    asset_name: str
    asset_type: str
    currency_code: str
    current_price: Decimal

    model_config = ConfigDict(from_attributes=True)
