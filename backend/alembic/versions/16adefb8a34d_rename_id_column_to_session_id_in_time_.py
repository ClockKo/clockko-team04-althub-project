"""Rename id column to session_id in time_logs

Revision ID: 16adefb8a34d
Revises:
Create Date: 2025-08-13 16:49:58.071984

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "16adefb8a34d"
down_revision: Union[str, Sequence[str], None] = "c14fa3262184"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('time_logs', 'id', new_column_name='session_id')

def downgrade() -> None:
    op.alter_column('time_logs', 'session_id', new_column_name='id')
