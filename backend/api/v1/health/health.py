"""Health check endpoints for monitoring and load balancers."""

import time
import platform
import psutil
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import APIRouter, Response, status


router = APIRouter(tags=["Health"])

# Track application start time
_start_time = time.time()


def get_uptime() -> float:
    """Get application uptime in seconds."""
    return time.time() - _start_time


def format_uptime(seconds: float) -> str:
    """Format uptime as human-readable string."""
    days = int(seconds // 86400)
    hours = int((seconds % 86400) // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)

    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    parts.append(f"{secs}s")

    return " ".join(parts)


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint.

    Returns 200 if the service is running.
    Used by load balancers and container orchestration.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health/live")
async def liveness_check() -> Dict[str, str]:
    """
    Kubernetes liveness probe.

    Returns 200 if the process is alive.
    Failure triggers container restart.
    """
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness_check() -> Dict[str, str]:
    """
    Kubernetes readiness probe.

    Returns 200 if the service is ready to accept traffic.
    Failure removes the pod from load balancer.
    """
    # TODO: Add checks for:
    # - Database connectivity
    # - Redis connectivity
    # - External service dependencies

    return {"status": "ready"}


@router.get("/health/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """
    Detailed health check with system metrics.

    Includes:
    - Uptime
    - System resources (CPU, memory, disk)
    - Python version
    - Dependencies status
    """
    uptime_seconds = get_uptime()

    # System metrics
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime": {
            "seconds": uptime_seconds,
            "formatted": format_uptime(uptime_seconds),
        },
        "system": {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "python_version": platform.python_version(),
            "processor": platform.processor(),
        },
        "resources": {
            "cpu": {
                "percent": cpu_percent,
                "count": psutil.cpu_count(),
            },
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "percent_used": memory.percent,
            },
            "disk": {
                "total_gb": round(disk.total / (1024**3), 2),
                "free_gb": round(disk.free / (1024**3), 2),
                "percent_used": round(disk.percent, 1),
            },
        },
        "checks": {
            "database": "ok",  # TODO: Implement actual check
            "cache": "ok",  # TODO: Implement actual check
        },
    }


@router.get("/health/version")
async def version_info() -> Dict[str, Any]:
    """
    Version and build information.

    Returns application version, build info, and environment.
    """
    return {
        "version": "1.0.0",
        "api_version": "v1",
        "build": {
            "date": "2025-01-15",
            "commit": "unknown",  # TODO: Read from environment
        },
        "environment": "development",  # TODO: Read from config
    }


@router.get("/metrics")
async def prometheus_metrics(response: Response) -> str:
    """
    Prometheus-compatible metrics endpoint.

    Returns metrics in Prometheus text format.
    """
    uptime = get_uptime()
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()

    metrics = f"""# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds gauge
app_uptime_seconds {uptime}

# HELP app_cpu_percent CPU usage percentage
# TYPE app_cpu_percent gauge
app_cpu_percent {cpu_percent}

# HELP app_memory_percent Memory usage percentage
# TYPE app_memory_percent gauge
app_memory_percent {memory.percent}

# HELP app_memory_bytes_used Memory used in bytes
# TYPE app_memory_bytes_used gauge
app_memory_bytes_used {memory.used}

# HELP app_memory_bytes_available Memory available in bytes
# TYPE app_memory_bytes_available gauge
app_memory_bytes_available {memory.available}
"""

    response.headers["Content-Type"] = "text/plain; version=0.0.4"
    return metrics
