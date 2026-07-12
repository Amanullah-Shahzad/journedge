"""add compact trade fields

Revision ID: 0004_trade_compact_fields
Revises: 0003_user_profile_fields
Create Date: 2026-06-24 10:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_trade_compact_fields"
down_revision = "0003_user_profile_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("trades", sa.Column("trading_style", sa.String(length=32), nullable=True))
    op.add_column("trades", sa.Column("position_type", sa.String(length=32), nullable=True))
    op.add_column("trades", sa.Column("stop_loss", sa.Float(), nullable=True))
    op.add_column("trades", sa.Column("take_profit", sa.Float(), nullable=True))
    op.add_column("trades", sa.Column("emotion", sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column("trades", "emotion")
    op.drop_column("trades", "take_profit")
    op.drop_column("trades", "stop_loss")
    op.drop_column("trades", "position_type")
    op.drop_column("trades", "trading_style")
