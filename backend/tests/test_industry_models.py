"""Tests for industry-specific financial models."""

import pytest

from core.models import (
    SaleLeasebackModel,
    SaleLeasebackInputs,
    PropertyInfo,
    LeaseType,
    EscalationType,
    REITModel,
    REITInputs,
    REITProperty,
    REITDebt,
    REITType,
    PropertySegment,
    NAVModel,
    NAVInputs,
    NAVAsset,
    NAVLiability,
    AssetType,
    ValuationMethod,
)


class TestSaleLeasebackModel:
    """Tests for sale-leaseback model."""

    def test_basic_sale_leaseback(self):
        """Test basic sale-leaseback calculation."""
        properties = [
            PropertyInfo(
                name="HQ Building",
                property_type="office",
                square_feet=100_000,
                current_book_value=20_000_000,
                market_value=30_000_000,
                annual_noi=2_100_000,
            )
        ]

        inputs = SaleLeasebackInputs(
            properties=properties,
            target_cap_rate=0.07,
            current_ebitda=10_000_000,
            current_debt=15_000_000,
        )

        model = SaleLeasebackModel(model_id="test", name="Test SLB")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        assert "transaction_economics" in result.outputs
        assert "lease_projections" in result.outputs
        assert "npv_analysis" in result.outputs

    def test_sale_leaseback_gain_calculation(self):
        """Test gain/loss calculation on sale."""
        properties = [
            PropertyInfo(
                name="Factory",
                property_type="industrial",
                square_feet=200_000,
                current_book_value=10_000_000,
                market_value=25_000_000,
                annual_noi=1_500_000,
            )
        ]

        inputs = SaleLeasebackInputs(
            properties=properties,
            corporate_tax_rate=0.25,
        )

        model = SaleLeasebackModel(model_id="test", name="Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        transaction = result.outputs["transaction_economics"]
        # Gain = Market Value - Book Value = 25M - 10M = 15M
        assert transaction["gain_loss"] == 15_000_000
        # Tax = 15M * 25% = 3.75M
        assert transaction["tax_on_gain"] == 3_750_000

    def test_lease_escalation(self):
        """Test lease payment escalation."""
        properties = [
            PropertyInfo(
                name="Retail",
                property_type="retail",
                square_feet=50_000,
                current_book_value=8_000_000,
                market_value=10_000_000,
                annual_noi=700_000,
            )
        ]

        inputs = SaleLeasebackInputs(
            properties=properties,
            target_cap_rate=0.07,
            escalation_type=EscalationType.FIXED,
            annual_escalation_rate=0.03,
            projection_years=10,
        )

        model = SaleLeasebackModel(model_id="test", name="Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        lease = result.outputs["lease_projections"]
        # Check escalation
        assert len(lease["annual_rents"]) == 10
        # Year 2 rent should be ~3% higher than year 1
        assert lease["annual_rents"][1] / lease["annual_rents"][0] == pytest.approx(1.03, rel=0.01)

    def test_coverage_ratios(self):
        """Test rent coverage ratio calculation."""
        properties = [
            PropertyInfo(
                name="Distribution Center",
                property_type="industrial",
                square_feet=300_000,
                current_book_value=40_000_000,
                market_value=50_000_000,
                annual_noi=3_000_000,
            )
        ]

        inputs = SaleLeasebackInputs(
            properties=properties,
            target_cap_rate=0.06,
            current_ebitda=15_000_000,
        )

        model = SaleLeasebackModel(model_id="test", name="Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        coverage = result.outputs["coverage_ratios"]
        # Initial rent = 50M * 6% = 3M, EBITDA = 15M, Coverage = 5x
        assert coverage["ebitda_rent_coverage"] == pytest.approx(5.0, rel=0.01)

    def test_multi_property_portfolio(self):
        """Test portfolio with multiple properties."""
        properties = [
            PropertyInfo(name="Property A", property_type="office", square_feet=50_000, current_book_value=8_000_000, market_value=10_000_000, annual_noi=600_000),
            PropertyInfo(name="Property B", property_type="industrial", square_feet=80_000, current_book_value=12_000_000, market_value=15_000_000, annual_noi=900_000),
            PropertyInfo(name="Property C", property_type="retail", square_feet=25_000, current_book_value=4_000_000, market_value=5_000_000, annual_noi=350_000),
        ]

        inputs = SaleLeasebackInputs(properties=properties)

        model = SaleLeasebackModel(model_id="test", name="Portfolio")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        portfolio = result.outputs["portfolio_summary"]
        assert portfolio["property_count"] == 3
        assert portfolio["total_market_value"] == 30_000_000
        assert portfolio["total_annual_noi"] == 1_850_000


class TestREITModel:
    """Tests for REIT valuation model."""

    def test_basic_reit_analysis(self):
        """Test basic REIT analysis."""
        inputs = REITInputs(
            reit_type=REITType.EQUITY,
            shares_outstanding=100_000_000,
            current_share_price=25.0,
            total_noi=150_000_000,
            total_debt=500_000_000,
            rental_revenue=200_000_000,
            property_expenses=50_000_000,
            depreciation=40_000_000,
            interest_expense=25_000_000,
        )

        model = REITModel(model_id="test", name="Test REIT")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        assert "ffo_affo" in result.outputs
        assert "dividend_analysis" in result.outputs
        assert "nav" in result.outputs

    def test_ffo_calculation(self):
        """Test FFO calculation."""
        inputs = REITInputs(
            shares_outstanding=50_000_000,
            current_share_price=30.0,
            rental_revenue=100_000_000,
            other_revenue=5_000_000,
            property_expenses=30_000_000,
            general_admin=10_000_000,
            depreciation=25_000_000,
            interest_expense=15_000_000,
            total_debt=300_000_000,
        )

        model = REITModel(model_id="test", name="FFO Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        ffo = result.outputs["ffo_affo"]
        # FFO adds back depreciation to net income
        assert ffo["ffo"] > 0
        assert ffo["ffo_per_share"] > 0
        assert ffo["depreciation"] == 25_000_000

    def test_dividend_yield(self):
        """Test dividend yield calculation."""
        inputs = REITInputs(
            shares_outstanding=100_000_000,
            current_share_price=20.0,
            total_noi=100_000_000,
            rental_revenue=120_000_000,
            property_expenses=20_000_000,
            depreciation=15_000_000,
            total_debt=200_000_000,
            target_payout_ratio=0.80,
        )

        model = REITModel(model_id="test", name="Dividend Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        dividend = result.outputs["dividend_analysis"]
        assert "current_yield" in dividend
        assert dividend["affo_payout_ratio"] <= 1.0

    def test_nav_premium_discount(self):
        """Test NAV premium/discount calculation."""
        inputs = REITInputs(
            shares_outstanding=50_000_000,
            current_share_price=40.0,  # Market price
            total_noi=80_000_000,
            total_real_estate=1_000_000_000,
            total_debt=400_000_000,
            exit_cap_rate=0.06,
        )

        model = REITModel(model_id="test", name="NAV Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        nav = result.outputs["nav"]
        assert "nav_per_share" in nav
        assert "premium_discount_to_nav" in nav

    def test_reit_projections(self):
        """Test REIT projections over time."""
        inputs = REITInputs(
            shares_outstanding=100_000_000,
            current_share_price=25.0,
            total_noi=100_000_000,
            rental_revenue=120_000_000,
            property_expenses=20_000_000,
            depreciation=20_000_000,
            total_debt=300_000_000,
            projection_years=5,
            noi_growth_rate=0.03,
        )

        model = REITModel(model_id="test", name="Projections")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        projections = result.outputs["projections"]
        assert len(projections["noi"]) == 5
        assert len(projections["ffo"]) == 5
        # Check NOI grows at expected rate
        assert projections["noi"][1] / projections["noi"][0] == pytest.approx(1.03, rel=0.05)


class TestNAVModel:
    """Tests for NAV model."""

    def test_basic_nav_calculation(self):
        """Test basic NAV calculation."""
        inputs = NAVInputs(
            shares_outstanding=100_000_000,
            current_share_price=15.0,
            total_real_estate=1_000_000_000,
            total_investments=200_000_000,
            cash_and_equivalents=50_000_000,
            total_debt=400_000_000,
            holding_company_discount=0.10,
        )

        model = NAVModel(model_id="test", name="Test NAV")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        nav = result.outputs["nav_calculation"]
        # GAV = 1000M + 200M + 50M = 1250M
        assert nav["gross_asset_value"] == 1_250_000_000
        # Pre-discount NAV = 1250M - 400M = 850M
        assert nav["pre_discount_nav"] == 850_000_000

    def test_nav_with_detailed_assets(self):
        """Test NAV with detailed asset breakdown."""
        assets = [
            NAVAsset(
                name="Office Portfolio",
                asset_type=AssetType.REAL_ESTATE,
                book_value=400_000_000,
                annual_income=30_000_000,
                cap_rate=0.06,
                valuation_method=ValuationMethod.INCOME,
            ),
            NAVAsset(
                name="Equity Stake in SubCo",
                asset_type=AssetType.EQUITY_STAKE,
                book_value=100_000_000,
                market_value=150_000_000,
                ownership_percent=0.80,
            ),
            NAVAsset(
                name="Cash",
                asset_type=AssetType.CASH,
                book_value=50_000_000,
                market_value=50_000_000,
            ),
        ]

        inputs = NAVInputs(
            shares_outstanding=50_000_000,
            assets=assets,
            total_debt=200_000_000,
        )

        model = NAVModel(model_id="test", name="Detailed NAV")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        asset_val = result.outputs["asset_valuation"]
        # Office valued at NOI/cap = 30M/0.06 = 500M
        assert asset_val["individual_assets"][0]["market_value"] == 500_000_000
        # Equity stake = 150M * 80% = 120M
        assert asset_val["individual_assets"][1]["attributable_value"] == 120_000_000

    def test_holding_company_discount(self):
        """Test holding company discount application."""
        inputs = NAVInputs(
            shares_outstanding=100_000_000,
            total_real_estate=500_000_000,
            cash_and_equivalents=100_000_000,
            total_debt=200_000_000,
            holding_company_discount=0.15,
        )

        model = NAVModel(model_id="test", name="Discount Test")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        nav = result.outputs["nav_calculation"]
        # Pre-discount NAV = 600M - 200M = 400M
        # Discount = 400M * 15% = 60M
        # Final NAV = 400M - 60M = 340M
        assert nav["holding_discount_amount"] == 60_000_000
        assert nav["net_asset_value"] == 340_000_000

    def test_nav_per_share(self):
        """Test NAV per share calculation."""
        inputs = NAVInputs(
            shares_outstanding=50_000_000,
            current_share_price=12.0,
            total_real_estate=400_000_000,
            total_investments=100_000_000,
            cash_and_equivalents=50_000_000,
            total_debt=150_000_000,
            holding_company_discount=0.10,
        )

        model = NAVModel(model_id="test", name="Per Share")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        per_share = result.outputs["per_share_metrics"]
        # GAV = 550M, Debt = 150M, Pre-discount NAV = 400M
        # After 10% discount = 360M
        # Per share = 360M / 50M = 7.20
        assert per_share["nav_per_share"] == pytest.approx(7.20, rel=0.01)

    def test_nav_premium_discount_to_market(self):
        """Test premium/discount calculation vs market price."""
        inputs = NAVInputs(
            shares_outstanding=100_000_000,
            current_share_price=8.0,  # Below NAV
            total_real_estate=600_000_000,
            total_investments=200_000_000,
            cash_and_equivalents=100_000_000,
            total_debt=300_000_000,
            holding_company_discount=0.10,
        )

        model = NAVModel(model_id="test", name="Premium/Discount")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        per_share = result.outputs["per_share_metrics"]
        # GAV = 900M, Debt = 300M, Pre-discount = 600M, After discount = 540M
        # NAV/share = 5.40
        # Trading at $8 = premium of 48%
        assert per_share["trading_at_premium"] is True
        assert per_share["premium_discount_to_nav"] > 0

    def test_sotp_breakdown(self):
        """Test sum-of-the-parts breakdown."""
        assets = [
            NAVAsset(name="Real Estate", asset_type=AssetType.REAL_ESTATE, book_value=300_000_000),
            NAVAsset(name="Investments", asset_type=AssetType.INVESTMENT, book_value=100_000_000),
            NAVAsset(name="Cash", asset_type=AssetType.CASH, book_value=50_000_000),
        ]

        inputs = NAVInputs(
            shares_outstanding=50_000_000,
            assets=assets,
            total_debt=100_000_000,
        )

        model = NAVModel(model_id="test", name="SOTP")
        model.set_inputs(inputs)
        result = model.calculate()

        assert result.success
        sotp = result.outputs["sotp_breakdown"]
        assert "real_estate" in sotp
        assert "investment" in sotp
        assert "cash" in sotp


class TestIndustryModelAPI:
    """Tests for industry model API endpoints."""

    def test_sale_leaseback_api(self, client):
        """Test sale-leaseback API endpoint."""
        response = client.post(
            "/api/v1/industry/sale-leaseback/analyze",
            json={
                "properties": [
                    {
                        "name": "Test Property",
                        "property_type": "office",
                        "square_feet": 100000,
                        "current_book_value": 20000000,
                        "market_value": 30000000,
                        "annual_noi": 2100000,
                    }
                ],
                "target_cap_rate": 0.07,
                "current_ebitda": 10000000,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "outputs" in data

    def test_reit_api(self, client):
        """Test REIT analysis API endpoint."""
        response = client.post(
            "/api/v1/industry/reit/analyze",
            json={
                "shares_outstanding": 100000000,
                "current_share_price": 25.0,
                "total_noi": 150000000,
                "total_debt": 500000000,
                "rental_revenue": 200000000,
                "property_expenses": 50000000,
                "depreciation": 40000000,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "ffo_affo" in data["outputs"]

    def test_reit_ffo_api(self, client):
        """Test REIT FFO API endpoint."""
        response = client.post(
            "/api/v1/industry/reit/ffo-affo",
            json={
                "shares_outstanding": 50000000,
                "current_share_price": 30.0,
                "rental_revenue": 100000000,
                "property_expenses": 30000000,
                "depreciation": 25000000,
                "interest_expense": 15000000,
                "total_debt": 300000000,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "ffo_affo" in data

    def test_nav_api(self, client):
        """Test NAV analysis API endpoint."""
        response = client.post(
            "/api/v1/industry/nav/analyze",
            json={
                "shares_outstanding": 100000000,
                "current_share_price": 15.0,
                "total_real_estate": 1000000000,
                "total_investments": 200000000,
                "cash_and_equivalents": 50000000,
                "total_debt": 400000000,
                "holding_company_discount": 0.10,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "nav_calculation" in data["outputs"]

    def test_nav_sotp_api(self, client):
        """Test NAV SOTP API endpoint."""
        response = client.post(
            "/api/v1/industry/nav/sotp",
            json={
                "shares_outstanding": 50000000,
                "total_real_estate": 300000000,
                "total_investments": 100000000,
                "cash_and_equivalents": 50000000,
                "total_debt": 100000000,
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "sotp_breakdown" in data
