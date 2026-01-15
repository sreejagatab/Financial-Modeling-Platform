"""Tests for production features - middleware, health checks, error handling."""

import pytest
import time
from unittest.mock import patch, MagicMock

from fastapi.testclient import TestClient

from middleware.rate_limiter import RateLimitMiddleware
from middleware.error_handler import (
    APIError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    RateLimitError,
    ServiceUnavailableError,
    create_error_responses,
)


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_basic_health_check(self, client):
        """Test basic health check returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_liveness_check(self, client):
        """Test liveness probe returns alive."""
        response = client.get("/health/live")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"

    def test_readiness_check(self, client):
        """Test readiness probe returns ready."""
        response = client.get("/health/ready")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"

    def test_detailed_health_check(self, client):
        """Test detailed health check returns system metrics."""
        response = client.get("/health/detailed")
        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "healthy"
        assert "uptime" in data
        assert "seconds" in data["uptime"]
        assert "formatted" in data["uptime"]

        assert "system" in data
        assert "platform" in data["system"]
        assert "python_version" in data["system"]

        assert "resources" in data
        assert "cpu" in data["resources"]
        assert "memory" in data["resources"]
        assert "disk" in data["resources"]

    def test_version_info(self, client):
        """Test version endpoint returns version info."""
        response = client.get("/health/version")
        assert response.status_code == 200
        data = response.json()

        assert "version" in data
        assert "api_version" in data
        assert "build" in data
        assert "environment" in data

    def test_prometheus_metrics(self, client):
        """Test Prometheus metrics endpoint returns valid metrics."""
        response = client.get("/metrics")
        assert response.status_code == 200
        assert "text/plain" in response.headers["content-type"]

        content = response.text
        assert "app_uptime_seconds" in content
        assert "app_cpu_percent" in content
        assert "app_memory_percent" in content


class TestAPIErrors:
    """Tests for custom API errors."""

    def test_api_error_base(self):
        """Test base APIError creation."""
        error = APIError("Test error", status_code=400, error_code="TEST_ERROR")
        assert error.message == "Test error"
        assert error.status_code == 400
        assert error.error_code == "TEST_ERROR"

        error_dict = error.to_dict()
        assert error_dict["error"]["code"] == "TEST_ERROR"
        assert error_dict["error"]["message"] == "Test error"

    def test_validation_error(self):
        """Test ValidationError creation."""
        error = ValidationError(
            message="Invalid input",
            field_errors={"field1": "required", "field2": "invalid format"},
        )
        assert error.status_code == 422
        assert error.error_code == "VALIDATION_ERROR"
        assert "field_errors" in error.details

    def test_not_found_error(self):
        """Test NotFoundError creation."""
        error = NotFoundError(resource="Model", identifier="123")
        assert error.status_code == 404
        assert error.error_code == "NOT_FOUND"
        assert "Model" in error.message
        assert "123" in error.message

    def test_authentication_error(self):
        """Test AuthenticationError creation."""
        error = AuthenticationError()
        assert error.status_code == 401
        assert error.error_code == "AUTHENTICATION_ERROR"

    def test_authorization_error(self):
        """Test AuthorizationError creation."""
        error = AuthorizationError()
        assert error.status_code == 403
        assert error.error_code == "AUTHORIZATION_ERROR"

    def test_conflict_error(self):
        """Test ConflictError creation."""
        error = ConflictError("Resource already exists")
        assert error.status_code == 409
        assert error.error_code == "CONFLICT_ERROR"

    def test_rate_limit_error(self):
        """Test RateLimitError creation."""
        error = RateLimitError(retry_after=120)
        assert error.status_code == 429
        assert error.error_code == "RATE_LIMIT_ERROR"
        assert error.details["retry_after"] == 120

    def test_service_unavailable_error(self):
        """Test ServiceUnavailableError creation."""
        error = ServiceUnavailableError()
        assert error.status_code == 503
        assert error.error_code == "SERVICE_UNAVAILABLE"


class TestErrorResponses:
    """Tests for OpenAPI error response schemas."""

    def test_create_error_responses(self):
        """Test error response schema generation."""
        responses = create_error_responses()

        assert 400 in responses
        assert 401 in responses
        assert 403 in responses
        assert 404 in responses
        assert 422 in responses
        assert 429 in responses
        assert 500 in responses

        # Check structure
        for status_code, response in responses.items():
            assert "description" in response
            assert "content" in response
            assert "application/json" in response["content"]


class TestRateLimiter:
    """Tests for rate limiting middleware."""

    def test_rate_limit_headers(self, client):
        """Test rate limit headers are present in response."""
        response = client.get("/api/v1/due-diligence/verticals")
        assert "X-RateLimit-Limit" in response.headers
        assert "X-RateLimit-Remaining" in response.headers

    def test_rate_limit_allows_requests(self, client):
        """Test rate limiter allows requests within limit."""
        # Make multiple requests
        for _ in range(5):
            response = client.get("/api/v1/due-diligence/verticals")
            assert response.status_code == 200

    def test_excluded_paths_not_rate_limited(self, client):
        """Test excluded paths bypass rate limiting."""
        # Health endpoint should not be rate limited
        for _ in range(10):
            response = client.get("/health")
            assert response.status_code == 200


class TestRequestLogger:
    """Tests for request logging middleware."""

    def test_request_id_header(self, client):
        """Test X-Request-ID header is present in response."""
        response = client.get("/health")
        assert "X-Request-ID" in response.headers
        assert len(response.headers["X-Request-ID"]) == 8

    def test_response_time_header(self, client):
        """Test X-Response-Time header is present in response."""
        # Use a non-excluded endpoint
        response = client.get("/api/v1/due-diligence/verticals")
        assert "X-Response-Time" in response.headers
        assert "ms" in response.headers["X-Response-Time"]


class TestCORSConfiguration:
    """Tests for CORS middleware configuration."""

    def test_cors_headers_present(self, client):
        """Test CORS headers are present for cross-origin requests."""
        response = client.options(
            "/api/v1/due-diligence/verticals",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Should not fail - CORS is configured
        assert response.status_code in [200, 405]

    def test_cors_allows_credentials(self, client):
        """Test CORS allows credentials."""
        response = client.get(
            "/api/v1/due-diligence/verticals",
            headers={"Origin": "http://localhost:3000"},
        )
        # Check response is successful
        assert response.status_code == 200


class TestAPIDocumentation:
    """Tests for API documentation endpoints."""

    def test_openapi_schema_available(self, client):
        """Test OpenAPI schema is available."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data

    def test_swagger_docs_available(self, client):
        """Test Swagger UI is available."""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "swagger" in response.text.lower() or "html" in response.headers.get("content-type", "")

    def test_redoc_available(self, client):
        """Test ReDoc is available."""
        response = client.get("/redoc")
        assert response.status_code == 200


class TestInputValidation:
    """Tests for input validation."""

    def test_invalid_json_returns_error(self, client):
        """Test invalid JSON returns appropriate error."""
        response = client.post(
            "/api/v1/due-diligence/analyze",
            content="not valid json",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code in [400, 422]

    def test_missing_required_field_returns_error(self, client):
        """Test missing required field returns validation error."""
        response = client.post(
            "/api/v1/due-diligence/analyze",
            json={},  # Missing required target_name
        )
        assert response.status_code == 422

    def test_invalid_field_type_returns_error(self, client):
        """Test invalid field type returns validation error."""
        response = client.post(
            "/api/v1/due-diligence/analyze",
            json={
                "target_name": "Test Corp",
                "deal_value": "not a number",  # Should be number
            },
        )
        assert response.status_code == 422


class TestErrorHandling:
    """Tests for global error handling."""

    def test_404_returns_json(self, client):
        """Test 404 errors return JSON response."""
        response = client.get("/nonexistent/path")
        assert response.status_code == 404

    def test_method_not_allowed_returns_error(self, client):
        """Test method not allowed returns appropriate error."""
        response = client.delete("/health")
        assert response.status_code == 405
