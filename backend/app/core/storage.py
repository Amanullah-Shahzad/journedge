from __future__ import annotations

import mimetypes
import re
from pathlib import Path
from typing import Protocol
from uuid import uuid4

import boto3

from app.core.config import get_settings
from app.core.errors import AppError


class StoredFile(dict):
    key: str
    url: str


class StorageBackend(Protocol):
    def save(self, content: bytes, filename: str, content_type: str, *, owner_id: str, category: str = "uploads") -> StoredFile: ...
    def delete(self, key: str) -> None: ...
    def read_bytes(self, key: str) -> bytes: ...
    def healthcheck(self) -> dict: ...


def safe_filename(filename: str, fallback_stem: str = "upload") -> str:
    raw_name = Path(filename or fallback_stem).name
    stem = Path(raw_name).stem or fallback_stem
    ext = Path(raw_name).suffix
    sanitized_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._-") or fallback_stem
    return f"{sanitized_stem}{ext.lower()}"


class LocalStorage:
    def __init__(self, base_dir: str) -> None:
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save(self, content: bytes, filename: str, content_type: str, *, owner_id: str, category: str = "uploads") -> StoredFile:
        safe_name = safe_filename(filename)
        ext = Path(safe_name).suffix or mimetypes.guess_extension(content_type) or ".bin"
        key = f"user_{owner_id}/{category}/{uuid4().hex}{ext}"
        path = self.base_dir / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return {"key": key, "url": key}

    def delete(self, key: str) -> None:
        path = self.base_dir / key
        if path.exists():
            path.unlink()

    def read_bytes(self, key: str) -> bytes:
        path = self.base_dir / key
        try:
            return path.read_bytes()
        except FileNotFoundError as exc:
            raise AppError("File not found", status_code=404, code="file_not_found") from exc

    def healthcheck(self) -> dict:
        self.base_dir.mkdir(parents=True, exist_ok=True)
        return {"status": "ok", "backend": "local", "path": str(self.base_dir.resolve())}


class S3Storage:
    def __init__(self) -> None:
        settings = get_settings()
        self.bucket = settings.s3_bucket_name
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.s3_endpoint_url,
            region_name=settings.s3_region,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
        )

    def save(self, content: bytes, filename: str, content_type: str, *, owner_id: str, category: str = "uploads") -> StoredFile:
        safe_name = safe_filename(filename)
        ext = Path(safe_name).suffix or mimetypes.guess_extension(content_type) or ".bin"
        key = f"user_{owner_id}/{category}/{uuid4().hex}{ext}"
        self.client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
        return {"key": key, "url": key}

    def delete(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def read_bytes(self, key: str) -> bytes:
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
        except Exception as exc:
            raise AppError("File not found", status_code=404, code="file_not_found") from exc
        return response["Body"].read()

    def healthcheck(self) -> dict:
        self.client.head_bucket(Bucket=self.bucket)
        return {"status": "ok", "backend": "s3", "bucket": self.bucket}


def get_storage() -> StorageBackend:
    settings = get_settings()
    if settings.storage_backend == "s3":
        return S3Storage()
    return LocalStorage(settings.local_upload_dir)
