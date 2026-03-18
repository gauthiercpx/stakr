from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.services.market_data import MarketDataService


class AssetService:
    @staticmethod
    def get_or_create_asset(db: Session, ticker: str):
        # Reuse existing asset when already present in DB.
        asset = db.query(Asset).filter(Asset.ticker == ticker).first()
        if asset:
            return asset

        # Otherwise fetch market metadata and create a new row.
        info = MarketDataService.get_asset_info(ticker)
        if not info:
            raise ValueError(f"Actif {ticker} introuvable sur les marchés.")

        # Currency rows are expected to be pre-seeded.
        new_asset = Asset(
            ticker=ticker,
            name=info["name"],
            asset_type=info["type"].lower(),
            currency_code=info["currency"],
            current_price=info["price"],
        )
        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        return new_asset
