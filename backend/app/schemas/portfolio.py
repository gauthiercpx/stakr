# app/schemas/portfolio.py
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PortfolioCreate(BaseModel):
    name: str  # Seulement le nom ! Le reste, c'est le backend qui gère.
    description: str = ""  # Optionnel, avec une valeur par défaut


class PortfolioResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str

    model_config = ConfigDict(from_attributes=True)


class PortfolioSummary(BaseModel):
    portfolio_id: UUID
    portfolio_name: str
    total_value: Decimal  # Valeur actuelle totale
    total_invested: Decimal  # Somme totale investie (PRU * quantité)
    global_pnl: Decimal  # Profit/Perte total (en euros/dollars)
    global_pnl_percent: Decimal  # Pourcentage de gain/perte global

    model_config = ConfigDict(from_attributes=True)
