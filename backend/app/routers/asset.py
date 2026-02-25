from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.models import PriceHistory
from app.schemas.asset import PriceHistoryListResponse
from app.services.market_data import MarketDataService
from app.services.market_sync import MarketSyncService

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("/search", summary="Rechercher un actif par nom")
def search_assets(
    asset: str = Query(..., min_length=2, description="Nom ou ticker à chercher")
):
    """
    Retourne une liste d'actifs correspondants.
    Exemple : asset=credit agricole, asset=bitcoin, asset=apple
    """
    results = MarketDataService.search_assets(asset)
    return {"results": results}


@router.post("/sync-history", summary="[ADMIN] Synchroniser l'historique des prix")
def sync_price_history(
    period: str = Query("1mo", description="Période (ex: 1mo, 6mo, 1y, max)"),
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),  # <-- LE CADENAS EST ICI
):
    # Si tu as un champ is_superuser dans ton modèle User, tu peux faire :
    if getattr(current_user, "is_superuser", False) is False:
        raise HTTPException(status_code=403, detail="Accès refusé.")

    records_added = MarketSyncService.sync_all_price_histories(db=db, period=period)

    return {
        "message": "Synchronisation terminée avec succès",
        "new_records_inserted": records_added,
    }


@router.get(
    "/{ticker}/history", response_model=PriceHistoryListResponse
)  # <-- Retiré le List[] ici
def get_asset_history(
    ticker: str,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    history = (
        db.query(PriceHistory)
        .filter(PriceHistory.asset_ticker == ticker)
        .order_by(PriceHistory.timestamp.asc())
        .all()
    )

    # On retourne l'objet complet pour matcher le schéma PriceHistoryListResponse
    return {"ticker": ticker, "count": len(history), "history": history}


@router.post(
    "/sync-dividends", summary="[ADMIN] Synchroniser l'historique des dividendes"
)
def sync_dividends(
    db: Session = Depends(get_db), current_user=Depends(deps.get_current_user)
):
    """
    Scrape l'historique complet des dividendes pour tous les actifs présents en base.
    """
    if getattr(current_user, "is_superuser", False) is False:
        raise HTTPException(
            status_code=403, detail="Accès réservé aux administrateurs."
        )

    records_added = MarketSyncService.sync_dividends(db)

    return {
        "message": "Synchronisation des dividendes terminée",
        "new_dividends_inserted": records_added,
    }
