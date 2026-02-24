"""switch_to_uuid_v7

Revision ID: f35c30bc41b4
Revises: 4ec7b1bb971b
Create Date: 2026-02-24 17:25:25.159823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f35c30bc41b4'
down_revision: Union[str, Sequence[str], None] = '4ec7b1bb971b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

"""switch_to_uuid_v7

Revision ID: f35c30bc41b4
Revises: 4ec7b1bb971b
Create Date: 2026-02-24 17:25:25.159823
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f35c30bc41b4'
down_revision: Union[str, Sequence[str], None] = '4ec7b1bb971b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable pgcrypto
    op.execute('CREATE EXTENSION IF NOT EXISTS pgcrypto')

    # 2. Create uuidv7 function
    op.execute("""
    CREATE OR REPLACE FUNCTION uuidv7(ts TIMESTAMP WITH TIME ZONE DEFAULT now())
    RETURNS UUID AS $$
    DECLARE
      v_time BIGINT;
      v_bytes BYTEA;
    BEGIN
      v_time := floor(extract(epoch from ts) * 1000)::BIGINT;
      v_bytes := decode(lpad(to_hex(v_time), 12, '0'), 'hex') || gen_random_bytes(10);
      v_bytes := set_byte(v_bytes, 6, (get_byte(v_bytes, 6) & 15) | 112);
      v_bytes := set_byte(v_bytes, 8, (get_byte(v_bytes, 8) & 63) | 128);
      RETURN encode(v_bytes, 'hex')::UUID;
    END;
    $$ LANGUAGE plpgsql VOLATILE;
    """)

    # 3. Add temporary column
    op.add_column('user', sa.Column('id_v7', sa.UUID(), nullable=True))

    # 4. Data migration
    op.execute('UPDATE "user" SET id_v7 = uuidv7(created_at::timestamptz)')
    op.alter_column('user', 'id_v7', nullable=False)

    # 5. Drop constraints AND the old index
    op.drop_constraint('user_pkey', 'user', type_='primary')
    # 👇 THIS IS THE FIX: Drop the index before renaming/creating new ones
    op.drop_index('ix_user_id', table_name='user')

    # 6. Rename columns
    op.alter_column('user', 'id', new_column_name='id_v4_old')
    op.alter_column('user', 'id_v7', new_column_name='id')

    # 7. Re-create Primary Key and Index
    op.create_primary_key('user_pkey', 'user', ['id'])
    op.create_index(op.f('ix_user_id'), 'user', ['id'], unique=False)

    # 8. Set default and cleanup
    op.execute('ALTER TABLE "user" ALTER COLUMN id SET DEFAULT uuidv7()')
    op.drop_column('user', 'id_v4_old')

def downgrade() -> None:
    # Reversing is complex due to data format; dropping defaults for now
    op.execute('ALTER TABLE "user" ALTER COLUMN id DROP DEFAULT')
    op.execute('DROP FUNCTION IF EXISTS uuidv7(TIMESTAMP WITH TIME ZONE)')
