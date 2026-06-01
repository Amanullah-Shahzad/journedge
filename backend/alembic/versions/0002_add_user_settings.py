"""add user settings

Revision ID: 0002_add_user_settings
Revises: 0001_initial
Create Date: 2026-05-31 12:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_add_user_settings"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_settings",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False, server_default="UTC"),
        sa.Column("default_currency", sa.String(length=8), nullable=False, server_default="USD"),
        sa.Column("default_account_id", sa.String(length=36), sa.ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", name="uq_user_settings_user_id"),
    )
    op.create_index("ix_user_settings_user_id", "user_settings", ["user_id"])
    op.create_index("ix_user_settings_default_account_id", "user_settings", ["default_account_id"])


def downgrade() -> None:
    op.drop_index("ix_user_settings_default_account_id", table_name="user_settings")
    op.drop_index("ix_user_settings_user_id", table_name="user_settings")
    op.drop_table("user_settings")
