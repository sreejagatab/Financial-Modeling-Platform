"""LBO (Leveraged Buyout) financial model implementation."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional

import numpy as np
import numpy_financial as npf

from core.engine.base_model import (
    BaseFinancialModel,
    CalculationResult,
    FinancialCalculations,
)


@dataclass
class LBOInputs:
    """Input parameters for an LBO model."""

    # Transaction inputs
    enterprise_value: float
    equity_purchase_price: float
    existing_debt: float = 0.0
    transaction_fees: float = 0.0
    financing_fees: float = 0.0

    # Debt structure
    senior_debt_amount: float = 0.0
    senior_debt_rate: float = 0.05
    senior_debt_term_years: int = 7
    senior_debt_amortization: float = 0.0  # Annual mandatory amortization

    subordinated_debt_amount: float = 0.0
    subordinated_debt_rate: float = 0.10
    subordinated_debt_term_years: int = 8

    # Mezzanine/PIK
    mezzanine_debt_amount: float = 0.0
    mezzanine_cash_rate: float = 0.08
    mezzanine_pik_rate: float = 0.04

    # Equity
    sponsor_equity: float = 0.0
    management_rollover: float = 0.0

    # Operating assumptions
    projection_years: int = 5
    revenue_base: float = 0.0
    revenue_growth_rates: list[float] = field(default_factory=list)
    ebitda_margins: list[float] = field(default_factory=list)
    capex_percent_revenue: float = 0.03
    nwc_percent_revenue: float = 0.10
    tax_rate: float = 0.25
    depreciation_percent_revenue: float = 0.02

    # Exit assumptions
    exit_year: int = 5
    exit_multiple: float = 8.0  # EV/EBITDA


@dataclass
class LBOOutputs:
    """Output metrics from an LBO model."""

    # Returns
    irr: float = 0.0
    moic: float = 0.0
    total_equity_invested: float = 0.0
    total_equity_returned: float = 0.0

    # Sources and uses
    sources: dict[str, float] = field(default_factory=dict)
    uses: dict[str, float] = field(default_factory=dict)

    # Entry metrics
    entry_ev_ebitda: float = 0.0
    entry_debt_ebitda: float = 0.0
    equity_contribution_percent: float = 0.0

    # Exit metrics
    exit_ev: float = 0.0
    exit_equity_value: float = 0.0
    exit_debt_balance: float = 0.0

    # Projections
    years: list[int] = field(default_factory=list)
    revenues: list[float] = field(default_factory=list)
    ebitda: list[float] = field(default_factory=list)
    free_cash_flow: list[float] = field(default_factory=list)
    debt_balances: list[float] = field(default_factory=list)

    # Cash flow to equity
    equity_cash_flows: list[float] = field(default_factory=list)


class LBOModel(BaseFinancialModel[LBOInputs]):
    """Leveraged Buyout financial model.

    Calculates IRR, MOIC, and builds full projections for an LBO transaction.
    """

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self._inputs: Optional[LBOInputs] = None
        self._outputs: Optional[LBOOutputs] = None

    def set_inputs(self, inputs: LBOInputs) -> None:
        """Set the model inputs."""
        self._inputs = inputs

    def validate_inputs(self) -> tuple[bool, list[str]]:
        """Validate all LBO model inputs."""
        errors = []

        if self._inputs is None:
            return False, ["No inputs provided"]

        inputs = self._inputs

        # Required positive values
        if inputs.enterprise_value <= 0:
            errors.append("Enterprise value must be positive")

        if inputs.equity_purchase_price <= 0:
            errors.append("Equity purchase price must be positive")

        if inputs.projection_years <= 0:
            errors.append("Projection years must be positive")

        if inputs.exit_year > inputs.projection_years:
            errors.append("Exit year cannot exceed projection years")

        # Revenue and margin arrays must match projection years
        if len(inputs.revenue_growth_rates) < inputs.projection_years:
            # Extend with last value or zeros
            while len(inputs.revenue_growth_rates) < inputs.projection_years:
                last_rate = (
                    inputs.revenue_growth_rates[-1]
                    if inputs.revenue_growth_rates
                    else 0.0
                )
                inputs.revenue_growth_rates.append(last_rate)

        if len(inputs.ebitda_margins) < inputs.projection_years:
            while len(inputs.ebitda_margins) < inputs.projection_years:
                last_margin = (
                    inputs.ebitda_margins[-1] if inputs.ebitda_margins else 0.15
                )
                inputs.ebitda_margins.append(last_margin)

        # Debt rate validations
        if inputs.senior_debt_rate < 0 or inputs.senior_debt_rate > 1:
            errors.append("Senior debt rate must be between 0 and 1")

        # Sources must equal uses (approximately)
        total_sources = (
            inputs.senior_debt_amount
            + inputs.subordinated_debt_amount
            + inputs.mezzanine_debt_amount
            + inputs.sponsor_equity
            + inputs.management_rollover
        )
        total_uses = (
            inputs.equity_purchase_price
            + inputs.existing_debt
            + inputs.transaction_fees
            + inputs.financing_fees
        )

        if abs(total_sources - total_uses) > 0.01 * total_uses:
            errors.append(
                f"Sources (${total_sources:,.0f}) must equal uses (${total_uses:,.0f})"
            )

        return len(errors) == 0, errors

    def calculate(self) -> CalculationResult:
        """Execute the LBO model calculation."""
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
        outputs = LBOOutputs()

        try:
            # Calculate sources and uses
            outputs.sources = {
                "Senior Debt": inputs.senior_debt_amount,
                "Subordinated Debt": inputs.subordinated_debt_amount,
                "Mezzanine Debt": inputs.mezzanine_debt_amount,
                "Sponsor Equity": inputs.sponsor_equity,
                "Management Rollover": inputs.management_rollover,
            }

            outputs.uses = {
                "Equity Purchase Price": inputs.equity_purchase_price,
                "Refinance Existing Debt": inputs.existing_debt,
                "Transaction Fees": inputs.transaction_fees,
                "Financing Fees": inputs.financing_fees,
            }

            # Total equity invested
            outputs.total_equity_invested = (
                inputs.sponsor_equity + inputs.management_rollover
            )

            # Build projections
            outputs.years = list(range(1, inputs.projection_years + 1))

            # Revenue projections
            revenues = [inputs.revenue_base]
            for i, growth in enumerate(inputs.revenue_growth_rates):
                revenues.append(revenues[-1] * (1 + growth))
            outputs.revenues = revenues[1 : inputs.projection_years + 1]

            # EBITDA projections
            outputs.ebitda = [
                rev * margin
                for rev, margin in zip(outputs.revenues, inputs.ebitda_margins)
            ]

            # Entry metrics
            entry_ebitda = inputs.revenue_base * (
                inputs.ebitda_margins[0] if inputs.ebitda_margins else 0.15
            )
            if entry_ebitda > 0:
                outputs.entry_ev_ebitda = inputs.enterprise_value / entry_ebitda
                total_debt = (
                    inputs.senior_debt_amount
                    + inputs.subordinated_debt_amount
                    + inputs.mezzanine_debt_amount
                )
                outputs.entry_debt_ebitda = total_debt / entry_ebitda

            total_sources = sum(outputs.sources.values())
            if total_sources > 0:
                outputs.equity_contribution_percent = (
                    outputs.total_equity_invested / total_sources
                )

            # Calculate free cash flow and debt schedule
            senior_balance = inputs.senior_debt_amount
            sub_balance = inputs.subordinated_debt_amount
            mezz_balance = inputs.mezzanine_debt_amount

            debt_balances = []
            free_cash_flows = []
            equity_cash_flows = [-outputs.total_equity_invested]  # Initial investment

            for i, year in enumerate(outputs.years):
                ebitda = outputs.ebitda[i]
                revenue = outputs.revenues[i]

                # D&A
                depreciation = revenue * inputs.depreciation_percent_revenue

                # EBIT
                ebit = ebitda - depreciation

                # Interest expense
                senior_interest = senior_balance * inputs.senior_debt_rate
                sub_interest = sub_balance * inputs.subordinated_debt_rate
                mezz_cash_interest = mezz_balance * inputs.mezzanine_cash_rate
                mezz_pik = mezz_balance * inputs.mezzanine_pik_rate
                total_interest = senior_interest + sub_interest + mezz_cash_interest

                # Pre-tax income
                ebt = ebit - total_interest

                # Taxes
                taxes = max(0, ebt * inputs.tax_rate)

                # Net income
                net_income = ebt - taxes

                # CapEx and NWC
                capex = revenue * inputs.capex_percent_revenue
                delta_nwc = (
                    (revenue - (revenues[i] if i > 0 else inputs.revenue_base))
                    * inputs.nwc_percent_revenue
                )

                # Free cash flow
                fcf = net_income + depreciation - capex - delta_nwc
                free_cash_flows.append(fcf)

                # Debt paydown
                senior_paydown = min(
                    max(0, fcf - inputs.senior_debt_amortization),
                    senior_balance,
                )
                mandatory_amort = min(inputs.senior_debt_amortization, senior_balance)
                total_paydown = mandatory_amort + max(
                    0, (fcf - mandatory_amort) * 0.75
                )  # Cash sweep
                total_paydown = min(total_paydown, senior_balance)

                senior_balance -= total_paydown

                # PIK accrual
                mezz_balance += mezz_pik

                total_debt = senior_balance + sub_balance + mezz_balance
                debt_balances.append(total_debt)

            outputs.free_cash_flow = free_cash_flows
            outputs.debt_balances = debt_balances

            # Exit calculation
            exit_ebitda = outputs.ebitda[inputs.exit_year - 1]
            outputs.exit_ev = exit_ebitda * inputs.exit_multiple
            outputs.exit_debt_balance = debt_balances[inputs.exit_year - 1]
            outputs.exit_equity_value = outputs.exit_ev - outputs.exit_debt_balance

            outputs.total_equity_returned = outputs.exit_equity_value

            # Add exit proceeds to equity cash flows
            for i in range(inputs.exit_year - 1):
                equity_cash_flows.append(0)  # No intermediate distributions
            equity_cash_flows.append(outputs.exit_equity_value)

            outputs.equity_cash_flows = equity_cash_flows

            # Calculate IRR and MOIC
            outputs.irr = FinancialCalculations.irr(equity_cash_flows)
            outputs.moic = FinancialCalculations.moic(
                outputs.total_equity_returned, outputs.total_equity_invested
            )

            # Handle edge cases
            if np.isnan(outputs.irr):
                warnings.append("IRR calculation did not converge")
                outputs.irr = 0.0

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

    def _outputs_to_dict(self, outputs: LBOOutputs) -> dict[str, Any]:
        """Convert outputs to dictionary for serialization."""
        return {
            "irr": outputs.irr,
            "moic": outputs.moic,
            "total_equity_invested": outputs.total_equity_invested,
            "total_equity_returned": outputs.total_equity_returned,
            "sources": outputs.sources,
            "uses": outputs.uses,
            "entry_ev_ebitda": outputs.entry_ev_ebitda,
            "entry_debt_ebitda": outputs.entry_debt_ebitda,
            "equity_contribution_percent": outputs.equity_contribution_percent,
            "exit_ev": outputs.exit_ev,
            "exit_equity_value": outputs.exit_equity_value,
            "exit_debt_balance": outputs.exit_debt_balance,
            "years": outputs.years,
            "revenues": outputs.revenues,
            "ebitda": outputs.ebitda,
            "free_cash_flow": outputs.free_cash_flow,
            "debt_balances": outputs.debt_balances,
            "equity_cash_flows": outputs.equity_cash_flows,
        }

    def get_key_outputs(self) -> dict[str, Any]:
        """Get key output metrics for LBO model."""
        if self._outputs is None:
            return {}

        return {
            "IRR": f"{self._outputs.irr:.1%}",
            "MOIC": f"{self._outputs.moic:.2f}x",
            "Entry EV/EBITDA": f"{self._outputs.entry_ev_ebitda:.1f}x",
            "Exit EV/EBITDA": f"{self._inputs.exit_multiple:.1f}x"
            if self._inputs
            else "N/A",
            "Equity Check Size": f"${self._outputs.total_equity_invested:,.0f}",
            "Exit Equity Value": f"${self._outputs.exit_equity_value:,.0f}",
        }

    def run_returns_sensitivity(
        self, exit_multiples: list[float], exit_years: list[int]
    ) -> dict[str, list[list[float]]]:
        """Run sensitivity on exit multiple and exit year.

        Args:
            exit_multiples: List of exit multiples to test
            exit_years: List of exit years to test

        Returns:
            Dictionary with IRR and MOIC matrices
        """
        if self._inputs is None:
            return {"irr": [], "moic": []}

        irr_matrix = []
        moic_matrix = []

        original_multiple = self._inputs.exit_multiple
        original_year = self._inputs.exit_year

        for multiple in exit_multiples:
            irr_row = []
            moic_row = []

            for year in exit_years:
                self._inputs.exit_multiple = multiple
                self._inputs.exit_year = year
                result = self.calculate()

                if result.success:
                    irr_row.append(result.outputs.get("irr", 0))
                    moic_row.append(result.outputs.get("moic", 0))
                else:
                    irr_row.append(np.nan)
                    moic_row.append(np.nan)

            irr_matrix.append(irr_row)
            moic_matrix.append(moic_row)

        # Restore original values
        self._inputs.exit_multiple = original_multiple
        self._inputs.exit_year = original_year

        return {"irr": irr_matrix, "moic": moic_matrix}
