"""merge migration branches

Revision ID: f5e324c9b416
Revises: 16adefb8a34d, 775be2096a27
Create Date: 2025-09-25 00:13:17.589949

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f5e324c9b416"
down_revision: Union[str, Sequence[str], None] = ("16adefb8a34d", "775be2096a27")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
