from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.models import Portfolio
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.services.portfolio_service import PortfolioService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post(
    "/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED
)
def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(deps.get_current_user),
):
    # Ensure the portfolio exists and belongs to the current user.
    portfolio = (
        db.query(Portfolio)
        .filter(
            Portfolio.id == transaction_in.portfolio_id,
            Portfolio.user_id == current_user.id,
        )
        .first()
    )

    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Portefeuille introuvable ou vous n'êtes pas autorisé" " à le modifier."
            ),
        )

    try:
        new_tx = PortfolioService.add_transaction(
            db=db,
            portfolio_id=transaction_in.portfolio_id,
            ticker=transaction_in.asset_ticker,
            type=transaction_in.type,
            quantity=transaction_in.quantity,
            price=transaction_in.price,
            date=transaction_in.transaction_date,
        )
        return new_tx

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
