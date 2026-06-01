import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError as PydanticValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


logger = logging.getLogger("journedge.errors")


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400, code: str = "app_error", details: list[dict] | None = None):
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details or []
        super().__init__(message)


def error_payload(
    *,
    code: str,
    message: str,
    request: Request,
    details: list[dict] | None = None,
) -> dict:
    return {
        "error": code,
        "message": message,
        "details": details or None,
        "requestId": getattr(request.state, "request_id", None),
    }


def register_error_handlers(app: FastAPI) -> None:
    def validation_details(errors: list[dict]) -> list[dict]:
        return [{"loc": list(error["loc"]), "msg": error["msg"], "type": error["type"]} for error in errors]

    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        logger.warning(
            exc.message,
            extra={
                "request_id": getattr(request.state, "request_id", None),
                "path": str(request.url.path),
                "method": request.method,
                "status_code": exc.status_code,
                "details": exc.details,
            },
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=error_payload(code=exc.code, message=exc.message, request=request, details=exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_payload(
                code="validation_error",
                message="Invalid request payload",
                request=request,
                details=validation_details(exc.errors()),
            ),
        )

    @app.exception_handler(PydanticValidationError)
    async def handle_pydantic_validation_error(request: Request, exc: PydanticValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_payload(
                code="validation_error",
                message="Invalid request payload",
                request=request,
                details=validation_details(exc.errors()),
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=error_payload(
                code="http_error",
                message=str(exc.detail),
                request=request,
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(
            "Unexpected server error",
            extra={
                "request_id": getattr(request.state, "request_id", None),
                "path": str(request.url.path),
                "method": request.method,
                "status_code": 500,
            },
        )
        return JSONResponse(
            status_code=500,
            content=error_payload(code="internal_server_error", message="Unexpected server error", request=request),
        )
