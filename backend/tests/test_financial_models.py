"""Tests for financial models - 3-statement, operating, and 13-week cash flow."""

import pytest
from datetime import datetime

from core.models.three_statement import (
    ThreeStatementModel,
    ThreeStatementInputs,
)
from core.models.operating_model import (
    OperatingModel,
    OperatingInputs,
    RevenueStream,
    CostDriver,
)
from core.models.cash_flow_13week import (
    CashFlow13WeekModel,
    CashFlowInputs,
    WeeklyCashInput,
    RecurringCashItem,
)
from core.engine.scenario_manager import (
    ScenarioManager,
    ScenarioType,
    SensitivityConfig,
)
from core.models.lbo_model import LBOInputs


class TestThreeStatementModel:
    """Test suite for 3-statement financial model."""

    def get_base_inputs(self) -> ThreeStatementInputs:
        """Get base test inputs for 3-statement model."""
        return ThreeStatementInputs(
            company_name="Test Company",
            base_revenue=1000000.0,
            base_cogs=600000.0,
            base_sga=200000.0,
            base_da=50000.0,
            base_interest_expense=25000.0,
            base_cash=100000.0,
            base_accounts_receivable=120000.0,
            base_inventory=80000.0,
            base_ppe_gross=500000.0,
            base_accumulated_depreciation=100000.0,
            base_accounts_payable=60000.0,
            base_long_term_debt=400000.0,
            base_common_stock=100000.0,
            base_retained_earnings=140000.0,
            projection_years=5,
            revenue_growth_rates=[0.08, 0.07, 0.06, 0.05, 0.05],
            cogs_percent_revenue=[0.60, 0.59, 0.58, 0.58, 0.57],
            sga_percent_revenue=[0.20, 0.19, 0.18, 0.18, 0.17],
            rd_percent_revenue=[0.03, 0.03, 0.03, 0.03, 0.03],
            ar_days=45.0,
            inventory_days=50.0,
            ap_days=35.0,
            capex_percent_revenue=[0.05, 0.05, 0.04, 0.04, 0.04],
            debt_interest_rate=0.05,
            tax_rate=0.25,
            dividend_payout_ratio=0.20,
        )

    def test_three_statement_basic_calculation(self):
        """Test basic 3-statement model calculation."""
        model = ThreeStatementModel(model_id="test-3stmt", name="Test 3-Statement")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()

        assert result.success is True
        assert len(result.errors) == 0
        assert "income_statement" in result.outputs
        assert "balance_sheet" in result.outputs
        assert "cash_flow" in result.outputs

    def test_income_statement_margins(self):
        """Test that income statement margins are calculated correctly."""
        model = ThreeStatementModel(model_id="test-3stmt", name="Test 3-Statement")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()
        inc = result.outputs["income_statement"]

        # Gross margin should be around 40% (1 - 60% COGS)
        assert 0.35 < inc["gross_margin"][0] < 0.45

        # EBITDA margin should be positive
        assert all(margin > 0 for margin in inc["ebitda_margin"])

    def test_balance_sheet_balances(self):
        """Test that balance sheet actually balances."""
        model = ThreeStatementModel(model_id="test-3stmt", name="Test 3-Statement")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()
        bs = result.outputs["balance_sheet"]

        # Balance check should be close to zero
        for i, check in enumerate(bs["balance_check"]):
            assert abs(check) < 1000, f"Balance sheet doesn't balance in year {i + 1}"

    def test_cash_flow_integration(self):
        """Test that cash flow statement integrates correctly."""
        model = ThreeStatementModel(model_id="test-3stmt", name="Test 3-Statement")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()
        cf = result.outputs["cash_flow"]
        bs = result.outputs["balance_sheet"]

        # Ending cash should match balance sheet cash
        for i in range(len(cf["ending_cash"])):
            assert abs(cf["ending_cash"][i] - bs["cash"][i]) < 1

    def test_revenue_growth(self):
        """Test that revenue grows according to growth rates."""
        model = ThreeStatementModel(model_id="test-3stmt", name="Test 3-Statement")
        inputs = self.get_base_inputs()
        model.set_inputs(inputs)

        result = model.calculate()
        inc = result.outputs["income_statement"]

        # Check year 1 revenue
        expected_year1 = inputs.base_revenue * (1 + inputs.revenue_growth_rates[0])
        assert abs(inc["revenue"][0] - expected_year1) < 1


class TestOperatingModel:
    """Test suite for operating model."""

    def get_base_inputs(self) -> OperatingInputs:
        """Get base test inputs for operating model."""
        return OperatingInputs(
            company_name="Test Company",
            projection_years=5,
            revenue_streams=[
                RevenueStream(
                    name="Product A",
                    base_units=10000.0,
                    base_price=100.0,
                    unit_growth_rates=[0.10, 0.08, 0.06, 0.05, 0.05],
                    price_growth_rates=[0.02, 0.02, 0.02, 0.02, 0.02],
                ),
                RevenueStream(
                    name="Product B",
                    base_units=5000.0,
                    base_price=200.0,
                    unit_growth_rates=[0.15, 0.12, 0.10, 0.08, 0.06],
                    price_growth_rates=[0.03, 0.03, 0.02, 0.02, 0.02],
                ),
            ],
            cost_of_goods=[
                CostDriver(
                    name="Materials",
                    variable_rate=0.40,
                    variable_basis="revenue",
                ),
                CostDriver(
                    name="Direct Labor",
                    fixed_amount=100000.0,
                    variable_rate=0.10,
                    variable_basis="revenue",
                ),
            ],
            operating_expenses=[
                CostDriver(
                    name="Sales & Marketing",
                    fixed_amount=50000.0,
                    variable_rate=0.05,
                    variable_basis="revenue",
                ),
                CostDriver(
                    name="G&A",
                    fixed_amount=80000.0,
                    inflation_rate=0.03,
                ),
            ],
            base_headcount=50,
            revenue_per_employee=100000.0,
            avg_salary=60000.0,
            benefits_rate=0.25,
        )

    def test_operating_model_basic_calculation(self):
        """Test basic operating model calculation."""
        model = OperatingModel(model_id="test-op", name="Test Operating")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()

        assert result.success is True
        assert len(result.errors) == 0
        assert "revenue" in result.outputs
        assert "profitability" in result.outputs

    def test_revenue_stream_aggregation(self):
        """Test that revenue streams aggregate correctly."""
        model = OperatingModel(model_id="test-op", name="Test Operating")
        inputs = self.get_base_inputs()
        model.set_inputs(inputs)

        result = model.calculate()
        revenue = result.outputs["revenue"]

        # Year 1 revenue should be sum of both streams
        product_a_year1 = 10000 * 1.10 * 100 * 1.02
        product_b_year1 = 5000 * 1.15 * 200 * 1.03

        expected = product_a_year1 + product_b_year1
        assert abs(revenue["total"][0] - expected) < 10

    def test_gross_margin_positive(self):
        """Test that gross margin is positive."""
        model = OperatingModel(model_id="test-op", name="Test Operating")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()
        profit = result.outputs["profitability"]

        assert all(margin > 0 for margin in profit["gross_margin"])

    def test_headcount_scaling(self):
        """Test that headcount scales with revenue."""
        model = OperatingModel(model_id="test-op", name="Test Operating")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()
        headcount = result.outputs["headcount"]

        # Headcount should grow as revenue grows
        assert headcount["employees"][-1] >= headcount["employees"][0]

    def test_cost_driver_inflation(self):
        """Test that fixed costs inflate over time."""
        model = OperatingModel(model_id="test-op", name="Test Operating")
        inputs = self.get_base_inputs()
        model.set_inputs(inputs)

        result = model.calculate()
        opex = result.outputs["opex"]

        # G&A with 3% inflation should grow
        ga_costs = opex["by_driver"]["G&A"]
        assert ga_costs[-1] > ga_costs[0]


class TestCashFlow13WeekModel:
    """Test suite for 13-week cash flow model."""

    def get_base_inputs(self) -> CashFlowInputs:
        """Get base test inputs for 13-week model."""
        return CashFlowInputs(
            start_date=datetime(2024, 1, 1),
            beginning_cash=500000.0,
            revolver_capacity=1000000.0,
            revolver_drawn=0.0,
            revolver_interest_rate=0.08,
            minimum_cash_buffer=100000.0,
            base_weekly_collections=200000.0,
            collections_growth_rate=0.01,
            base_weekly_payables=80000.0,
            payroll_amount=150000.0,
            payroll_frequency="biweekly",
            scheduled_disbursements=[
                WeeklyCashInput(week=1, amount=50000.0, description="Rent"),
                WeeklyCashInput(week=5, amount=50000.0, description="Rent"),
                WeeklyCashInput(week=9, amount=50000.0, description="Rent"),
            ],
            debt_payments=[
                WeeklyCashInput(week=4, amount=100000.0, description="Term loan"),
                WeeklyCashInput(week=8, amount=100000.0, description="Term loan"),
                WeeklyCashInput(week=12, amount=100000.0, description="Term loan"),
            ],
            capex_schedule=[
                WeeklyCashInput(week=6, amount=200000.0, description="Equipment"),
            ],
        )

    def test_13week_basic_calculation(self):
        """Test basic 13-week cash flow calculation."""
        model = CashFlow13WeekModel(model_id="test-13wk", name="Test 13-Week")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()

        assert result.success is True
        assert len(result.errors) == 0
        assert len(result.outputs["weeks"]) == 13

    def test_cash_flow_continuity(self):
        """Test that cash flows continuously from week to week."""
        model = CashFlow13WeekModel(model_id="test-13wk", name="Test 13-Week")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()
        liq = result.outputs["liquidity"]

        # Ending cash of week N should equal beginning cash of week N+1
        for i in range(12):
            assert abs(liq["ending_cash"][i] - liq["beginning_cash"][i + 1]) < 1

    def test_revolver_management(self):
        """Test that revolver is used when cash is low."""
        model = CashFlow13WeekModel(model_id="test-13wk", name="Test 13-Week")
        inputs = self.get_base_inputs()
        inputs.beginning_cash = 50000.0  # Low starting cash
        inputs.minimum_cash_buffer = 100000.0
        model.set_inputs(inputs)

        result = model.calculate()
        liq = result.outputs["liquidity"]

        # Should have drawn on revolver at some point
        assert max(liq["revolver_balance"]) > 0

    def test_weekly_summary(self):
        """Test weekly summary generation."""
        model = CashFlow13WeekModel(model_id="test-13wk", name="Test 13-Week")
        model.set_inputs(self.get_base_inputs())
        model.calculate()

        summary = model.get_weekly_summary()

        assert len(summary) == 13
        assert all("week" in row for row in summary)
        assert all("ending_cash" in row for row in summary)

    def test_minimum_cash_tracking(self):
        """Test that minimum cash week is tracked."""
        model = CashFlow13WeekModel(model_id="test-13wk", name="Test 13-Week")
        model.set_inputs(self.get_base_inputs())

        result = model.calculate()
        metrics = result.outputs["metrics"]

        assert "minimum_cash_week" in metrics
        assert 1 <= metrics["minimum_cash_week"] <= 13


class TestScenarioManager:
    """Test suite for scenario management."""

    def get_base_lbo_inputs(self) -> LBOInputs:
        """Get base LBO inputs for testing."""
        return LBOInputs(
            enterprise_value=500.0,
            equity_purchase_price=450.0,
            senior_debt_amount=250.0,
            senior_debt_rate=0.06,
            sponsor_equity=200.0,
            projection_years=5,
            revenue_base=300.0,
            revenue_growth_rates=[0.05, 0.05, 0.05, 0.05, 0.05],
            ebitda_margins=[0.20, 0.21, 0.22, 0.22, 0.23],
            exit_year=5,
            exit_multiple=8.0,
        )

    def test_scenario_creation(self):
        """Test creating scenarios."""
        inputs = self.get_base_lbo_inputs()
        manager = ScenarioManager(inputs)

        scenario = manager.create_scenario(
            name="Upside Case",
            scenario_type=ScenarioType.UPSIDE,
            assumptions={"exit_multiple": 9.0},
            probability_weight=0.25,
        )

        assert scenario.name == "Upside Case"
        assert scenario.scenario_type == ScenarioType.UPSIDE
        assert scenario.assumptions["exit_multiple"] == 9.0

    def test_scenario_inputs_modification(self):
        """Test that scenario inputs are correctly modified."""
        inputs = self.get_base_lbo_inputs()
        manager = ScenarioManager(inputs)

        scenario = manager.create_scenario(
            name="High Exit Multiple",
            scenario_type=ScenarioType.UPSIDE,
            assumptions={"exit_multiple": 10.0},
        )

        modified_inputs = manager.get_scenario_inputs(scenario.id)

        assert modified_inputs.exit_multiple == 10.0
        assert modified_inputs.revenue_base == inputs.revenue_base  # Unchanged

    def test_base_scenario_protected(self):
        """Test that base scenario cannot be deleted."""
        inputs = self.get_base_lbo_inputs()
        manager = ScenarioManager(inputs)

        result = manager.delete_scenario(manager.base_scenario_id)

        assert result is False

    def test_list_scenarios(self):
        """Test listing all scenarios."""
        inputs = self.get_base_lbo_inputs()
        manager = ScenarioManager(inputs)

        manager.create_scenario("Upside", ScenarioType.UPSIDE, {})
        manager.create_scenario("Downside", ScenarioType.DOWNSIDE, {})

        scenarios = manager.list_scenarios()

        assert len(scenarios) == 3  # Base + 2 new

    def test_create_standard_scenarios(self):
        """Test creating standard upside/downside scenarios."""
        inputs = self.get_base_lbo_inputs()
        manager = ScenarioManager(inputs)

        scenarios = manager.create_standard_scenarios(
            upside_pct=0.20,
            downside_pct=-0.20,
            key_drivers=["exit_multiple"],
        )

        assert len(scenarios) == 2

        upside = [s for s in scenarios if s.scenario_type == ScenarioType.UPSIDE][0]
        assert upside.assumptions["exit_multiple"] == 8.0 * 1.20

    def test_export_import_scenarios(self):
        """Test exporting and importing scenarios."""
        inputs = self.get_base_lbo_inputs()
        manager = ScenarioManager(inputs)

        manager.create_scenario("Test", ScenarioType.CUSTOM, {"exit_multiple": 7.0})

        exported = manager.export_scenarios()

        # Create new manager and import
        new_manager = ScenarioManager(inputs)
        count = new_manager.import_scenarios(exported)

        assert count == 1  # Base case is not imported


class TestIntegrationScenarios:
    """Integration tests combining models with scenarios."""

    def test_three_statement_with_scenarios(self):
        """Test 3-statement model with scenario variations."""
        base_inputs = ThreeStatementInputs(
            base_revenue=1000000.0,
            base_cogs=600000.0,
            projection_years=3,
            revenue_growth_rates=[0.08, 0.07, 0.06],
            cogs_percent_revenue=[0.60, 0.59, 0.58],
        )

        manager = ScenarioManager(base_inputs)

        # Create high growth scenario
        manager.create_scenario(
            name="High Growth",
            scenario_type=ScenarioType.UPSIDE,
            assumptions={"revenue_growth_rates": [0.15, 0.12, 0.10]},
        )

        # Create low growth scenario
        low_growth = manager.create_scenario(
            name="Low Growth",
            scenario_type=ScenarioType.DOWNSIDE,
            assumptions={"revenue_growth_rates": [0.02, 0.02, 0.02]},
        )

        # Get modified inputs
        low_inputs = manager.get_scenario_inputs(low_growth.id)

        assert low_inputs.revenue_growth_rates == [0.02, 0.02, 0.02]

    def test_operating_model_sensitivity(self):
        """Test operating model with sensitivity analysis."""
        inputs = OperatingInputs(
            projection_years=3,
            revenue_streams=[
                RevenueStream(
                    name="Core Product",
                    base_units=1000.0,
                    base_price=100.0,
                )
            ],
        )

        model = OperatingModel(model_id="sens-test", name="Sensitivity Test")
        model.set_inputs(inputs)

        result = model.calculate()
        assert result.success is True
