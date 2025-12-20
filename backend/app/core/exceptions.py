"""
Custom exceptions and exception handlers for the application.
"""

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class NotFoundException(HTTPException):
    """Exception raised when a resource is not found."""

    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class UnauthorizedException(HTTPException):
    """Exception raised for authentication failures."""

    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ForbiddenException(HTTPException):
    """Exception raised for authorization failures."""

    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class BadRequestException(HTTPException):
    """Exception raised for bad requests."""

    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ConflictException(HTTPException):
    """Exception raised for conflicts, e.g., duplicate resources."""

    def __init__(self, detail: str = "Conflict"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


async def not_found_exception_handler(
    request: Request, exc: NotFoundException
) -> JSONResponse:
    """Handle NotFoundException."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def unauthorized_exception_handler(
    request: Request, exc: UnauthorizedException
) -> JSONResponse:
    """Handle UnauthorizedException."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def forbidden_exception_handler(
    request: Request, exc: ForbiddenException
) -> JSONResponse:
    """Handle ForbiddenException."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def bad_request_exception_handler(
    request: Request, exc: BadRequestException
) -> JSONResponse:
    """Handle BadRequestException."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def conflict_exception_handler(
    request: Request, exc: ConflictException
) -> JSONResponse:
    """Handle ConflictException."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
