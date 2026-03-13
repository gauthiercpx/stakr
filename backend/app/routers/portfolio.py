# app/api/routers/portfolios.py
from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.models import Asset, DividendEvent, Portfolio, Position
from app.schemas.portfolio import PortfolioCreate, PortfolioResponse, PortfolioSummary
from app.schemas.position import PositionResponse
from app.services.market_data import MarketDataService

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])


@router.get("/", response_model=List[PortfolioResponse])
def list_portfolios(
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    return (
        db.query(Portfolio)
        .filter(Portfolio.user_id == current_user.id)
        .order_by(Portfolio.created_at.desc())
        .all()
    )


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

    tickers = [pos.asset_ticker for pos, _asset in results]
    dividends_by_ticker = {}
    if tickers:
        rows = (
            db.query(
                DividendEvent.asset_ticker,
                func.coalesce(func.sum(DividendEvent.amount_per_share), 0),
            )
            .filter(DividendEvent.asset_ticker.in_(tickers))
            .group_by(DividendEvent.asset_ticker)
            .all()
        )
        dividends_by_ticker = {ticker: amount for ticker, amount in rows}

    # 3. On reformate les données pour que Pydantic soit content
    response = []
    for pos, asset in results:
        per_share_dividends = dividends_by_ticker.get(pos.asset_ticker, Decimal("0"))
        dividends_received = pos.quantity * per_share_dividends
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
                "dividends_received": dividends_received,
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

    # ==========================================
    # 🚀 NOUVEAU : MISE À JOUR DES PRIX (ON-DEMAND)
    # ==========================================
    prices_updated = False
    for pos, asset in results:
        try:
            new_price = MarketDataService.get_current_price(asset.ticker)

            # Si le prix a changé, on met à jour l'objet en base
            if new_price and new_price != asset.current_price:
                asset.current_price = Decimal(str(new_price))
                prices_updated = True
        except Exception as e:
            # Si Yahoo échoue, on ne fait pas planter l'API, on utilise l'ancien prix
            print(f"Erreur de rafraîchissement pour {asset.ticker}: {e}")
            pass

    # On sauvegarde tous les nouveaux prix en une seule fois
    if prices_updated:
        db.commit()
    # ==========================================

    total_value = Decimal("0.0")
    total_invested = Decimal("0.0")
    total_dividends_received = Decimal("0.0")

    tickers = [pos.asset_ticker for pos, _asset in results]
    dividends_by_ticker = {}
    if tickers:
        rows = (
            db.query(
                DividendEvent.asset_ticker,
                func.coalesce(func.sum(DividendEvent.amount_per_share), 0),
            )
            .filter(DividendEvent.asset_ticker.in_(tickers))
            .group_by(DividendEvent.asset_ticker)
            .all()
        )
        dividends_by_ticker = {ticker: amount for ticker, amount in rows}

    for pos, asset in results:
        # Valeur actuelle : Qté * Prix marché
        total_value += pos.quantity * asset.current_price

        # Valeur investie : Qté * PRU
        total_invested += pos.quantity * pos.average_buy_price
        total_dividends_received += pos.quantity * dividends_by_ticker.get(
            pos.asset_ticker, Decimal("0")
        )

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
        "total_dividends_received": total_dividends_received,
    }
