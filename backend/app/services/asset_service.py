from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.services.market_data import MarketDataService


class AssetService:
    @staticmethod
    def get_or_create_asset(db: Session, ticker: str):
        # 1. On cherche en base
        asset = db.query(Asset).filter(Asset.ticker == ticker).first()
        if asset:
            return asset

        # 2. Si pas là, on cherche sur le web
        info = MarketDataService.get_asset_info(ticker)
        if not info:
            raise ValueError(f"Actif {ticker} introuvable sur les marchés.")

        # 3. On crée l'actif proprement
        # Note: On part du principe que la CURRENCY existe déjà (ton seed)
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
