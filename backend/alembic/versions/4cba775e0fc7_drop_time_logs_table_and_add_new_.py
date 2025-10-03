"""Drop time_logs table and add new columns to time_sessions

Revision ID: 4cba775e0fc7
Revises: a71787d9e8cd
Create Date: 2025-10-01 15:12:32.566947
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "4cba775e0fc7"
down_revision: Union[str, Sequence[str], None] = "a71787d9e8cd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop the time_logs table
    op.drop_table("time_logs")

    # Add new columns to the time_sessions table
    op.add_column(
        "time_sessions", sa.Column("planned_duration", sa.Integer(), nullable=True)
    )
    op.add_column(
        "time_sessions", sa.Column("status", sa.String(), nullable=True)
    )
    op.add_column(
        "time_sessions", sa.Column("paused_at", sa.DateTime(), nullable=True)
    )
    op.add_column(
        "time_sessions", sa.Column("remaining_time", sa.Integer(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Recreate the time_logs table if downgrading
    op.create_table(
        "time_logs",
        sa.Column("id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("user_id", sa.UUID(), autoincrement=False, nullable=False),
        sa.Column("start_time", sa.DateTime(), autoincrement=False, nullable=True),
        sa.Column("end_time", sa.DateTime(), autoincrement=False, nullable=True),
        sa.Column("type", sa.String(), autoincrement=False, nullable=True),
        sa.Column("date", sa.DateTime(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="time_logs_user_id_fkey"
        ),
        sa.PrimaryKeyConstraint("id", name="time_logs_pkey"),
    )

    # Remove the new columns from time_sessions table if downgrading
    op.drop_column("time_sessions", "planned_duration")
    op.drop_column("time_sessions", "status")
    op.drop_column("time_sessions", "paused_at")
    op.drop_column("time_sessions", "remaining_time")
