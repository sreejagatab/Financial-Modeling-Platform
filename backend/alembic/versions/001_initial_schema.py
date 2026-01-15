"""Initial database schema.

Revision ID: 001
Revises: None
Create Date: 2025-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('role', sa.String(50), default='analyst'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('password_reset_token', sa.String(255), nullable=True),
        sa.Column('password_reset_expires', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Refresh tokens table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), nullable=False, index=True),
        sa.Column('token', sa.String(500), unique=True, nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('revoked', sa.Boolean(), default=False),
    )

    # Financial models table
    op.create_table(
        'financial_models',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('model_type', sa.String(50), nullable=False),
        sa.Column('version', sa.Integer(), default=1),
        sa.Column('owner_id', sa.String(36), nullable=False),
        sa.Column('branch_id', sa.String(36), nullable=True),
        sa.Column('parent_model_id', sa.String(36), sa.ForeignKey('financial_models.id'), nullable=True),
        sa.Column('settings', sa.JSON(), default=dict),
        sa.Column('metadata', sa.JSON(), default=dict),
        sa.Column('is_archived', sa.Boolean(), default=False),
        sa.Column('is_template', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Sheets table
    op.create_table(
        'sheets',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), sa.ForeignKey('financial_models.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('purpose', sa.String(50), nullable=False),
        sa.Column('index', sa.Integer(), default=0),
        sa.Column('is_hidden', sa.Boolean(), default=False),
        sa.Column('is_protected', sa.Boolean(), default=False),
        sa.Column('metadata', sa.JSON(), default=dict),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Cells table
    op.create_table(
        'cells',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('sheet_id', sa.String(36), sa.ForeignKey('sheets.id'), nullable=False),
        sa.Column('address', sa.String(20), nullable=False),
        sa.Column('row', sa.Integer(), nullable=False),
        sa.Column('column', sa.Integer(), nullable=False),
        sa.Column('cell_type', sa.String(20), default='input'),
        sa.Column('data_type', sa.String(20), default='number'),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('tags', sa.JSON(), default=list),
    )

    # Cell values table (versioned)
    op.create_table(
        'cell_values',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('cell_id', sa.String(36), sa.ForeignKey('cells.id'), nullable=False),
        sa.Column('version', sa.Integer(), default=1),
        sa.Column('raw_value', sa.Text(), nullable=True),
        sa.Column('formula', sa.Text(), nullable=True),
        sa.Column('formula_ast', sa.JSON(), nullable=True),
        sa.Column('calculated_value', sa.Text(), nullable=True),
        sa.Column('dependencies', sa.JSON(), default=list),
        sa.Column('format', sa.JSON(), default=dict),
        sa.Column('changed_by', sa.String(36), nullable=False),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Scenarios table
    op.create_table(
        'scenarios',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), sa.ForeignKey('financial_models.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scenario_type', sa.String(50), default='custom'),
        sa.Column('base_version_id', sa.String(36), nullable=True),
        sa.Column('assumptions_override', sa.JSON(), default=dict),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Model versions table (git-like)
    op.create_table(
        'model_versions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), sa.ForeignKey('financial_models.id'), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('parent_version_id', sa.String(36), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('author_id', sa.String(36), nullable=False),
        sa.Column('committed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('snapshot_ref', sa.String(500), nullable=False),
        sa.Column('changes_summary', sa.JSON(), default=dict),
    )

    # Named ranges table
    op.create_table(
        'named_ranges',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('model_id', sa.String(36), sa.ForeignKey('financial_models.id'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('scope', sa.String(20), default='workbook'),
        sa.Column('scope_sheet_id', sa.String(36), nullable=True),
        sa.Column('refers_to', sa.String(500), nullable=False),
        sa.Column('semantic_type', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create indexes for performance
    op.create_index('ix_cells_sheet_address', 'cells', ['sheet_id', 'address'])
    op.create_index('ix_cell_values_cell_version', 'cell_values', ['cell_id', 'version'])
    op.create_index('ix_financial_models_owner', 'financial_models', ['owner_id'])
    op.create_index('ix_scenarios_model', 'scenarios', ['model_id'])
    op.create_index('ix_model_versions_model', 'model_versions', ['model_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_model_versions_model')
    op.drop_index('ix_scenarios_model')
    op.drop_index('ix_financial_models_owner')
    op.drop_index('ix_cell_values_cell_version')
    op.drop_index('ix_cells_sheet_address')

    # Drop tables in reverse order (due to foreign keys)
    op.drop_table('named_ranges')
    op.drop_table('model_versions')
    op.drop_table('scenarios')
    op.drop_table('cell_values')
    op.drop_table('cells')
    op.drop_table('sheets')
    op.drop_table('financial_models')
    op.drop_table('refresh_tokens')
    op.drop_table('users')
