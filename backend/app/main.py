"""FastAPI application entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from api.v1.router import api_router
from api.v1.collaboration.websocket import router as websocket_router
from api.v1.health.health import router as health_router
from db.models.base import engine
from middleware.rate_limiter import RateLimitMiddleware
from middleware.request_logger import RequestLoggerMiddleware, setup_logging
from middleware.error_handler import ErrorHandlerMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    print("Starting Financial Modeling Platform...")
    print(f"Database: {get_settings().database_url.split('@')[-1] if '@' in get_settings().database_url else 'configured'}")
    print("WebSocket endpoint available at /ws/models/{model_id}")
    yield
    # Shutdown
    print("Shutting down...")
    await engine.dispose()


settings = get_settings()

# Setup logging
setup_logging(level=logging.INFO if not settings.debug else logging.DEBUG)

app = FastAPI(
    title=settings.app_name,
    description="Comprehensive financial modeling, valuation, and deal analysis platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Add middleware (order matters - first added is last executed)
# Error handler should be outermost to catch all errors
app.add_middleware(ErrorHandlerMiddleware, debug=settings.debug)

# Request logger
app.add_middleware(
    RequestLoggerMiddleware,
    exclude_paths=["/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"],
    slow_request_threshold_ms=1000,
)

# Rate limiter
app.add_middleware(
    RateLimitMiddleware,
    requests_per_minute=100,
    requests_per_hour=2000,
    exclude_paths=["/health", "/docs", "/openapi.json", "/redoc"],
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
)

# Include health check routes (no prefix for standard paths)
app.include_router(health_router)

# Include API routes
app.include_router(api_router, prefix=settings.api_v1_prefix)

# Include WebSocket routes (no prefix)
app.include_router(websocket_router)
