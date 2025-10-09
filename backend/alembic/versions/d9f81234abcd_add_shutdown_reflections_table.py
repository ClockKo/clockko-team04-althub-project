"""add shutdown reflections table

Revision ID: d9f81234abcd
Revises: b7d3d9e9f2b5
Create Date: 2025-09-30 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d9f81234abcd"
down_revision: Union[str, Sequence[str], None] = "b7d3d9e9f2b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


productivity_rating_enum = sa.Enum(
    "great",
    "good",
    "okay",
    "tough",
    name="productivity_rating_enum",
)


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP TABLE IF EXISTS shutdown_reflections CASCADE")
        op.execute("DROP TYPE IF EXISTS productivity_rating_enum")

    op.create_table(
        "shutdown_reflections",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("productivity_rating", productivity_rating_enum, nullable=False),
        sa.Column("reflection_note", sa.Text(), nullable=True),
        sa.Column("mindful_disconnect_completed", sa.JSON(), nullable=True),
        sa.Column("shutdown_date", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "idx_shutdown_reflections_user_id",
        "shutdown_reflections",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("idx_shutdown_reflections_user_id", table_name="shutdown_reflections")
    op.drop_table("shutdown_reflections")

    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        productivity_rating_enum.drop(bind, checkfirst=True)
