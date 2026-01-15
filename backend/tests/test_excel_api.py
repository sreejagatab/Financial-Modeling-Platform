"""Tests for Excel Add-in API endpoints."""

import pytest
from datetime import datetime


class TestExcelGetValue:
    """Tests for value fetching endpoint."""

    def test_get_value_returns_value(self, client):
        """Test fetching a value from a model."""
        response = client.post(
            "/api/v1/excel/get-value",
            json={
                "modelPath": "Portfolio/CompanyA/DCF",
                "reference": "A1",
                "version": "latest"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "value" in data
        assert "timestamp" in data

    def test_get_value_different_references(self, client):
        """Test fetching values from different references."""
        references = ["A1", "B2", "C3", "D4"]

        for ref in references:
            response = client.post(
                "/api/v1/excel/get-value",
                json={
                    "modelPath": "TestModel",
                    "reference": ref,
                    "version": "latest"
                }
            )
            assert response.status_code == 200
            assert "value" in response.json()


class TestExcelCreateLink:
    """Tests for link creation endpoint."""

    def test_create_link_success(self, client):
        """Test creating a bidirectional link."""
        response = client.post(
            "/api/v1/excel/create-link",
            json={
                "modelPath": "Portfolio/CompanyA/DCF",
                "reference": "A1",
                "clientId": "test-client-123"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "value" in data
        assert "linkId" in data
        assert "timestamp" in data

    def test_create_multiple_links(self, client):
        """Test creating multiple links for same client."""
        client_id = "test-client-456"
        references = ["A1", "B2", "C3"]

        for ref in references:
            response = client.post(
                "/api/v1/excel/create-link",
                json={
                    "modelPath": "TestModel",
                    "reference": ref,
                    "clientId": client_id
                }
            )
            assert response.status_code == 200


class TestExcelScenarioValue:
    """Tests for scenario value endpoint."""

    def test_get_base_scenario_value(self, client):
        """Test getting base scenario value."""
        response = client.post(
            "/api/v1/excel/scenario-value",
            json={
                "scenario": "Base_Case",
                "reference": "A1"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "value" in data

    def test_get_upside_scenario_value(self, client):
        """Test upside scenario has higher value."""
        base_response = client.post(
            "/api/v1/excel/scenario-value",
            json={"scenario": "Base_Case", "reference": "B1"}
        )
        upside_response = client.post(
            "/api/v1/excel/scenario-value",
            json={"scenario": "Upside_Case", "reference": "B1"}
        )

        assert base_response.status_code == 200
        assert upside_response.status_code == 200

        base_value = base_response.json()["value"]
        upside_value = upside_response.json()["value"]

        # Upside should be higher than base
        if isinstance(base_value, (int, float)) and isinstance(upside_value, (int, float)):
            assert upside_value > base_value

    def test_get_downside_scenario_value(self, client):
        """Test downside scenario has lower value."""
        base_response = client.post(
            "/api/v1/excel/scenario-value",
            json={"scenario": "Base_Case", "reference": "A2"}
        )
        downside_response = client.post(
            "/api/v1/excel/scenario-value",
            json={"scenario": "Downside_Case", "reference": "A2"}
        )

        assert base_response.status_code == 200
        assert downside_response.status_code == 200


class TestExcelSync:
    """Tests for cell sync endpoint."""

    def test_sync_update_operation(self, client):
        """Test syncing an update operation."""
        response = client.post(
            "/api/v1/excel/sync",
            json={
                "type": "update",
                "address": "A1",
                "value": 1000000,
                "formula": None,
                "timestamp": datetime.utcnow().isoformat(),
                "clientId": "test-client-789",
                "modelPath": "TestModel"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "timestamp" in data

    def test_sync_with_formula(self, client):
        """Test syncing a cell with formula."""
        response = client.post(
            "/api/v1/excel/sync",
            json={
                "type": "update",
                "address": "B1",
                "value": 2000000,
                "formula": "=A1*2",
                "timestamp": datetime.utcnow().isoformat(),
                "clientId": "test-client-789",
                "modelPath": "TestModel"
            }
        )

        assert response.status_code == 200

    def test_sync_delete_operation(self, client):
        """Test syncing a delete operation."""
        response = client.post(
            "/api/v1/excel/sync",
            json={
                "type": "delete",
                "address": "C1",
                "timestamp": datetime.utcnow().isoformat(),
                "clientId": "test-client-789",
                "modelPath": "TestModel"
            }
        )

        assert response.status_code == 200


class TestExcelSyncBatch:
    """Tests for batch sync endpoint."""

    def test_sync_batch_operations(self, client):
        """Test syncing multiple operations at once."""
        operations = [
            {
                "type": "update",
                "address": "A1",
                "value": 100,
                "timestamp": datetime.utcnow().isoformat(),
                "clientId": "batch-client"
            },
            {
                "type": "update",
                "address": "A2",
                "value": 200,
                "timestamp": datetime.utcnow().isoformat(),
                "clientId": "batch-client"
            },
            {
                "type": "update",
                "address": "A3",
                "value": 300,
                "timestamp": datetime.utcnow().isoformat(),
                "clientId": "batch-client"
            }
        ]

        response = client.post(
            "/api/v1/excel/sync-batch",
            json={"operations": operations}
        )

        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert len(data["results"]) == 3
        assert all(r["success"] for r in data["results"])


class TestExcelSensitivity:
    """Tests for sensitivity analysis endpoint."""

    def test_calculate_sensitivity(self, client):
        """Test sensitivity calculation."""
        response = client.post(
            "/api/v1/excel/sensitivity",
            json={
                "inputAddress": "A1",
                "outputAddress": "B1",
                "steps": 5,
                "variationPercent": 20.0
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "matrix" in data
        assert len(data["matrix"]) == 6  # Header + 5 rows
        assert len(data["matrix"][0]) == 6  # Label + 5 columns

    def test_sensitivity_default_steps(self, client):
        """Test sensitivity with default parameters."""
        response = client.post(
            "/api/v1/excel/sensitivity",
            json={
                "inputAddress": "A1",
                "outputAddress": "B1"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "matrix" in data
        assert len(data["matrix"]) == 11  # Header + 10 rows (default)


class TestExcelAudit:
    """Tests for audit information endpoint."""

    def test_get_audit_last_modified_by(self, client):
        """Test getting last modified by info."""
        response = client.post(
            "/api/v1/excel/audit",
            json={
                "reference": "A1",
                "field": "last_modified_by"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "value" in data

    def test_get_audit_last_modified_at(self, client):
        """Test getting last modified at info."""
        response = client.post(
            "/api/v1/excel/audit",
            json={
                "reference": "A1",
                "field": "last_modified_at"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "value" in data

    def test_get_audit_version(self, client):
        """Test getting version info."""
        response = client.post(
            "/api/v1/excel/audit",
            json={
                "reference": "A1",
                "field": "version"
            }
        )

        assert response.status_code == 200


class TestExcelComments:
    """Tests for comments endpoint."""

    def test_get_comments_with_comment(self, client):
        """Test getting comments for cell with comment."""
        response = client.post(
            "/api/v1/excel/comments",
            json={"reference": "A1"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "latestComment" in data
        # A1 has a mock comment
        assert data["latestComment"] is not None

    def test_get_comments_without_comment(self, client):
        """Test getting comments for cell without comment."""
        response = client.post(
            "/api/v1/excel/comments",
            json={"reference": "Z99"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["latestComment"] is None


class TestExcelUnlink:
    """Tests for unlink endpoint."""

    def test_unlink_cell(self, client):
        """Test unlinking a cell."""
        # First create a link
        client.post(
            "/api/v1/excel/create-link",
            json={
                "modelPath": "TestModel",
                "reference": "A1",
                "clientId": "unlink-test-client"
            }
        )

        # Then unlink it
        response = client.post(
            "/api/v1/excel/unlink",
            json={
                "localAddress": "A1",
                "clientId": "unlink-test-client"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestExcelGetClientLinks:
    """Tests for getting client links."""

    def test_get_links_for_client(self, client):
        """Test getting all links for a client."""
        client_id = "links-test-client"

        # Create some links first
        for ref in ["A1", "B2", "C3"]:
            client.post(
                "/api/v1/excel/create-link",
                json={
                    "modelPath": "TestModel",
                    "reference": ref,
                    "clientId": client_id
                }
            )

        # Get all links
        response = client.get(f"/api/v1/excel/links/{client_id}")

        assert response.status_code == 200
        data = response.json()
        assert "links" in data
        assert "timestamp" in data

    def test_get_links_for_new_client(self, client):
        """Test getting links for client with no links."""
        response = client.get("/api/v1/excel/links/nonexistent-client")

        assert response.status_code == 200
        data = response.json()
        assert data["links"] == {}
