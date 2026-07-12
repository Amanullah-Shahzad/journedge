"""add trade symbol source

Revision ID: 0005_add_trade_symbol_source
Revises: 0004_trade_compact_fields
Create Date: 2026-06-24
"""

from alembic import op
import sqlalchemy as sa


revision = "0005_add_trade_symbol_source"
down_revision = "0004_trade_compact_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("trades", sa.Column("symbol_source", sa.String(length=16), nullable=True))


def downgrade() -> None:
    op.drop_column("trades", "symbol_source")
