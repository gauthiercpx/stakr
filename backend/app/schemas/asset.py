from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict


class PriceHistoryResponse(BaseModel):
    timestamp: datetime
    price: Decimal

    model_config = ConfigDict(from_attributes=True)


class PriceHistoryListResponse(BaseModel):
    ticker: str
    count: int
    history: List[PriceHistoryResponse]

    model_config = ConfigDict(from_attributes=True)
