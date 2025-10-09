"""add extended task fields for feature enhancement

Revision ID: a1f3c2b6d789
Revises: 5bd8e6bac68a
Create Date: 2025-09-29 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a1f3c2b6d789"
down_revision: Union[str, Sequence[str], None] = "5bd8e6bac68a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("tasks", sa.Column("start_date", sa.DateTime(), nullable=True))
    op.add_column("tasks", sa.Column("due_date", sa.DateTime(), nullable=True))
    op.add_column(
        "tasks",
        sa.Column(
            "completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "tasks",
        sa.Column(
            "priority",
            sa.String(length=20),
            nullable=False,
            server_default=sa.text("'medium'"),
        ),
    )
    op.add_column("tasks", sa.Column("tags", sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("tasks", "tags")
    op.drop_column("tasks", "priority")
    op.drop_column("tasks", "completed")
    op.drop_column("tasks", "due_date")
    op.drop_column("tasks", "start_date")
