"""merge branches

Revision ID: e034d1050609
Revises: 4cba775e0fc7, e3f452c1b678
Create Date: 2025-10-01 16:25:42.069978

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e034d1050609"
down_revision: Union[str, Sequence[str], None] = ("4cba775e0fc7", "e3f452c1b678")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
