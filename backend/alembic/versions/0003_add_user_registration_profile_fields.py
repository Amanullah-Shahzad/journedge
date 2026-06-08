"""add registration profile fields

Revision ID: 0003_user_profile_fields
Revises: 0002_add_user_settings
Create Date: 2026-06-08 10:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_user_profile_fields"
down_revision = "0002_add_user_settings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("trading_experience", sa.String(length=32), nullable=True))
    op.add_column("users", sa.Column("preferred_market", sa.String(length=32), nullable=True))
    op.add_column("users", sa.Column("country", sa.String(length=128), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "country")
    op.drop_column("users", "preferred_market")
    op.drop_column("users", "trading_experience")
