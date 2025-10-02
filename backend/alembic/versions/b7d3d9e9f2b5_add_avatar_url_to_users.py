"""add avatar_url column to users table

Revision ID: b7d3d9e9f2b5
Revises: a1f3c2b6d789
Create Date: 2025-09-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from typing import Optional

# revision identifiers, used by Alembic.
revision: str = "b7d3d9e9f2b5"
down_revision: str = "a1f3c2b6d789"
branch_labels: Optional[str] = None
depends_on: Optional[str] = None


def upgrade() -> None:
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("avatar_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_column("avatar_url")
