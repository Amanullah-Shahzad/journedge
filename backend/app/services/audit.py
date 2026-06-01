from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.orm import Session

from app.models.entities import AuditLog


logger = logging.getLogger("journedge.audit")


def record_audit_log(
    db: Session,
    *,
    user_id: str | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    payload: dict[str, Any] | None = None,
) -> AuditLog:
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        payload=payload or {},
    )
    db.add(audit_log)
    db.flush()
    return audit_log


def log_event(
    event_logger: logging.Logger,
    message: str,
    *,
    user_id: str | None = None,
    action: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    event_logger.info(
        message,
        extra={
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details or {},
        },
    )


def audit_and_log(
    db: Session,
    *,
    event_logger: logging.Logger,
    user_id: str | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    payload: dict[str, Any] | None = None,
    message: str | None = None,
) -> None:
    record_audit_log(
        db,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        payload=payload,
    )
    log_event(
        event_logger,
        message or action,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=payload,
    )

