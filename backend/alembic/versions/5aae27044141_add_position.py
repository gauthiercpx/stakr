"""add position

Revision ID: 5aae27044141
Revises: 20200d442304
Create Date: 2026-02-24 22:33:52.977636

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5aae27044141'
down_revision: Union[str, Sequence[str], None] = '20200d442304'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('position',
    sa.Column('id', sa.UUID(), server_default=sa.text('uuidv7()'), nullable=False),
    sa.Column('portfolio_id', sa.UUID(), nullable=False),
    sa.Column('asset_ticker', sa.String(), nullable=False),
    sa.Column('quantity', sa.Numeric(precision=36, scale=18), nullable=False),
    sa.Column('average_buy_price', sa.Numeric(precision=24, scale=10), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['asset_ticker'], ['asset.ticker'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['portfolio_id'], ['portfolio.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_position_asset_ticker'), 'position', ['asset_ticker'], unique=False)
    op.create_index(op.f('ix_position_id'), 'position', ['id'], unique=False)
    op.create_index(op.f('ix_position_portfolio_id'), 'position', ['portfolio_id'], unique=False)
    op.alter_column('asset', 'current_price',
               existing_type=sa.NUMERIC(precision=20, scale=4),
               type_=sa.Numeric(precision=24, scale=10),
               existing_nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('asset', 'current_price',
               existing_type=sa.Numeric(precision=24, scale=10),
               type_=sa.NUMERIC(precision=20, scale=4),
               existing_nullable=False)
    op.drop_index(op.f('ix_position_portfolio_id'), table_name='position')
    op.drop_index(op.f('ix_position_id'), table_name='position')
    op.drop_index(op.f('ix_position_asset_ticker'), table_name='position')
    op.drop_table('position')
    # ### end Alembic commands ###
