import sqlalchemy as sa
import uuid6
from sqlalchemy import Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Portfolio(Base):
    __tablename__ = "portfolio"

    # Ajout du server_default pour correspondre à ta DB Azure
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid6.uuid7,
        server_default=sa.text("uuidv7()"),  # <-- ICI
        index=True,
    )

    # Ajout du ondelete="CASCADE" pour correspondre à l'Alembic
    user_id = Column(
        UUID(as_uuid=True),
        sa.ForeignKey("user.id", ondelete="CASCADE"),  # <-- ICI
        nullable=False,
    )

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)

    created_at = Column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at = Column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="portfolios")

    positions = relationship(
        "Position", back_populates="portfolio", cascade="all, delete-orphan"
    )
