"""Tests for bespoke transaction financial models."""

import pytest

from core.models import (
    SpinoffModel,
    SpinoffInputs,
    BusinessUnit,
    SharedCost,
    TransitionService,
    TransactionType,
    CostAllocationMethod,
    IPLicensingModel,
    IPLicensingInputs,
    IPAsset,
    RoyaltyTier,
    IPType,
    LicenseType,
    RoyaltyStructure,
    RMTModel,
    RMTInputs,
    CompanyProfile,
    MergerConsideration,
)


class TestSpinoffModel:
    """Tests for spin-off/carve-out model."""

    def test_basic_spinoff(self):
        """Test basic spin-off calculation."""
        inputs = SpinoffInputs(
            transaction_type=TransactionType.SPINOFF,
            spinco_name="NewCo",
            parent_name="ParentCorp",
            spinco_revenue=500_000_000,
            spinco_ebitda=100_000_000,
            spinco_debt=150_000_000,
            parent_revenue=2_000_000_000,
            parent_ebitda=400_000_000,
            parent_debt=500_000_000,
            spinco_ebitda_multiple=8.0,
            parent_ebitda_multiple=10.0,
        )

        model = SpinoffModel(model_id="test", name="Test Spinoff")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        assert "valuation" in result.outputs
        assert "value_creation" in result.outputs
        assert "proforma_financials" in result.outputs

    def test_spinoff_value_creation(self):
        """Test value creation from spin-off."""
        inputs = SpinoffInputs(
            spinco_ebitda=100_000_000,
            parent_ebitda=400_000_000,
            spinco_debt=100_000_000,
            parent_debt=300_000_000,
            spinco_ebitda_multiple=10.0,  # Higher multiple for focused business
            parent_ebitda_multiple=8.0,
        )

        model = SpinoffModel(model_id="test", name="Value Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        value_creation = result.outputs["value_creation"]
        # Multiple expansion should create value
        assert value_creation["gross_value_created"] != 0

    def test_carveout_ipo(self):
        """Test carve-out IPO structure."""
        inputs = SpinoffInputs(
            transaction_type=TransactionType.CARVEOUT,
            spinco_ebitda=50_000_000,
            spinco_debt=30_000_000,
            spinco_ebitda_multiple=12.0,
            shares_offered_percent=0.20,
            ipo_discount=0.15,
        )

        model = SpinoffModel(model_id="test", name="Carveout")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        assert result.outputs["transaction_summary"]["type"] == "carveout"
        assert result.outputs["valuation"]["ipo_value"] > 0

    def test_stranded_costs(self):
        """Test stranded cost analysis."""
        inputs = SpinoffInputs(
            spinco_ebitda=100_000_000,
            parent_ebitda=300_000_000,
            stranded_cost_amount=20_000_000,
            stranded_cost_mitigation_years=3,
            stranded_cost_mitigation_percent=0.80,
            projection_years=5,
        )

        model = SpinoffModel(model_id="test", name="Stranded")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        cost = result.outputs["cost_analysis"]
        assert cost["total_stranded_costs"] == 20_000_000
        assert cost["mitigated_stranded_costs"] == 16_000_000
        assert cost["permanent_stranded_costs"] == 4_000_000

    def test_transition_services(self):
        """Test TSA analysis."""
        inputs = SpinoffInputs(
            spinco_ebitda=100_000_000,
            parent_ebitda=400_000_000,
            transition_services=[
                TransitionService(name="IT Services", annual_cost=5_000_000, duration_months=24),
                TransitionService(name="HR Services", annual_cost=2_000_000, duration_months=18),
            ],
        )

        model = SpinoffModel(model_id="test", name="TSA Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        tsa = result.outputs["tsa_analysis"]
        assert len(tsa["tsa_agreements"]) == 2
        assert tsa["total_annual_tsa_cost"] == 7_000_000


class TestIPLicensingModel:
    """Tests for IP licensing model."""

    def test_basic_licensing(self):
        """Test basic IP licensing calculation."""
        inputs = IPLicensingInputs(
            ip_type=IPType.PATENT,
            ip_name="Core Technology Patent",
            license_type=LicenseType.EXCLUSIVE,
            license_term_years=10,
            royalty_rate=0.05,
            licensee_base_revenue=100_000_000,
            licensee_revenue_growth=0.10,
            discount_rate=0.12,
        )

        model = IPLicensingModel(model_id="test", name="Test License")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        assert "royalty_analysis" in result.outputs
        assert "valuation" in result.outputs
        assert "payment_analysis" in result.outputs

    def test_royalty_projections(self):
        """Test royalty income projections."""
        inputs = IPLicensingInputs(
            royalty_rate=0.05,
            licensee_base_revenue=50_000_000,
            licensee_revenue_growth=0.08,
            license_term_years=5,
            projection_years=5,
        )

        model = IPLicensingModel(model_id="test", name="Royalty Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        royalty = result.outputs["royalty_analysis"]
        assert len(royalty["annual_royalties"]) == 5
        # Year 1 royalty should be ~5% of year 1 revenue
        assert royalty["annual_royalties"][0]["gross_royalty"] > 0

    def test_upfront_and_milestones(self):
        """Test upfront fee and milestone payments."""
        inputs = IPLicensingInputs(
            royalty_rate=0.03,
            licensee_base_revenue=20_000_000,
            upfront_fee=5_000_000,
            signing_bonus=500_000,
            milestone_payments=[
                {"name": "FDA Approval", "amount": 2_000_000, "year": 2, "probability": 0.7},
                {"name": "Commercial Launch", "amount": 3_000_000, "year": 3, "probability": 0.5},
            ],
            discount_rate=0.15,
        )

        model = IPLicensingModel(model_id="test", name="Milestone Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        payments = result.outputs["payment_analysis"]
        assert payments["total_upfront"] == 5_500_000
        assert len(payments["milestones"]) == 2
        assert payments["expected_milestone_value"] == 2_000_000 * 0.7 + 3_000_000 * 0.5

    def test_tiered_royalties(self):
        """Test tiered royalty structure."""
        inputs = IPLicensingInputs(
            royalty_structure=RoyaltyStructure.TIERED,
            royalty_tiers=[
                RoyaltyTier(threshold=10_000_000, rate=0.05),
                RoyaltyTier(threshold=25_000_000, rate=0.04),
                RoyaltyTier(threshold=50_000_000, rate=0.03),
            ],
            licensee_base_revenue=30_000_000,
            licensee_revenue_growth=0.05,
            license_term_years=5,
        )

        model = IPLicensingModel(model_id="test", name="Tiered Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        royalty = result.outputs["royalty_analysis"]
        assert royalty["total_royalty_income"] > 0

    def test_license_valuation(self):
        """Test NPV-based license valuation."""
        inputs = IPLicensingInputs(
            royalty_rate=0.05,
            upfront_fee=2_000_000,
            licensee_base_revenue=40_000_000,
            licensee_revenue_growth=0.10,
            license_term_years=10,
            discount_rate=0.12,
        )

        model = IPLicensingModel(model_id="test", name="Valuation Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        valuation = result.outputs["valuation"]
        assert valuation["total_license_value"] > 0
        assert valuation["npv_royalties"] > 0
        assert valuation["upfront_value"] == 2_000_000

    def test_per_unit_royalty(self):
        """Test per-unit royalty structure."""
        inputs = IPLicensingInputs(
            royalty_structure=RoyaltyStructure.PER_UNIT,
            per_unit_royalty=2.50,
            licensee_units_base=100_000,
            licensee_unit_growth=0.15,
            license_term_years=5,
        )

        model = IPLicensingModel(model_id="test", name="Per Unit Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        royalty = result.outputs["royalty_analysis"]
        # Year 1: 100,000 * 1.15 * $2.50 = ~$287,500
        assert royalty["annual_royalties"][0]["gross_royalty"] > 250_000


class TestRMTModel:
    """Tests for Reverse Morris Trust model."""

    def test_basic_rmt(self):
        """Test basic RMT analysis."""
        inputs = RMTInputs(
            spinco_name="SpinCo",
            acquirer_name="Acquirer Inc",
            spinco_ebitda=200_000_000,
            spinco_debt=100_000_000,
            acquirer_ebitda=150_000_000,
            acquirer_shares=100_000_000,
            acquirer_share_price=25.0,
            acquirer_debt=200_000_000,
            spinco_ebitda_multiple=8.0,
            acquirer_ebitda_multiple=10.0,
        )

        model = RMTModel(model_id="test", name="Test RMT")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        assert "ownership_analysis" in result.outputs
        assert "tax_analysis" in result.outputs
        assert "accretion_dilution" in result.outputs

    def test_ownership_threshold(self):
        """Test >50% ownership requirement for tax-free treatment."""
        # Large SpinCo relative to Acquirer should qualify
        inputs = RMTInputs(
            spinco_ebitda=300_000_000,
            spinco_debt=100_000_000,
            acquirer_ebitda=150_000_000,
            acquirer_shares=50_000_000,
            acquirer_share_price=30.0,
            spinco_ebitda_multiple=8.0,
            acquirer_ebitda_multiple=10.0,
        )

        model = RMTModel(model_id="test", name="Ownership Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        ownership = result.outputs["ownership_analysis"]
        assert ownership["parent_shareholder_ownership"] > 0.50
        assert ownership["qualifies_as_tax_free"] is True

    def test_tax_savings(self):
        """Test tax savings calculation."""
        inputs = RMTInputs(
            spinco_ebitda=100_000_000,
            spinco_assets=500_000_000,
            spinco_tax_basis=200_000_000,  # $300M built-in gain
            spinco_debt=50_000_000,
            acquirer_ebitda=80_000_000,
            acquirer_shares=50_000_000,
            acquirer_share_price=20.0,
            corporate_tax_rate=0.25,
            spinco_ebitda_multiple=8.0,
        )

        model = RMTModel(model_id="test", name="Tax Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        tax = result.outputs["tax_analysis"]
        # Built-in gain = $500M - $200M = $300M
        assert tax["built_in_gain"] == 300_000_000
        # Tax savings = $300M * 25% = $75M
        assert tax["corporate_tax_savings"] == 75_000_000

    def test_synergy_analysis(self):
        """Test synergy analysis."""
        inputs = RMTInputs(
            spinco_ebitda=100_000_000,
            acquirer_ebitda=100_000_000,
            acquirer_shares=50_000_000,
            acquirer_share_price=25.0,
            revenue_synergies=10_000_000,
            cost_synergies=20_000_000,
            synergy_phase_in_years=3,
        )

        model = RMTModel(model_id="test", name="Synergy Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        synergies = result.outputs["synergy_analysis"]
        assert synergies["total_run_rate_synergies"] == 30_000_000
        assert len(synergies["phase_in_schedule"]) == 3

    def test_accretion_dilution(self):
        """Test accretion/dilution calculation."""
        inputs = RMTInputs(
            spinco_ebitda=80_000_000,
            spinco_debt=40_000_000,
            acquirer_ebitda=100_000_000,
            acquirer_shares=100_000_000,
            acquirer_share_price=20.0,
            spinco_ebitda_multiple=8.0,
            acquirer_ebitda_multiple=10.0,
            cost_synergies=15_000_000,
            corporate_tax_rate=0.25,
        )

        model = RMTModel(model_id="test", name="Accretion Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        accretion = result.outputs["accretion_dilution"]
        assert "acquirer_pre_merger_eps" in accretion
        assert "post_merger_eps" in accretion
        assert "accretion_dilution_percent" in accretion

    def test_proforma_combined(self):
        """Test pro-forma combined financials."""
        inputs = RMTInputs(
            spinco_revenue=300_000_000,
            spinco_ebitda=60_000_000,
            spinco_debt=50_000_000,
            acquirer_revenue=500_000_000,
            acquirer_ebitda=100_000_000,
            acquirer_debt=100_000_000,
            acquirer_shares=80_000_000,
            acquirer_share_price=25.0,
            cost_synergies=10_000_000,
        )

        model = RMTModel(model_id="test", name="Proforma Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        proforma = result.outputs["proforma_combined"]
        assert proforma["combined_revenue"] == 800_000_000
        assert proforma["combined_ebitda"] == 160_000_000
        assert proforma["combined_ebitda_with_synergies"] == 170_000_000


class TestBespokeModelAPI:
    """Tests for bespoke model API endpoints."""

    def test_spinoff_api(self, client):
        """Test spin-off API endpoint."""
        response = client.post(
            "/api/v1/bespoke/spinoff/analyze",
            json={
                "spinco_name": "NewCo",
                "spinco_ebitda": 100000000,
                "spinco_debt": 50000000,
                "parent_ebitda": 400000000,
                "parent_debt": 200000000,
                "spinco_ebitda_multiple": 8.0,
                "parent_ebitda_multiple": 10.0,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "outputs" in data

    def test_spinoff_value_creation_api(self, client):
        """Test spin-off value creation API endpoint."""
        response = client.post(
            "/api/v1/bespoke/spinoff/value-creation",
            json={
                "spinco_ebitda": 100000000,
                "parent_ebitda": 300000000,
                "spinco_ebitda_multiple": 10.0,
                "parent_ebitda_multiple": 8.0,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "value_creation" in data

    def test_ip_licensing_api(self, client):
        """Test IP licensing API endpoint."""
        response = client.post(
            "/api/v1/bespoke/ip-licensing/analyze",
            json={
                "ip_type": "patent",
                "ip_name": "Test Patent",
                "license_type": "exclusive",
                "license_term_years": 10,
                "royalty_rate": 0.05,
                "licensee_base_revenue": 50000000,
                "licensee_revenue_growth": 0.10,
                "discount_rate": 0.12,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "outputs" in data

    def test_ip_valuation_api(self, client):
        """Test IP valuation API endpoint."""
        response = client.post(
            "/api/v1/bespoke/ip-licensing/valuation",
            json={
                "royalty_rate": 0.05,
                "upfront_fee": 1000000,
                "licensee_base_revenue": 30000000,
                "license_term_years": 10,
                "discount_rate": 0.12,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "valuation" in data

    def test_rmt_api(self, client):
        """Test RMT API endpoint."""
        response = client.post(
            "/api/v1/bespoke/rmt/analyze",
            json={
                "spinco_ebitda": 150000000,
                "spinco_debt": 50000000,
                "acquirer_ebitda": 100000000,
                "acquirer_shares": 50000000,
                "acquirer_share_price": 30.0,
                "spinco_ebitda_multiple": 8.0,
                "acquirer_ebitda_multiple": 10.0,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "outputs" in data

    def test_rmt_tax_api(self, client):
        """Test RMT tax analysis API endpoint."""
        response = client.post(
            "/api/v1/bespoke/rmt/tax-analysis",
            json={
                "spinco_ebitda": 100000000,
                "spinco_assets": 500000000,
                "spinco_tax_basis": 200000000,
                "acquirer_ebitda": 80000000,
                "acquirer_shares": 50000000,
                "acquirer_share_price": 20.0,
                "corporate_tax_rate": 0.25,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "tax_analysis" in data

    def test_rmt_accretion_api(self, client):
        """Test RMT accretion/dilution API endpoint."""
        response = client.post(
            "/api/v1/bespoke/rmt/accretion-dilution",
            json={
                "spinco_ebitda": 80000000,
                "acquirer_ebitda": 100000000,
                "acquirer_shares": 100000000,
                "acquirer_share_price": 20.0,
                "cost_synergies": 10000000,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "accretion_dilution" in data
