"""Rate limiting middleware for API protection."""

import time
from collections import defaultdict
from typing import Callable, Dict, Optional
from functools import wraps

from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using token bucket algorithm.

    Limits requests per IP address to prevent abuse.
    """

    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        burst_size: int = 10,
        exclude_paths: Optional[list] = None,
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.burst_size = burst_size
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/openapi.json"]

        # Token buckets per IP
        self._minute_buckets: Dict[str, dict] = defaultdict(
            lambda: {"tokens": requests_per_minute, "last_update": time.time()}
        )
        self._hour_buckets: Dict[str, dict] = defaultdict(
            lambda: {"tokens": requests_per_hour, "last_update": time.time()}
        )

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        # Check for forwarded headers (behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    def _refill_tokens(self, bucket: dict, max_tokens: int, refill_rate: float) -> None:
        """Refill tokens based on time elapsed."""
        now = time.time()
        elapsed = now - bucket["last_update"]
        tokens_to_add = elapsed * refill_rate
        bucket["tokens"] = min(max_tokens, bucket["tokens"] + tokens_to_add)
        bucket["last_update"] = now

    def _check_rate_limit(self, client_ip: str) -> tuple[bool, Optional[int]]:
        """
        Check if request is within rate limits.

        Returns:
            Tuple of (is_allowed, retry_after_seconds)
        """
        # Check minute limit
        minute_bucket = self._minute_buckets[client_ip]
        self._refill_tokens(
            minute_bucket,
            self.requests_per_minute,
            self.requests_per_minute / 60.0  # tokens per second
        )

        if minute_bucket["tokens"] < 1:
            return False, 60

        # Check hour limit
        hour_bucket = self._hour_buckets[client_ip]
        self._refill_tokens(
            hour_bucket,
            self.requests_per_hour,
            self.requests_per_hour / 3600.0  # tokens per second
        )

        if hour_bucket["tokens"] < 1:
            return False, 3600

        # Consume tokens
        minute_bucket["tokens"] -= 1
        hour_bucket["tokens"] -= 1

        return True, None

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with rate limiting."""
        # Skip rate limiting for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)

        client_ip = self._get_client_ip(request)
        is_allowed, retry_after = self._check_rate_limit(client_ip)

        if not is_allowed:
            return Response(
                content='{"detail": "Rate limit exceeded. Please try again later."}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={
                    "Content-Type": "application/json",
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(self.requests_per_minute),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)

        # Add rate limit headers
        minute_bucket = self._minute_buckets[client_ip]
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(int(minute_bucket["tokens"]))

        return response


def rate_limit(
    requests_per_minute: int = 10,
    key_func: Optional[Callable[[Request], str]] = None,
):
    """
    Decorator for endpoint-specific rate limiting.

    Usage:
        @router.get("/expensive-operation")
        @rate_limit(requests_per_minute=5)
        async def expensive_operation():
            ...
    """
    # Simple in-memory store for decorator-based limiting
    _buckets: Dict[str, dict] = defaultdict(
        lambda: {"tokens": requests_per_minute, "last_update": time.time()}
    )

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Find request in args/kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            if not request:
                request = kwargs.get("request")

            if request:
                # Get key for rate limiting
                if key_func:
                    key = key_func(request)
                else:
                    key = request.client.host if request.client else "unknown"

                bucket = _buckets[key]
                now = time.time()
                elapsed = now - bucket["last_update"]
                tokens_to_add = elapsed * (requests_per_minute / 60.0)
                bucket["tokens"] = min(requests_per_minute, bucket["tokens"] + tokens_to_add)
                bucket["last_update"] = now

                if bucket["tokens"] < 1:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Rate limit exceeded for this endpoint",
                        headers={"Retry-After": "60"},
                    )

                bucket["tokens"] -= 1

            return await func(*args, **kwargs)

        return wrapper

    return decorator
