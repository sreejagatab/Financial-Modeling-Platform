"""Error handling middleware and custom exceptions."""

import logging
import traceback
from typing import Callable, Optional, Dict, Any

from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import ValidationError as PydanticValidationError


logger = logging.getLogger("api.errors")


class APIError(Exception):
    """Base exception for API errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or f"ERR_{status_code}"
        self.details = details or {}
        super().__init__(message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for JSON response."""
        return {
            "error": {
                "code": self.error_code,
                "message": self.message,
                "details": self.details,
            }
        }


class ValidationError(APIError):
    """Validation error for invalid input."""

    def __init__(
        self,
        message: str = "Validation failed",
        field_errors: Optional[Dict[str, str]] = None,
    ):
        super().__init__(
            message=message,
            status_code=422,
            error_code="VALIDATION_ERROR",
            details={"field_errors": field_errors or {}},
        )


class NotFoundError(APIError):
    """Resource not found error."""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} not found: {identifier}",
            status_code=404,
            error_code="NOT_FOUND",
            details={"resource": resource, "identifier": identifier},
        )


class AuthenticationError(APIError):
    """Authentication error."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
        )


class AuthorizationError(APIError):
    """Authorization error."""

    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
        )


class ConflictError(APIError):
    """Conflict error for duplicate resources."""

    def __init__(self, message: str = "Resource already exists"):
        super().__init__(
            message=message,
            status_code=409,
            error_code="CONFLICT_ERROR",
        )


class RateLimitError(APIError):
    """Rate limit exceeded error."""

    def __init__(self, retry_after: int = 60):
        super().__init__(
            message="Rate limit exceeded",
            status_code=429,
            error_code="RATE_LIMIT_ERROR",
            details={"retry_after": retry_after},
        )


class ServiceUnavailableError(APIError):
    """Service unavailable error."""

    def __init__(self, message: str = "Service temporarily unavailable"):
        super().__init__(
            message=message,
            status_code=503,
            error_code="SERVICE_UNAVAILABLE",
        )


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global error handling middleware.

    Catches all exceptions and returns consistent JSON error responses.
    """

    def __init__(
        self,
        app,
        debug: bool = False,
        include_stacktrace: bool = False,
    ):
        super().__init__(app)
        self.debug = debug
        self.include_stacktrace = include_stacktrace

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Handle request with error catching."""
        try:
            return await call_next(request)

        except APIError as e:
            logger.warning(f"API Error: {e.error_code} - {e.message}")
            return JSONResponse(
                status_code=e.status_code,
                content=e.to_dict(),
            )

        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": {
                        "code": f"HTTP_{e.status_code}",
                        "message": e.detail,
                        "details": {},
                    }
                },
            )

        except PydanticValidationError as e:
            # Convert Pydantic validation errors to our format
            field_errors = {}
            for error in e.errors():
                field = ".".join(str(loc) for loc in error["loc"])
                field_errors[field] = error["msg"]

            return JSONResponse(
                status_code=422,
                content={
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": "Request validation failed",
                        "details": {"field_errors": field_errors},
                    }
                },
            )

        except Exception as e:
            # Log unexpected errors
            logger.error(f"Unexpected error: {str(e)}")
            logger.error(traceback.format_exc())

            content = {
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                    "details": {},
                }
            }

            # Include error details in debug mode
            if self.debug:
                content["error"]["details"]["exception"] = str(e)
                content["error"]["details"]["type"] = type(e).__name__

            if self.include_stacktrace:
                content["error"]["details"]["stacktrace"] = traceback.format_exc()

            return JSONResponse(
                status_code=500,
                content=content,
            )


def create_error_responses() -> Dict[int, Dict[str, Any]]:
    """
    Create OpenAPI error response schemas.

    Use in FastAPI route decorators for documentation.
    """
    return {
        400: {
            "description": "Bad Request",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "BAD_REQUEST",
                            "message": "Invalid request parameters",
                            "details": {},
                        }
                    }
                }
            },
        },
        401: {
            "description": "Unauthorized",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "AUTHENTICATION_ERROR",
                            "message": "Authentication required",
                            "details": {},
                        }
                    }
                }
            },
        },
        403: {
            "description": "Forbidden",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "AUTHORIZATION_ERROR",
                            "message": "Permission denied",
                            "details": {},
                        }
                    }
                }
            },
        },
        404: {
            "description": "Not Found",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "NOT_FOUND",
                            "message": "Resource not found",
                            "details": {},
                        }
                    }
                }
            },
        },
        422: {
            "description": "Validation Error",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "VALIDATION_ERROR",
                            "message": "Validation failed",
                            "details": {"field_errors": {"field_name": "error message"}},
                        }
                    }
                }
            },
        },
        429: {
            "description": "Too Many Requests",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "RATE_LIMIT_ERROR",
                            "message": "Rate limit exceeded",
                            "details": {"retry_after": 60},
                        }
                    }
                }
            },
        },
        500: {
            "description": "Internal Server Error",
            "content": {
                "application/json": {
                    "example": {
                        "error": {
                            "code": "INTERNAL_ERROR",
                            "message": "An unexpected error occurred",
                            "details": {},
                        }
                    }
                }
            },
        },
    }
