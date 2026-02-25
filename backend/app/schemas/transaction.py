from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.transaction import TransactionType  # Ton Enum


class TransactionCreate(BaseModel):
    portfolio_id: UUID
    asset_ticker: str = Field(..., description="Le ticker de l'actif, ex: AAPL, BTC")
    type: TransactionType
    quantity: Decimal = Field(
        ..., gt=0, description="La quantité doit être strictement positive"
    )
    price: Decimal = Field(
        ..., gt=0, description="Le prix unitaire lors de la transaction"
    )
    transaction_date: datetime
    fees: Optional[Decimal] = Field(default=Decimal("0.0"), ge=0)

    @field_validator("type", mode="before")
    def normalize_type(cls, v):
        # Accept strings (case-insensitive) and convert to the enum
        if isinstance(v, str):
            try:
                return TransactionType(v.lower())
            except Exception:
                raise ValueError(f"Invalid transaction type: {v}")
        return v


class TransactionResponse(BaseModel):
    id: UUID
    portfolio_id: UUID
    asset_ticker: Optional[str]
    type: TransactionType
    quantity: Decimal
    price_at_transaction: Decimal
    fees: Decimal
    transaction_date: datetime
    created_at: datetime

    # Permet à Pydantic de lire un objet SQLAlchemy
    model_config = ConfigDict(from_attributes=True)
