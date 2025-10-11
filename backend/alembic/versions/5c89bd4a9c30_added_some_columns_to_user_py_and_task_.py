"""
Added some Columns to user.py and task.py models

Revision ID: 5c89bd4a9c30
Revises: e034d1050609
Create Date: 2025-10-06 23:35:25.048912

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision: str = "5c89bd4a9c30"
down_revision: Union[str, Sequence[str], None] = "e034d1050609"  # Updated to reflect the correct parent revision
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = set(inspector.get_table_names())

    # Ensure 'tasks' table exists for fresh databases before adding columns
    if 'tasks' not in existing_tables:
        from sqlalchemy.dialects.postgresql import UUID
        op.create_table(
            'tasks',
            sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
            sa.Column('title', sa.String(length=255), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
            sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
            sa.Column('reminder_enabled', sa.Boolean(), nullable=True),
            sa.Column('reminder_time', sa.DateTime(), nullable=True),
        )

    # Add columns idempotently to tasks
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMP")
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP")
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false NOT NULL")
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' NOT NULL")
    op.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSON")

    # Add user columns idempotently
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false NOT NULL")

def downgrade() -> None:
    # Best-effort downgrade; use IF EXISTS to avoid errors if columns are already absent
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS start_date")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS due_date")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS completed")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS priority")
    op.execute("ALTER TABLE tasks DROP COLUMN IF EXISTS tags")

    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS avatar_url")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS onboarding_completed")