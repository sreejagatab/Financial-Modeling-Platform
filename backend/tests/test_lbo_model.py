"""Tests for LBO model calculations."""

import pytest
from core.models.lbo_model import LBOModel, LBOInputs


class TestLBOModel:
    """Test suite for LBO financial model."""

    def get_base_inputs(self) -> LBOInputs:
        """Get base test inputs for LBO model."""
        return LBOInputs(
            enterprise_value=500.0,
            equity_purchase_price=450.0,
            existing_debt=0.0,
            transaction_fees=0.0,
            financing_fees=0.0,
            senior_debt_amount=250.0,
            senior_debt_rate=0.06,
            senior_debt_term_years=7,
            senior_debt_amortization=0.0,
            subordinated_debt_amount=0.0,
            subordinated_debt_rate=0.10,
            subordinated_debt_term_years=8,
            mezzanine_debt_amount=0.0,
            mezzanine_cash_rate=0.08,
            mezzanine_pik_rate=0.04,
            sponsor_equity=200.0,
            management_rollover=0.0,
            projection_years=5,
            revenue_base=300.0,
            revenue_growth_rates=[0.05, 0.05, 0.05, 0.05, 0.05],
            ebitda_margins=[0.20, 0.21, 0.22, 0.22, 0.23],
            capex_percent_revenue=0.03,
            nwc_percent_revenue=0.10,
            tax_rate=0.25,
            depreciation_percent_revenue=0.02,
            exit_year=5,
            exit_multiple=8.0,
        )

    def test_lbo_model_basic_calculation(self):
        """Test basic LBO model calculation returns valid results."""
        model = LBOModel(model_id="test-1", name="Test LBO")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()

        assert result.success is True
        assert len(result.errors) == 0
        assert "irr" in result.outputs
        assert "moic" in result.outputs
        assert result.outputs["irr"] > 0  # Should have positive IRR
        assert result.outputs["moic"] > 1  # Should have MOIC > 1x

    def test_lbo_model_irr_range(self):
        """Test that IRR is within reasonable range."""
        model = LBOModel(model_id="test-2", name="Test LBO")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()

        irr = result.outputs["irr"]
        # IRR should be between 0% and 100% for reasonable scenarios
        assert 0 < irr < 1.0, f"IRR {irr:.2%} outside reasonable range"

    def test_lbo_model_moic_calculation(self):
        """Test MOIC calculation is correct."""
        model = LBOModel(model_id="test-3", name="Test LBO")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()

        # Verify MOIC = total returned / total invested
        total_invested = result.outputs["total_equity_invested"]
        total_returned = result.outputs["total_equity_returned"]
        expected_moic = total_returned / total_invested

        assert abs(result.outputs["moic"] - expected_moic) < 0.001

    def test_lbo_model_sources_uses_balance(self):
        """Test that sources equal uses."""
        model = LBOModel(model_id="test-4", name="Test LBO")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()

        sources = sum(result.outputs["sources"].values())
        uses = sum(result.outputs["uses"].values())

        assert abs(sources - uses) < 0.01, f"Sources ({sources}) != Uses ({uses})"

    def test_lbo_model_projections_length(self):
        """Test that projections have correct length."""
        inputs = self.get_base_inputs()
        model = LBOModel(model_id="test-5", name="Test LBO")
        model.set_inputs(inputs)

        result = model.calculate()

        assert len(result.outputs["years"]) == inputs.projection_years
        assert len(result.outputs["revenues"]) == inputs.projection_years
        assert len(result.outputs["ebitda"]) == inputs.projection_years
        assert len(result.outputs["free_cash_flow"]) == inputs.projection_years

    def test_lbo_model_revenue_growth(self):
        """Test that revenue grows according to growth rates."""
        inputs = self.get_base_inputs()
        model = LBOModel(model_id="test-6", name="Test LBO")
        model.set_inputs(inputs)

        result = model.calculate()

        revenues = result.outputs["revenues"]
        # First year revenue should be base * (1 + growth)
        expected_year1 = inputs.revenue_base * (1 + inputs.revenue_growth_rates[0])
        assert abs(revenues[0] - expected_year1) < 0.01

    def test_lbo_model_entry_multiple(self):
        """Test entry EV/EBITDA calculation."""
        inputs = self.get_base_inputs()
        model = LBOModel(model_id="test-7", name="Test LBO")
        model.set_inputs(inputs)

        result = model.calculate()

        entry_ebitda = inputs.revenue_base * inputs.ebitda_margins[0]
        expected_multiple = inputs.enterprise_value / entry_ebitda

        assert abs(result.outputs["entry_ev_ebitda"] - expected_multiple) < 0.1

    def test_lbo_model_sensitivity(self):
        """Test sensitivity analysis functionality."""
        inputs = self.get_base_inputs()
        model = LBOModel(model_id="test-8", name="Test LBO")
        model.set_inputs(inputs)

        sensitivity = model.run_returns_sensitivity(
            exit_multiples=[6.0, 8.0, 10.0],
            exit_years=[3, 4, 5]
        )

        assert "irr" in sensitivity
        assert "moic" in sensitivity
        assert len(sensitivity["irr"]) == 3  # 3 exit multiples
        assert len(sensitivity["irr"][0]) == 3  # 3 exit years

    def test_lbo_model_validation_error(self):
        """Test that validation catches invalid inputs."""
        inputs = LBOInputs(
            enterprise_value=-100,  # Invalid negative value
            equity_purchase_price=450.0,
            senior_debt_amount=250.0,
            senior_debt_rate=0.06,
            sponsor_equity=200.0,
            projection_years=5,
            revenue_base=300.0,
            exit_year=5,
            exit_multiple=8.0,
        )

        model = LBOModel(model_id="test-9", name="Test LBO")
        model.set_inputs(inputs)

        is_valid, errors = model.validate_inputs()

        assert is_valid is False
        assert len(errors) > 0


class TestFinancialCalculations:
    """Test suite for financial calculation utilities."""

    def test_irr_calculation(self):
        """Test IRR calculation with known cash flows."""
        from core.engine.base_model import FinancialCalculations

        # Cash flows: -100 initial, 150 return after 1 year = 50% IRR
        cash_flows = [-100, 150]
        irr = FinancialCalculations.irr(cash_flows)

        assert abs(irr - 0.5) < 0.01

    def test_moic_calculation(self):
        """Test MOIC calculation."""
        from core.engine.base_model import FinancialCalculations

        moic = FinancialCalculations.moic(
            total_distributions=300,
            total_invested=100
        )

        assert moic == 3.0

    def test_wacc_calculation(self):
        """Test WACC calculation."""
        from core.engine.base_model import FinancialCalculations

        wacc = FinancialCalculations.wacc(
            equity_weight=0.7,
            cost_of_equity=0.10,
            debt_weight=0.3,
            cost_of_debt=0.05,
            tax_rate=0.25
        )

        # WACC = 0.7 * 0.10 + 0.3 * 0.05 * (1 - 0.25) = 0.07 + 0.01125 = 0.08125
        assert abs(wacc - 0.08125) < 0.0001

    def test_terminal_value_gordon_growth(self):
        """Test Gordon Growth terminal value calculation."""
        from core.engine.base_model import FinancialCalculations

        tv = FinancialCalculations.terminal_value_gordon_growth(
            final_fcf=100,
            discount_rate=0.10,
            terminal_growth_rate=0.02
        )

        # TV = 100 * (1 + 0.02) / (0.10 - 0.02) = 102 / 0.08 = 1275
        assert abs(tv - 1275) < 1
