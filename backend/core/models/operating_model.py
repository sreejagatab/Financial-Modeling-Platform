"""Operating Model for detailed revenue and cost projections."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional

import numpy as np

from core.engine.base_model import BaseFinancialModel, CalculationResult


@dataclass
class RevenueStream:
    """A single revenue stream/product line."""

    name: str
    base_units: float = 0.0
    base_price: float = 0.0
    unit_growth_rates: list[float] = field(default_factory=list)
    price_growth_rates: list[float] = field(default_factory=list)
    seasonality: list[float] = field(default_factory=list)  # Monthly factors


@dataclass
class CostDriver:
    """A cost driver with fixed/variable components."""

    name: str
    fixed_amount: float = 0.0
    variable_rate: float = 0.0  # Per unit or % of revenue
    variable_basis: str = "revenue"  # "revenue", "units", "custom"
    inflation_rate: float = 0.02
    step_function: bool = False
    step_threshold: float = 0.0
    step_increase: float = 0.0


@dataclass
class OperatingInputs:
    """Input parameters for an operating model."""

    company_name: str = ""
    projection_years: int = 5
    monthly_detail: bool = False

    # Revenue streams
    revenue_streams: list[RevenueStream] = field(default_factory=list)

    # Cost drivers
    cost_of_goods: list[CostDriver] = field(default_factory=list)
    operating_expenses: list[CostDriver] = field(default_factory=list)

    # Headcount
    base_headcount: int = 0
    revenue_per_employee: float = 0.0
    avg_salary: float = 0.0
    benefits_rate: float = 0.25
    hiring_lead_time_months: int = 3

    # Unit economics (optional)
    customer_acquisition_cost: float = 0.0
    customer_lifetime_value: float = 0.0
    monthly_churn_rate: float = 0.0
    average_revenue_per_user: float = 0.0

    # Capacity constraints
    max_capacity_units: float = 0.0
    capacity_utilization_target: float = 0.80
    capacity_expansion_cost: float = 0.0


@dataclass
class OperatingOutputs:
    """Operating model outputs."""

    years: list[int] = field(default_factory=list)

    # Revenue breakdown
    revenue_by_stream: dict[str, list[float]] = field(default_factory=dict)
    total_revenue: list[float] = field(default_factory=list)
    revenue_growth: list[float] = field(default_factory=list)

    # Volume metrics
    units_by_stream: dict[str, list[float]] = field(default_factory=dict)
    total_units: list[float] = field(default_factory=list)
    average_price: list[float] = field(default_factory=list)

    # Cost breakdown
    cogs_by_driver: dict[str, list[float]] = field(default_factory=dict)
    total_cogs: list[float] = field(default_factory=list)
    cogs_percent: list[float] = field(default_factory=list)

    opex_by_driver: dict[str, list[float]] = field(default_factory=dict)
    total_opex: list[float] = field(default_factory=list)
    opex_percent: list[float] = field(default_factory=list)

    # Profitability
    gross_profit: list[float] = field(default_factory=list)
    gross_margin: list[float] = field(default_factory=list)
    operating_profit: list[float] = field(default_factory=list)
    operating_margin: list[float] = field(default_factory=list)

    # Headcount
    headcount: list[int] = field(default_factory=list)
    payroll_cost: list[float] = field(default_factory=list)
    revenue_per_employee: list[float] = field(default_factory=list)

    # Unit economics
    customer_count: list[float] = field(default_factory=list)
    cac_payback_months: list[float] = field(default_factory=list)
    ltv_cac_ratio: list[float] = field(default_factory=list)

    # Capacity
    capacity_utilization: list[float] = field(default_factory=list)
    capacity_additions: list[float] = field(default_factory=list)


class OperatingModel(BaseFinancialModel[OperatingInputs]):
    """Operating model for detailed revenue and cost projections.

    Provides bottom-up revenue build from product lines/segments,
    detailed cost drivers, and unit economics analysis.
    """

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self._inputs: Optional[OperatingInputs] = None
        self._outputs: Optional[OperatingOutputs] = None

    def set_inputs(self, inputs: OperatingInputs) -> None:
        """Set the model inputs."""
        self._inputs = inputs

    def validate_inputs(self) -> tuple[bool, list[str]]:
        """Validate all model inputs."""
        errors = []

        if self._inputs is None:
            return False, ["No inputs provided"]

        inputs = self._inputs

        if inputs.projection_years <= 0:
            errors.append("Projection years must be positive")

        if not inputs.revenue_streams:
            errors.append("At least one revenue stream is required")

        for stream in inputs.revenue_streams:
            if stream.base_units < 0:
                errors.append(f"Revenue stream '{stream.name}' has negative base units")
            if stream.base_price < 0:
                errors.append(f"Revenue stream '{stream.name}' has negative base price")

        return len(errors) == 0, errors

    def calculate(self) -> CalculationResult:
        """Execute the operating model calculation."""
        start_time = datetime.now()
        errors = []
        warnings = []

        if self._inputs is None:
            return CalculationResult(
                success=False,
                outputs={},
                errors=["No inputs provided"],
            )

        is_valid, validation_errors = self.validate_inputs()
        if not is_valid:
            return CalculationResult(
                success=False,
                outputs={},
                errors=validation_errors,
            )

        inputs = self._inputs
        outputs = OperatingOutputs()

        try:
            n = inputs.projection_years
            outputs.years = list(range(1, n + 1))

            # ========== REVENUE BUILD ==========
            for stream in inputs.revenue_streams:
                units = [stream.base_units]
                prices = [stream.base_price]

                # Extend growth rates if needed
                unit_growth = stream.unit_growth_rates or [0.0] * n
                price_growth = stream.price_growth_rates or [0.0] * n

                while len(unit_growth) < n:
                    unit_growth.append(unit_growth[-1] if unit_growth else 0.0)
                while len(price_growth) < n:
                    price_growth.append(price_growth[-1] if price_growth else 0.0)

                for i in range(n):
                    units.append(units[-1] * (1 + unit_growth[i]))
                    prices.append(prices[-1] * (1 + price_growth[i]))

                stream_units = units[1:]
                stream_prices = prices[1:]
                stream_revenue = [u * p for u, p in zip(stream_units, stream_prices)]

                outputs.units_by_stream[stream.name] = stream_units
                outputs.revenue_by_stream[stream.name] = stream_revenue

            # Aggregate revenue
            outputs.total_units = [
                sum(outputs.units_by_stream[s.name][i] for s in inputs.revenue_streams)
                for i in range(n)
            ]
            outputs.total_revenue = [
                sum(outputs.revenue_by_stream[s.name][i] for s in inputs.revenue_streams)
                for i in range(n)
            ]
            outputs.average_price = [
                rev / units if units else 0
                for rev, units in zip(outputs.total_revenue, outputs.total_units)
            ]

            # Revenue growth
            prev_rev = sum(s.base_units * s.base_price for s in inputs.revenue_streams)
            for rev in outputs.total_revenue:
                growth = (rev - prev_rev) / prev_rev if prev_rev else 0
                outputs.revenue_growth.append(growth)
                prev_rev = rev

            # ========== COST OF GOODS SOLD ==========
            for driver in inputs.cost_of_goods:
                driver_cost = self._calculate_driver_cost(driver, outputs, n)
                outputs.cogs_by_driver[driver.name] = driver_cost

            outputs.total_cogs = [
                sum(outputs.cogs_by_driver[d.name][i] for d in inputs.cost_of_goods)
                for i in range(n)
            ]
            outputs.cogs_percent = [
                cogs / rev if rev else 0
                for cogs, rev in zip(outputs.total_cogs, outputs.total_revenue)
            ]

            # ========== OPERATING EXPENSES ==========
            for driver in inputs.operating_expenses:
                driver_cost = self._calculate_driver_cost(driver, outputs, n)
                outputs.opex_by_driver[driver.name] = driver_cost

            outputs.total_opex = [
                sum(outputs.opex_by_driver[d.name][i] for d in inputs.operating_expenses)
                for i in range(n)
            ]
            outputs.opex_percent = [
                opex / rev if rev else 0
                for opex, rev in zip(outputs.total_opex, outputs.total_revenue)
            ]

            # ========== PROFITABILITY ==========
            outputs.gross_profit = [
                rev - cogs
                for rev, cogs in zip(outputs.total_revenue, outputs.total_cogs)
            ]
            outputs.gross_margin = [
                gp / rev if rev else 0
                for gp, rev in zip(outputs.gross_profit, outputs.total_revenue)
            ]

            outputs.operating_profit = [
                gp - opex
                for gp, opex in zip(outputs.gross_profit, outputs.total_opex)
            ]
            outputs.operating_margin = [
                op / rev if rev else 0
                for op, rev in zip(outputs.operating_profit, outputs.total_revenue)
            ]

            # ========== HEADCOUNT ==========
            if inputs.revenue_per_employee > 0:
                outputs.headcount = [
                    max(inputs.base_headcount, int(np.ceil(rev / inputs.revenue_per_employee)))
                    for rev in outputs.total_revenue
                ]
            else:
                outputs.headcount = [inputs.base_headcount] * n

            outputs.payroll_cost = [
                hc * inputs.avg_salary * (1 + inputs.benefits_rate)
                for hc in outputs.headcount
            ]
            outputs.revenue_per_employee = [
                rev / hc if hc else 0
                for rev, hc in zip(outputs.total_revenue, outputs.headcount)
            ]

            # ========== UNIT ECONOMICS ==========
            if inputs.average_revenue_per_user > 0:
                # Customer cohort model
                customers = [outputs.total_revenue[0] / inputs.average_revenue_per_user]
                for i in range(1, n):
                    # Existing customers after churn
                    retained = customers[-1] * (1 - inputs.monthly_churn_rate * 12)
                    # New customers needed
                    new_customers = (outputs.total_revenue[i] / inputs.average_revenue_per_user) - retained
                    new_customers = max(0, new_customers)
                    customers.append(retained + new_customers)

                outputs.customer_count = customers

                if inputs.customer_acquisition_cost > 0:
                    outputs.cac_payback_months = [
                        inputs.customer_acquisition_cost / (inputs.average_revenue_per_user - 0)
                        if inputs.average_revenue_per_user > 0 else 0
                        for _ in range(n)
                    ]

                if inputs.customer_lifetime_value > 0 and inputs.customer_acquisition_cost > 0:
                    outputs.ltv_cac_ratio = [
                        inputs.customer_lifetime_value / inputs.customer_acquisition_cost
                    ] * n

            # ========== CAPACITY ==========
            if inputs.max_capacity_units > 0:
                current_capacity = inputs.max_capacity_units
                for i, units in enumerate(outputs.total_units):
                    utilization = units / current_capacity if current_capacity else 0
                    outputs.capacity_utilization.append(utilization)

                    # Check if expansion needed
                    if utilization > inputs.capacity_utilization_target:
                        expansion = current_capacity * 0.5  # 50% expansion
                        outputs.capacity_additions.append(expansion)
                        current_capacity += expansion
                    else:
                        outputs.capacity_additions.append(0)

        except Exception as e:
            errors.append(f"Calculation error: {str(e)}")

        self._outputs = outputs
        calc_time = (datetime.now() - start_time).total_seconds() * 1000

        return CalculationResult(
            success=len(errors) == 0,
            outputs=self._outputs_to_dict(outputs),
            errors=errors,
            warnings=warnings,
            calculation_time_ms=calc_time,
        )

    def _calculate_driver_cost(
        self,
        driver: CostDriver,
        outputs: OperatingOutputs,
        n: int
    ) -> list[float]:
        """Calculate cost for a single driver."""
        costs = []

        for i in range(n):
            fixed = driver.fixed_amount * (1 + driver.inflation_rate) ** i

            if driver.variable_basis == "revenue":
                variable = outputs.total_revenue[i] * driver.variable_rate
            elif driver.variable_basis == "units":
                variable = outputs.total_units[i] * driver.variable_rate
            else:
                variable = 0

            total = fixed + variable

            # Step function (e.g., add cost when revenue exceeds threshold)
            if driver.step_function and outputs.total_revenue[i] > driver.step_threshold:
                total += driver.step_increase

            costs.append(total)

        return costs

    def _outputs_to_dict(self, outputs: OperatingOutputs) -> dict[str, Any]:
        """Convert outputs to dictionary."""
        return {
            "years": outputs.years,
            "revenue": {
                "by_stream": outputs.revenue_by_stream,
                "total": outputs.total_revenue,
                "growth": outputs.revenue_growth,
                "units_by_stream": outputs.units_by_stream,
                "total_units": outputs.total_units,
                "average_price": outputs.average_price,
            },
            "cogs": {
                "by_driver": outputs.cogs_by_driver,
                "total": outputs.total_cogs,
                "percent_of_revenue": outputs.cogs_percent,
            },
            "opex": {
                "by_driver": outputs.opex_by_driver,
                "total": outputs.total_opex,
                "percent_of_revenue": outputs.opex_percent,
            },
            "profitability": {
                "gross_profit": outputs.gross_profit,
                "gross_margin": outputs.gross_margin,
                "operating_profit": outputs.operating_profit,
                "operating_margin": outputs.operating_margin,
            },
            "headcount": {
                "employees": outputs.headcount,
                "payroll_cost": outputs.payroll_cost,
                "revenue_per_employee": outputs.revenue_per_employee,
            },
            "unit_economics": {
                "customer_count": outputs.customer_count,
                "cac_payback_months": outputs.cac_payback_months,
                "ltv_cac_ratio": outputs.ltv_cac_ratio,
            },
            "capacity": {
                "utilization": outputs.capacity_utilization,
                "additions": outputs.capacity_additions,
            },
        }

    def get_key_outputs(self) -> dict[str, Any]:
        """Get key output metrics."""
        if self._outputs is None:
            return {}

        return {
            "Final Year Revenue": f"${self._outputs.total_revenue[-1]:,.0f}" if self._outputs.total_revenue else "N/A",
            "Revenue CAGR": f"{self._calculate_cagr():.1%}",
            "Avg Gross Margin": f"{np.mean(self._outputs.gross_margin):.1%}" if self._outputs.gross_margin else "N/A",
            "Avg Operating Margin": f"{np.mean(self._outputs.operating_margin):.1%}" if self._outputs.operating_margin else "N/A",
            "Final Headcount": f"{self._outputs.headcount[-1]:,}" if self._outputs.headcount else "N/A",
        }

    def _calculate_cagr(self) -> float:
        """Calculate revenue CAGR."""
        if not self._outputs or not self._outputs.total_revenue:
            return 0.0

        if len(self._outputs.total_revenue) < 2:
            return 0.0

        initial = self._outputs.total_revenue[0]
        final = self._outputs.total_revenue[-1]
        years = len(self._outputs.total_revenue)

        if initial <= 0:
            return 0.0

        return (final / initial) ** (1 / years) - 1
