"""Request logging middleware for observability."""

import time
import uuid
import logging
from typing import Callable, Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


# Configure logger
logger = logging.getLogger("api.requests")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging all API requests with timing and metadata.

    Logs:
    - Request method, path, query params
    - Response status code
    - Request duration
    - Client IP
    - Request ID for tracing
    """

    def __init__(
        self,
        app,
        log_request_body: bool = False,
        log_response_body: bool = False,
        exclude_paths: Optional[list] = None,
        slow_request_threshold_ms: int = 1000,
    ):
        super().__init__(app)
        self.log_request_body = log_request_body
        self.log_response_body = log_response_body
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/openapi.json", "/favicon.ico"]
        self.slow_request_threshold_ms = slow_request_threshold_ms

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    def _should_log(self, request: Request) -> bool:
        """Determine if request should be logged."""
        return not any(
            request.url.path.startswith(path) for path in self.exclude_paths
        )

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with logging."""
        # Generate request ID
        request_id = str(uuid.uuid4())[:8]

        # Skip logging for excluded paths
        if not self._should_log(request):
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response

        # Capture request details
        start_time = time.time()
        client_ip = self._get_client_ip(request)
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else ""

        # Log request start
        logger.info(
            f"[{request_id}] --> {method} {path}"
            f"{' ?' + query_params if query_params else ''}"
            f" | IP: {client_ip}"
        )

        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log error
            duration_ms = (time.time() - start_time) * 1000
            logger.error(
                f"[{request_id}] <-- {method} {path} | ERROR: {str(e)} | {duration_ms:.2f}ms"
            )
            raise

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Add request ID to response
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

        # Log response
        status_code = response.status_code
        log_level = logging.INFO if status_code < 400 else logging.WARNING if status_code < 500 else logging.ERROR

        log_message = (
            f"[{request_id}] <-- {method} {path} | "
            f"Status: {status_code} | {duration_ms:.2f}ms"
        )

        # Flag slow requests
        if duration_ms > self.slow_request_threshold_ms:
            log_message += " [SLOW]"
            log_level = logging.WARNING

        logger.log(log_level, log_message)

        return response


def setup_logging(
    level: int = logging.INFO,
    format_string: Optional[str] = None,
) -> None:
    """
    Configure logging for the application.

    Args:
        level: Logging level (default: INFO)
        format_string: Custom log format string
    """
    if format_string is None:
        format_string = "%(asctime)s | %(levelname)s | %(name)s | %(message)s"

    logging.basicConfig(
        level=level,
        format=format_string,
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Set specific loggers
    logging.getLogger("api.requests").setLevel(level)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)  # Reduce noise
