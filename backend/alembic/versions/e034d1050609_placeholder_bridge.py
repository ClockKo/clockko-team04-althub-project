"""placeholder for missing revision referenced by 5c89bd4a9c30

Revision ID: e034d1050609
Revises: 4cba775e0fc7
Create Date: 2025-10-11 00:00:01.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e034d1050609"
down_revision: Union[str, Sequence[str], None] = "4cba775e0fc7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No-op placeholder to bridge chain.
    pass


def downgrade() -> None:
    # No-op placeholder to bridge chain.
    pass
