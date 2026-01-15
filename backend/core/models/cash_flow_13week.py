"""13-Week Cash Flow Model for short-term liquidity forecasting."""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Optional

import numpy as np

from core.engine.base_model import BaseFinancialModel, CalculationResult


@dataclass
class WeeklyCashInput:
    """Weekly cash input for a specific category."""

    week: int
    amount: float
    description: str = ""
    probability: float = 1.0  # For uncertain items
    timing_days: int = 0  # Days offset within week


@dataclass
class RecurringCashItem:
    """Recurring cash inflow or outflow."""

    name: str
    amount: float
    frequency: str = "weekly"  # weekly, biweekly, monthly
    start_week: int = 1
    end_week: int = 13
    day_of_week: int = 1  # 1=Monday, 5=Friday
    is_inflow: bool = True


@dataclass
class CashFlowInputs:
    """Input parameters for 13-week cash flow model."""

    # Starting position
    start_date: datetime = field(default_factory=datetime.now)
    beginning_cash: float = 0.0

    # Credit facilities
    revolver_capacity: float = 0.0
    revolver_drawn: float = 0.0
    revolver_interest_rate: float = 0.05
    minimum_cash_buffer: float = 0.0

    # Operating receipts
    base_weekly_collections: float = 0.0
    collections_growth_rate: float = 0.0
    collection_timing_days: list[int] = field(default_factory=list)  # DSO by week
    scheduled_collections: list[WeeklyCashInput] = field(default_factory=list)

    # Operating disbursements
    base_weekly_payables: float = 0.0
    recurring_disbursements: list[RecurringCashItem] = field(default_factory=list)
    scheduled_disbursements: list[WeeklyCashInput] = field(default_factory=list)

    # Payroll
    payroll_amount: float = 0.0
    payroll_frequency: str = "biweekly"  # weekly, biweekly
    payroll_weeks: list[int] = field(default_factory=list)

    # One-time items
    one_time_receipts: list[WeeklyCashInput] = field(default_factory=list)
    one_time_disbursements: list[WeeklyCashInput] = field(default_factory=list)

    # Debt service
    debt_payments: list[WeeklyCashInput] = field(default_factory=list)
    interest_payments: list[WeeklyCashInput] = field(default_factory=list)

    # Capital items
    capex_schedule: list[WeeklyCashInput] = field(default_factory=list)
    asset_sales: list[WeeklyCashInput] = field(default_factory=list)


@dataclass
class CashFlowOutputs:
    """13-week cash flow model outputs."""

    weeks: list[int] = field(default_factory=list)
    week_ending_dates: list[str] = field(default_factory=list)

    # Receipts detail
    customer_collections: list[float] = field(default_factory=list)
    other_receipts: list[float] = field(default_factory=list)
    total_receipts: list[float] = field(default_factory=list)

    # Disbursements detail
    trade_payables: list[float] = field(default_factory=list)
    payroll: list[float] = field(default_factory=list)
    benefits: list[float] = field(default_factory=list)
    rent: list[float] = field(default_factory=list)
    utilities: list[float] = field(default_factory=list)
    other_operating: list[float] = field(default_factory=list)
    total_operating_disbursements: list[float] = field(default_factory=list)

    # Non-operating
    debt_service: list[float] = field(default_factory=list)
    interest: list[float] = field(default_factory=list)
    capex: list[float] = field(default_factory=list)
    other_non_operating: list[float] = field(default_factory=list)
    total_non_operating: list[float] = field(default_factory=list)

    total_disbursements: list[float] = field(default_factory=list)

    # Cash flow
    net_cash_flow: list[float] = field(default_factory=list)
    cumulative_cash_flow: list[float] = field(default_factory=list)

    # Liquidity
    beginning_cash: list[float] = field(default_factory=list)
    ending_cash: list[float] = field(default_factory=list)
    revolver_draws: list[float] = field(default_factory=list)
    revolver_repayments: list[float] = field(default_factory=list)
    revolver_balance: list[float] = field(default_factory=list)
    available_liquidity: list[float] = field(default_factory=list)

    # Variance analysis (for actuals vs forecast)
    forecast_variance: list[float] = field(default_factory=list)

    # Key metrics
    minimum_cash_week: int = 0
    minimum_cash_amount: float = 0.0
    peak_revolver_usage: float = 0.0
    average_daily_cash_burn: float = 0.0
    weeks_of_runway: float = 0.0


class CashFlow13WeekModel(BaseFinancialModel[CashFlowInputs]):
    """13-Week Cash Flow Model for liquidity forecasting.

    Used for short-term cash management, covenant monitoring,
    and liquidity crisis planning.
    """

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self._inputs: Optional[CashFlowInputs] = None
        self._outputs: Optional[CashFlowOutputs] = None

    def set_inputs(self, inputs: CashFlowInputs) -> None:
        """Set the model inputs."""
        self._inputs = inputs

    def validate_inputs(self) -> tuple[bool, list[str]]:
        """Validate all model inputs."""
        errors = []

        if self._inputs is None:
            return False, ["No inputs provided"]

        inputs = self._inputs

        if inputs.beginning_cash < 0 and inputs.revolver_drawn >= inputs.revolver_capacity:
            errors.append("Beginning cash is negative and no revolver availability")

        if inputs.revolver_drawn > inputs.revolver_capacity:
            errors.append("Revolver drawn exceeds capacity")

        return len(errors) == 0, errors

    def calculate(self) -> CalculationResult:
        """Execute the 13-week cash flow calculation."""
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
        outputs = CashFlowOutputs()

        try:
            # Initialize weeks
            outputs.weeks = list(range(1, 14))
            outputs.week_ending_dates = [
                (inputs.start_date + timedelta(weeks=w)).strftime("%Y-%m-%d")
                for w in range(1, 14)
            ]

            # ========== RECEIPTS ==========
            # Customer collections
            for week in range(1, 14):
                weekly_collections = inputs.base_weekly_collections * (
                    1 + inputs.collections_growth_rate
                ) ** (week - 1)

                # Add scheduled collections
                for item in inputs.scheduled_collections:
                    if item.week == week:
                        weekly_collections += item.amount * item.probability

                outputs.customer_collections.append(weekly_collections)

            # Other receipts
            outputs.other_receipts = [0.0] * 13
            for item in inputs.one_time_receipts:
                if 1 <= item.week <= 13:
                    outputs.other_receipts[item.week - 1] += item.amount * item.probability

            for item in inputs.asset_sales:
                if 1 <= item.week <= 13:
                    outputs.other_receipts[item.week - 1] += item.amount * item.probability

            outputs.total_receipts = [
                coll + other
                for coll, other in zip(outputs.customer_collections, outputs.other_receipts)
            ]

            # ========== OPERATING DISBURSEMENTS ==========
            # Trade payables
            outputs.trade_payables = [inputs.base_weekly_payables] * 13
            for item in inputs.scheduled_disbursements:
                if 1 <= item.week <= 13:
                    outputs.trade_payables[item.week - 1] += item.amount

            # Payroll
            outputs.payroll = [0.0] * 13
            if inputs.payroll_weeks:
                for week in inputs.payroll_weeks:
                    if 1 <= week <= 13:
                        outputs.payroll[week - 1] = inputs.payroll_amount
            elif inputs.payroll_frequency == "biweekly":
                for week in [2, 4, 6, 8, 10, 12]:
                    outputs.payroll[week - 1] = inputs.payroll_amount
            elif inputs.payroll_frequency == "weekly":
                outputs.payroll = [inputs.payroll_amount] * 13

            # Process recurring items
            outputs.benefits = [0.0] * 13
            outputs.rent = [0.0] * 13
            outputs.utilities = [0.0] * 13
            outputs.other_operating = [0.0] * 13

            for item in inputs.recurring_disbursements:
                if not item.is_inflow:
                    weeks_to_apply = self._get_recurring_weeks(item)
                    for week in weeks_to_apply:
                        if 1 <= week <= 13:
                            if "benefit" in item.name.lower():
                                outputs.benefits[week - 1] += item.amount
                            elif "rent" in item.name.lower():
                                outputs.rent[week - 1] += item.amount
                            elif "utilit" in item.name.lower():
                                outputs.utilities[week - 1] += item.amount
                            else:
                                outputs.other_operating[week - 1] += item.amount

            # One-time disbursements
            for item in inputs.one_time_disbursements:
                if 1 <= item.week <= 13:
                    outputs.other_operating[item.week - 1] += item.amount * item.probability

            outputs.total_operating_disbursements = [
                payables + payroll + benefits + rent + util + other
                for payables, payroll, benefits, rent, util, other in
                zip(outputs.trade_payables, outputs.payroll, outputs.benefits,
                    outputs.rent, outputs.utilities, outputs.other_operating)
            ]

            # ========== NON-OPERATING ==========
            # Debt service
            outputs.debt_service = [0.0] * 13
            for item in inputs.debt_payments:
                if 1 <= item.week <= 13:
                    outputs.debt_service[item.week - 1] += item.amount

            # Interest
            outputs.interest = [0.0] * 13
            for item in inputs.interest_payments:
                if 1 <= item.week <= 13:
                    outputs.interest[item.week - 1] += item.amount

            # CapEx
            outputs.capex = [0.0] * 13
            for item in inputs.capex_schedule:
                if 1 <= item.week <= 13:
                    outputs.capex[item.week - 1] += item.amount

            outputs.other_non_operating = [0.0] * 13

            outputs.total_non_operating = [
                debt + interest + capex + other
                for debt, interest, capex, other in
                zip(outputs.debt_service, outputs.interest, outputs.capex, outputs.other_non_operating)
            ]

            outputs.total_disbursements = [
                ops + non_ops
                for ops, non_ops in
                zip(outputs.total_operating_disbursements, outputs.total_non_operating)
            ]

            # ========== CASH FLOW & LIQUIDITY ==========
            outputs.net_cash_flow = [
                receipts - disbursements
                for receipts, disbursements in
                zip(outputs.total_receipts, outputs.total_disbursements)
            ]

            # Cumulative
            cumulative = 0.0
            for ncf in outputs.net_cash_flow:
                cumulative += ncf
                outputs.cumulative_cash_flow.append(cumulative)

            # Liquidity waterfall with revolver management
            cash = inputs.beginning_cash
            revolver_balance = inputs.revolver_drawn
            min_cash = float('inf')
            min_cash_week = 0
            peak_revolver = revolver_balance

            for week in range(13):
                outputs.beginning_cash.append(cash)

                # Net change before revolver
                cash += outputs.net_cash_flow[week]

                # Revolver management
                draw = 0.0
                repay = 0.0

                if cash < inputs.minimum_cash_buffer:
                    # Need to draw on revolver
                    shortfall = inputs.minimum_cash_buffer - cash
                    available = inputs.revolver_capacity - revolver_balance
                    draw = min(shortfall, available)
                    if draw < shortfall:
                        warnings.append(f"Week {week + 1}: Insufficient liquidity, shortfall of ${shortfall - draw:,.0f}")
                    revolver_balance += draw
                    cash += draw
                elif cash > inputs.minimum_cash_buffer * 2 and revolver_balance > 0:
                    # Excess cash - repay revolver
                    excess = cash - inputs.minimum_cash_buffer * 2
                    repay = min(excess, revolver_balance)
                    revolver_balance -= repay
                    cash -= repay

                outputs.revolver_draws.append(draw)
                outputs.revolver_repayments.append(repay)
                outputs.revolver_balance.append(revolver_balance)
                outputs.ending_cash.append(cash)
                outputs.available_liquidity.append(
                    cash + (inputs.revolver_capacity - revolver_balance)
                )

                # Track metrics
                if cash < min_cash:
                    min_cash = cash
                    min_cash_week = week + 1
                if revolver_balance > peak_revolver:
                    peak_revolver = revolver_balance

            outputs.minimum_cash_week = min_cash_week
            outputs.minimum_cash_amount = min_cash
            outputs.peak_revolver_usage = peak_revolver

            # Calculate burn rate
            total_burn = sum(outputs.total_disbursements) - sum(outputs.total_receipts)
            outputs.average_daily_cash_burn = total_burn / (13 * 7)

            # Runway
            if outputs.average_daily_cash_burn > 0:
                final_liquidity = outputs.available_liquidity[-1]
                outputs.weeks_of_runway = final_liquidity / (outputs.average_daily_cash_burn * 7)
            else:
                outputs.weeks_of_runway = float('inf')

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

    def _get_recurring_weeks(self, item: RecurringCashItem) -> list[int]:
        """Get weeks when a recurring item occurs."""
        weeks = []

        if item.frequency == "weekly":
            weeks = list(range(item.start_week, min(item.end_week + 1, 14)))
        elif item.frequency == "biweekly":
            weeks = list(range(item.start_week, min(item.end_week + 1, 14), 2))
        elif item.frequency == "monthly":
            # Assume monthly = every 4 weeks
            weeks = list(range(item.start_week, min(item.end_week + 1, 14), 4))

        return weeks

    def _outputs_to_dict(self, outputs: CashFlowOutputs) -> dict[str, Any]:
        """Convert outputs to dictionary."""
        return {
            "weeks": outputs.weeks,
            "week_ending_dates": outputs.week_ending_dates,
            "receipts": {
                "customer_collections": outputs.customer_collections,
                "other_receipts": outputs.other_receipts,
                "total": outputs.total_receipts,
            },
            "operating_disbursements": {
                "trade_payables": outputs.trade_payables,
                "payroll": outputs.payroll,
                "benefits": outputs.benefits,
                "rent": outputs.rent,
                "utilities": outputs.utilities,
                "other": outputs.other_operating,
                "total": outputs.total_operating_disbursements,
            },
            "non_operating": {
                "debt_service": outputs.debt_service,
                "interest": outputs.interest,
                "capex": outputs.capex,
                "other": outputs.other_non_operating,
                "total": outputs.total_non_operating,
            },
            "total_disbursements": outputs.total_disbursements,
            "cash_flow": {
                "net": outputs.net_cash_flow,
                "cumulative": outputs.cumulative_cash_flow,
            },
            "liquidity": {
                "beginning_cash": outputs.beginning_cash,
                "ending_cash": outputs.ending_cash,
                "revolver_draws": outputs.revolver_draws,
                "revolver_repayments": outputs.revolver_repayments,
                "revolver_balance": outputs.revolver_balance,
                "available_liquidity": outputs.available_liquidity,
            },
            "metrics": {
                "minimum_cash_week": outputs.minimum_cash_week,
                "minimum_cash_amount": outputs.minimum_cash_amount,
                "peak_revolver_usage": outputs.peak_revolver_usage,
                "average_daily_cash_burn": outputs.average_daily_cash_burn,
                "weeks_of_runway": outputs.weeks_of_runway,
            },
        }

    def get_key_outputs(self) -> dict[str, Any]:
        """Get key output metrics."""
        if self._outputs is None:
            return {}

        return {
            "Ending Cash (Week 13)": f"${self._outputs.ending_cash[-1]:,.0f}" if self._outputs.ending_cash else "N/A",
            "Minimum Cash": f"${self._outputs.minimum_cash_amount:,.0f} (Week {self._outputs.minimum_cash_week})",
            "Peak Revolver": f"${self._outputs.peak_revolver_usage:,.0f}",
            "Total Receipts": f"${sum(self._outputs.total_receipts):,.0f}",
            "Total Disbursements": f"${sum(self._outputs.total_disbursements):,.0f}",
            "Runway": f"{self._outputs.weeks_of_runway:.1f} weeks" if self._outputs.weeks_of_runway < float('inf') else "Cash positive",
        }

    def get_weekly_summary(self) -> list[dict[str, Any]]:
        """Get a week-by-week summary for display."""
        if self._outputs is None:
            return []

        summary = []
        for i in range(13):
            summary.append({
                "week": i + 1,
                "week_ending": self._outputs.week_ending_dates[i],
                "beginning_cash": self._outputs.beginning_cash[i],
                "total_receipts": self._outputs.total_receipts[i],
                "total_disbursements": self._outputs.total_disbursements[i],
                "net_cash_flow": self._outputs.net_cash_flow[i],
                "ending_cash": self._outputs.ending_cash[i],
                "revolver_balance": self._outputs.revolver_balance[i],
                "available_liquidity": self._outputs.available_liquidity[i],
            })

        return summary
