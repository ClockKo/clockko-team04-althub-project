"""placeholder bridge for missing parent revision

Revision ID: 5bd8e6bac68a
Revises: 775be2096a27
Create Date: 2025-10-11 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5bd8e6bac68a"
down_revision: Union[str, Sequence[str], None] = "775be2096a27"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Placeholder migration; no-op to bridge revision chain.
    pass


def downgrade() -> None:
    # No-op downgrade for placeholder.
    pass
