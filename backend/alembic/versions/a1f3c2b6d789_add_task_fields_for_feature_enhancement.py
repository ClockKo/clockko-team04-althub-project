"""add extended task fields for feature enhancement

Revision ID: a1f3c2b6d789
Revises: 5bd8e6bac68a
Create Date: 2025-09-29 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "a1f3c2b6d789"
down_revision: Union[str, Sequence[str], None] = "5bd8e6bac68a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Ensure base 'tasks' table exists on fresh databases
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = set(inspector.get_table_names())
    if "tasks" not in existing_tables:
        op.create_table(
            "tasks",
            sa.Column("id", UUID(as_uuid=True), primary_key=True, nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
            sa.Column("reminder_enabled", sa.Boolean(), nullable=True),
            sa.Column("reminder_time", sa.DateTime(), nullable=True),
        )
        # Optional: basic index to mirror model intent
        op.create_index("idx_task_user_id", "tasks", ["user_id"], unique=False)

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
