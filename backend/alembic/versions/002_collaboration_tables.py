"""Add collaboration tables.

Revision ID: 002
Revises: 001
Create Date: 2025-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Comments table
    op.create_table(
        'comments',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), nullable=False, index=True),
        sa.Column('sheet_id', sa.String(36), nullable=True),
        sa.Column('cell_address', sa.String(20), nullable=True),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('user_name', sa.String(255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('parent_id', sa.String(36), sa.ForeignKey('comments.id'), nullable=True),
        sa.Column('is_resolved', sa.Boolean(), default=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.String(36), nullable=True),
        sa.Column('mentions', sa.JSON(), default=list),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Annotations table
    op.create_table(
        'annotations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), nullable=False, index=True),
        sa.Column('sheet_id', sa.String(36), nullable=False),
        sa.Column('cell_address', sa.String(20), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('annotation_type', sa.String(50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('metadata', sa.JSON(), default=dict),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Cell edits table (for history and conflict resolution)
    op.create_table(
        'cell_edits',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), nullable=False, index=True),
        sa.Column('sheet_id', sa.String(36), nullable=False),
        sa.Column('cell_address', sa.String(20), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('old_value', sa.Text(), nullable=True),
        sa.Column('new_value', sa.Text(), nullable=False),
        sa.Column('old_formula', sa.Text(), nullable=True),
        sa.Column('new_formula', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('sequence_number', sa.Integer(), default=0),
        sa.Column('is_conflict', sa.Boolean(), default=False),
        sa.Column('resolved_value', sa.Text(), nullable=True),
    )

    # Active sessions table
    op.create_table(
        'active_sessions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), nullable=False, index=True),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('user_name', sa.String(255), nullable=False),
        sa.Column('session_id', sa.String(100), nullable=False),
        sa.Column('connected_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_activity', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('current_sheet_id', sa.String(36), nullable=True),
        sa.Column('current_cell', sa.String(20), nullable=True),
        sa.Column('cursor_position', sa.JSON(), nullable=True),
    )

    # Create indexes
    op.create_index('ix_comments_model_cell', 'comments', ['model_id', 'cell_address'])
    op.create_index('ix_annotations_model_cell', 'annotations', ['model_id', 'cell_address'])
    op.create_index('ix_cell_edits_model_cell', 'cell_edits', ['model_id', 'sheet_id', 'cell_address'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_cell_edits_model_cell')
    op.drop_index('ix_annotations_model_cell')
    op.drop_index('ix_comments_model_cell')

    # Drop tables
    op.drop_table('active_sessions')
    op.drop_table('cell_edits')
    op.drop_table('annotations')
    op.drop_table('comments')
