"""Tests for due diligence model and API."""

import pytest

from core.models import (
    DueDiligenceModel,
    DDInputs,
    DDWorkItem,
    DDFinding,
    QoEAdjustment,
    RiskItem,
    DDVertical,
    DDPhase,
    FindingSeverity,
    FindingCategory,
    FindingStatus,
    RiskLikelihood,
    RiskImpact,
)


class TestDueDiligenceModel:
    """Tests for due diligence model."""

    def test_basic_dd_analysis(self):
        """Test basic DD analysis."""
        inputs = DDInputs(
            target_name="Target Corp",
            transaction_type="acquisition",
            deal_value=500_000_000,
            vertical=DDVertical.TECHNOLOGY,
            current_phase=DDPhase.PHASE_1,
            reported_ebitda=50_000_000,
        )

        model = DueDiligenceModel(dd_id="test", name="Test DD")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result["success"]
        assert "checklist" in result["outputs"]
        assert "progress" in result["outputs"]
        assert "recommendations" in result["outputs"]

    def test_vertical_checklist(self):
        """Test vertical-specific checklists."""
        # Technology vertical
        inputs = DDInputs(
            target_name="Tech Co",
            vertical=DDVertical.TECHNOLOGY,
        )

        model = DueDiligenceModel(dd_id="test", name="Tech DD")
        model.set_inputs(inputs)
        result = model.calculate()

        checklist = result["outputs"]["checklist"]
        assert checklist["vertical"] == "technology"
        assert "technology" in checklist["categories"]

        # Healthcare vertical
        inputs2 = DDInputs(
            target_name="Health Co",
            vertical=DDVertical.HEALTHCARE,
        )

        model2 = DueDiligenceModel(dd_id="test2", name="Health DD")
        model2.set_inputs(inputs2)
        result2 = model2.calculate()

        checklist2 = result2["outputs"]["checklist"]
        assert checklist2["vertical"] == "healthcare"
        assert "regulatory" in checklist2["categories"]

    def test_findings_summary(self):
        """Test findings summarization."""
        findings = [
            DDFinding(
                id="f1",
                category=FindingCategory.FINANCIAL,
                severity=FindingSeverity.CRITICAL,
                title="Revenue Recognition Issue",
                description="Improper revenue recognition identified",
                impact_amount=5_000_000,
                status=FindingStatus.OPEN,
            ),
            DDFinding(
                id="f2",
                category=FindingCategory.LEGAL,
                severity=FindingSeverity.HIGH,
                title="Pending Litigation",
                description="Material litigation pending",
                impact_amount=2_000_000,
                status=FindingStatus.IN_REVIEW,
            ),
            DDFinding(
                id="f3",
                category=FindingCategory.OPERATIONAL,
                severity=FindingSeverity.MEDIUM,
                title="Process Inefficiency",
                description="Operations process needs improvement",
                status=FindingStatus.RESOLVED,
            ),
        ]

        inputs = DDInputs(
            target_name="Test Co",
            findings=findings,
        )

        model = DueDiligenceModel(dd_id="test", name="Findings Test")
        model.set_inputs(inputs)
        result = model.calculate()

        summary = result["outputs"]["findings_summary"]
        assert summary["total_findings"] == 3
        assert summary["critical"] == 1
        assert summary["high"] == 1
        assert summary["medium"] == 1
        assert summary["total_quantified_impact"] == 7_000_000

    def test_qoe_calculation(self):
        """Test Quality of Earnings calculation."""
        qoe_adjustments = [
            QoEAdjustment(
                id="q1",
                category="One-time",
                description="Non-recurring legal settlement",
                amount=1_000_000,
                is_addback=True,
                is_recurring=False,
            ),
            QoEAdjustment(
                id="q2",
                category="Owner",
                description="Above-market owner compensation",
                amount=500_000,
                is_addback=True,
                is_recurring=True,
            ),
            QoEAdjustment(
                id="q3",
                category="Revenue",
                description="Revenue normalization",
                amount=200_000,
                is_addback=False,
                is_recurring=True,
            ),
        ]

        inputs = DDInputs(
            target_name="QoE Test",
            reported_ebitda=10_000_000,
            qoe_adjustments=qoe_adjustments,
        )

        model = DueDiligenceModel(dd_id="test", name="QoE Test")
        model.set_inputs(inputs)
        result = model.calculate()

        qoe = result["outputs"]["qoe_summary"]
        assert qoe["reported_ebitda"] == 10_000_000
        assert qoe["total_addbacks"] == 1_500_000
        assert qoe["total_deductions"] == 200_000
        assert qoe["adjusted_ebitda"] == 11_300_000
        assert qoe["adjustment_count"] == 3

    def test_risk_matrix(self):
        """Test risk matrix calculation."""
        risks = [
            RiskItem(
                id="r1",
                category=FindingCategory.COMMERCIAL,
                title="Customer Concentration",
                description="Top customer represents 40% of revenue",
                likelihood=RiskLikelihood.POSSIBLE,
                impact=RiskImpact.MAJOR,
            ),
            RiskItem(
                id="r2",
                category=FindingCategory.TECHNOLOGY,
                title="Technical Debt",
                description="Legacy system needs replacement",
                likelihood=RiskLikelihood.LIKELY,
                impact=RiskImpact.MODERATE,
            ),
            RiskItem(
                id="r3",
                category=FindingCategory.HR,
                title="Key Person Risk",
                description="Founder dependency",
                likelihood=RiskLikelihood.UNLIKELY,
                impact=RiskImpact.SEVERE,
            ),
        ]

        inputs = DDInputs(
            target_name="Risk Test",
            risks=risks,
        )

        model = DueDiligenceModel(dd_id="test", name="Risk Test")
        model.set_inputs(inputs)
        result = model.calculate()

        risk_summary = result["outputs"]["risk_summary"]
        assert risk_summary["total_risks"] == 3
        assert risk_summary["total_weighted_risk"] > 0
        assert "risk_distribution" in risk_summary

    def test_progress_tracking(self):
        """Test DD progress tracking."""
        work_items = [
            DDWorkItem(
                id="w1",
                category=FindingCategory.FINANCIAL,
                title="Financial statements review",
                completion_percent=100,
                documents_required=["3Y financials", "Tax returns"],
                documents_received=["3Y financials", "Tax returns"],
            ),
            DDWorkItem(
                id="w2",
                category=FindingCategory.LEGAL,
                title="Contract review",
                completion_percent=50,
                documents_required=["Customer contracts", "Vendor contracts"],
                documents_received=["Customer contracts"],
            ),
            DDWorkItem(
                id="w3",
                category=FindingCategory.OPERATIONAL,
                title="Site visit",
                completion_percent=0,
                documents_required=["Facility report"],
                documents_received=[],
            ),
        ]

        inputs = DDInputs(
            target_name="Progress Test",
            work_items=work_items,
        )

        model = DueDiligenceModel(dd_id="test", name="Progress Test")
        model.set_inputs(inputs)
        result = model.calculate()

        progress = result["outputs"]["progress"]
        assert progress["overall_completion"] == 50.0  # (100+50+0)/3
        assert progress["items_completed"] == 1
        assert progress["items_in_progress"] == 1
        assert progress["items_total"] == 3
        assert progress["documents_received"] == 3
        assert progress["documents_required"] == 5

    def test_recommendations(self):
        """Test recommendation generation."""
        findings = [
            DDFinding(
                id="f1",
                category=FindingCategory.FINANCIAL,
                severity=FindingSeverity.CRITICAL,
                title="Critical Issue",
                description="Deal breaker issue",
                status=FindingStatus.OPEN,
            ),
        ]

        risks = [
            RiskItem(
                id="r1",
                category=FindingCategory.COMMERCIAL,
                title="High Risk",
                description="High risk item",
                likelihood=RiskLikelihood.ALMOST_CERTAIN,
                impact=RiskImpact.SEVERE,
            ),
        ]

        inputs = DDInputs(
            target_name="Recs Test",
            findings=findings,
            risks=risks,
        )

        model = DueDiligenceModel(dd_id="test", name="Recs Test")
        model.set_inputs(inputs)
        result = model.calculate()

        recs = result["outputs"]["recommendations"]
        assert recs["deal_recommendation"] == "PROCEED_WITH_CAUTION"
        assert len(recs["recommendations"]) > 0
        assert len(recs["priority_actions"]) > 0


class TestDueDiligenceAPI:
    """Tests for due diligence API endpoints."""

    def test_dd_analyze_api(self, client):
        """Test DD analysis API endpoint."""
        response = client.post(
            "/api/v1/due-diligence/analyze",
            json={
                "target_name": "Target Corp",
                "transaction_type": "acquisition",
                "deal_value": 100000000,
                "vertical": "technology",
                "current_phase": "phase_1",
                "reported_ebitda": 10000000,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "outputs" in data

    def test_checklist_api(self, client):
        """Test checklist API endpoint."""
        response = client.post("/api/v1/due-diligence/checklist/technology")

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "checklist" in data
        assert data["checklist"]["vertical"] == "technology"

    def test_qoe_api(self, client):
        """Test QoE API endpoint."""
        response = client.post(
            "/api/v1/due-diligence/qoe",
            json={
                "reported_ebitda": 10000000,
                "adjustments": [
                    {
                        "id": "q1",
                        "category": "One-time",
                        "description": "Legal settlement",
                        "amount": 500000,
                        "is_addback": True,
                        "is_recurring": False,
                        "confidence_level": 1.0,
                    }
                ]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "qoe_analysis" in data
        assert data["qoe_analysis"]["adjusted_ebitda"] == 10500000

    def test_risk_matrix_api(self, client):
        """Test risk matrix API endpoint."""
        response = client.post(
            "/api/v1/due-diligence/risk-matrix",
            json={
                "risks": [
                    {
                        "id": "r1",
                        "category": "commercial",
                        "title": "Customer concentration",
                        "description": "Top 3 customers = 60% revenue",
                        "likelihood": "possible",
                        "impact": "major",
                    },
                    {
                        "id": "r2",
                        "category": "technology",
                        "title": "Legacy systems",
                        "description": "Tech debt",
                        "likelihood": "likely",
                        "impact": "moderate",
                    }
                ]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "risk_summary" in data
        assert data["risk_summary"]["total_risks"] == 2

    def test_findings_summarize_api(self, client):
        """Test findings summarize API endpoint."""
        response = client.post(
            "/api/v1/due-diligence/findings/summarize",
            json=[
                {
                    "id": "f1",
                    "category": "financial",
                    "severity": "high",
                    "title": "Revenue issue",
                    "description": "Revenue recognition",
                    "impact_amount": 1000000,
                    "status": "open",
                },
                {
                    "id": "f2",
                    "category": "legal",
                    "severity": "medium",
                    "title": "Contract issue",
                    "description": "Contract terms",
                    "status": "in_review",
                }
            ]
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["findings_summary"]["total_findings"] == 2
        assert data["findings_summary"]["high"] == 1

    def test_recommendations_api(self, client):
        """Test recommendations API endpoint."""
        response = client.post(
            "/api/v1/due-diligence/recommendations",
            json={
                "target_name": "Test Corp",
                "reported_ebitda": 10000000,
                "findings": [
                    {
                        "id": "f1",
                        "category": "financial",
                        "severity": "critical",
                        "title": "Critical issue",
                        "description": "Major problem",
                        "status": "open",
                    }
                ],
                "risks": [
                    {
                        "id": "r1",
                        "category": "commercial",
                        "title": "High risk",
                        "description": "Risk item",
                        "likelihood": "likely",
                        "impact": "major",
                    }
                ],
                "qoe_adjustments": [],
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "recommendations" in data
        assert data["recommendations"]["deal_recommendation"] == "PROCEED_WITH_CAUTION"

    def test_verticals_api(self, client):
        """Test verticals list API endpoint."""
        response = client.get("/api/v1/due-diligence/verticals")

        assert response.status_code == 200
        data = response.json()
        assert "verticals" in data
        assert len(data["verticals"]) > 0

    def test_categories_api(self, client):
        """Test categories list API endpoint."""
        response = client.get("/api/v1/due-diligence/categories")

        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) > 0

    def test_severities_api(self, client):
        """Test severities list API endpoint."""
        response = client.get("/api/v1/due-diligence/severities")

        assert response.status_code == 200
        data = response.json()
        assert "severities" in data
        assert len(data["severities"]) == 5
