# app/api/routers/portfolios.py
from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.models import Asset, Portfolio, Position
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse, PortfolioSummary
from app.schemas.position import PositionResponse

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])


@router.post("/", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    portfolio_in: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),  # <-- C'EST ICI QUE TOUT SE JOUE
):
    # On utilise l'ID de l'utilisateur fraîchement authentifié
    new_portfolio = Portfolio(user_id=current_user.id, name=portfolio_in.name)
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)

    return new_portfolio


@router.get("/{portfolio_id}/positions", response_model=List[PositionResponse])
def get_portfolio_positions(
    portfolio_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    # 1. Sécurité : Vérifier que le portefeuille appartient bien à l'utilisateur
    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id)
        .first()
    )

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portefeuille introuvable.")

    # 2. La fameuse Jointure SQL !
    # On demande à la base de nous ramener (Position, Asset) en même temps
    results = (
        db.query(Position, Asset)
        .join(Asset, Position.asset_ticker == Asset.ticker)
        .filter(Position.portfolio_id == portfolio_id, Position.quantity > 0)
        .all()
    )

    # 3. On reformate les données pour que Pydantic soit content
    response = []
    for pos, asset in results:
        response.append(
            {
                "id": pos.id,
                "portfolio_id": pos.portfolio_id,
                "asset_ticker": pos.asset_ticker,
                "quantity": pos.quantity,
                "average_buy_price": pos.average_buy_price,
                # On injecte les infos de l'actif
                "asset_name": asset.name,
                "asset_type": asset.asset_type,
                "currency_code": asset.currency_code,
                "current_price": asset.current_price,
            }
        )

    return response


@router.get("/{portfolio_id}/summary", response_model=PortfolioSummary)
def get_portfolio_summary(
    portfolio_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    # 1. Sécurité & Récupération du nom
    portfolio = (
        db.query(Portfolio)
        .filter(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id)
        .first()
    )

    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio non trouvé")

    # 2. Récupération des positions et des prix actuels (Jointure)
    results = (
        db.query(Position, Asset)
        .join(Asset, Position.asset_ticker == Asset.ticker)
        .filter(Position.portfolio_id == portfolio_id)
        .all()
    )

    total_value = Decimal("0.0")
    total_invested = Decimal("0.0")

    for pos, asset in results:
        # Valeur actuelle : Qté * Prix marché
        total_value += pos.quantity * asset.current_price
        # Valeur investie : Qté * PRU
        total_invested += pos.quantity * pos.average_buy_price

    # 3. Calculs finaux
    global_pnl = total_value - total_invested
    # Éviter la division par zéro si le portfolio est vide
    global_pnl_percent = (
        (global_pnl / total_invested * 100) if total_invested > 0 else 0
    )

    return {
        "portfolio_id": portfolio_id,
        "portfolio_name": portfolio.name,
        "total_value": total_value,
        "total_invested": total_invested,
        "global_pnl": global_pnl,
        "global_pnl_percent": round(global_pnl_percent, 2),
    }
