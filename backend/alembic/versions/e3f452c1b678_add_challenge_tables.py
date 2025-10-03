"""add challenge tables

Revision ID: e3f452c1b678
Revises: d9f81234abcd
Create Date: 2025-09-30 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e3f452c1b678"
down_revision: Union[str, Sequence[str], None] = "d9f81234abcd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


challenge_type_enum = sa.Enum(
    "shutdown",
    "focus",
    "task",
    "break",
    name="challenge_type_enum",
)

challenge_participant_status_enum = sa.Enum(
    "in_progress",
    "completed",
    name="challenge_participant_status_enum",
)


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP TABLE IF EXISTS challenge_participants CASCADE")
        op.execute("DROP TABLE IF EXISTS challenges CASCADE")
        op.execute("DROP TABLE IF EXISTS user_challenge_stats CASCADE")
        op.execute("DROP TYPE IF EXISTS challenge_participant_status_enum")
        op.execute("DROP TYPE IF EXISTS challenge_type_enum")

    op.create_table(
        "challenges",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("points", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("challenge_type", challenge_type_enum, nullable=False),
        sa.Column("target_value", sa.Integer(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False, server_default=sa.text("7")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_challenges_active", "challenges", ["is_active"], unique=False)

    op.create_table(
        "challenge_participants",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("challenge_id", sa.UUID(), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("status", challenge_participant_status_enum, nullable=False, server_default=sa.text("'in_progress'")),
        sa.Column("points_earned", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("joined_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["challenge_id"], ["challenges.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "challenge_id", name="uq_challenge_participants_user_challenge"),
    )
    op.create_index("idx_challenge_participants_user", "challenge_participants", ["user_id"], unique=False)
    op.create_index("idx_challenge_participants_challenge", "challenge_participants", ["challenge_id"], unique=False)

    op.create_table(
        "user_challenge_stats",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("total_points", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("challenges_completed", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("weekly_points", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("current_shutdown_streak", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )


def downgrade() -> None:
    op.drop_table("user_challenge_stats")
    op.drop_index("idx_challenge_participants_challenge", table_name="challenge_participants")
    op.drop_index("idx_challenge_participants_user", table_name="challenge_participants")
    op.drop_table("challenge_participants")
    op.drop_index("idx_challenges_active", table_name="challenges")
    op.drop_table("challenges")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        challenge_participant_status_enum.drop(bind, checkfirst=True)
        challenge_type_enum.drop(bind, checkfirst=True)
