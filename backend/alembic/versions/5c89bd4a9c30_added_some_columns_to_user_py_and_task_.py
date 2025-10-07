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

# revision identifiers, used by Alembic.
revision: str = "5c89bd4a9c30"
down_revision: Union[str, Sequence[str], None] = "e034d1050609"  # Updated to reflect the correct parent revision
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('start_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('completed', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('tasks', sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'))
    op.add_column('tasks', sa.Column('tags', sa.JSON(), nullable=True))

    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default=sa.false()))

def downgrade() -> None:
    op.drop_column('tasks', 'start_date')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'completed')
    op.drop_column('tasks', 'priority')
    op.drop_column('tasks', 'tags')

    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'onboarding_completed')