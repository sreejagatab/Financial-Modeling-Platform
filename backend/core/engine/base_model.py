"""Base financial model abstract class."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Generic, Optional, TypeVar

import numpy as np
import numpy_financial as npf


@dataclass
class CalculationResult:
    """Result of a financial model calculation."""

    success: bool
    outputs: dict[str, Any]
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    calculation_time_ms: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class SensitivityResult:
    """Result of sensitivity analysis."""

    input_name: str
    input_values: list[float]
    output_name: str
    output_values: list[float]
    base_input: float
    base_output: float


@dataclass
class ScenarioComparison:
    """Comparison across multiple scenarios."""

    scenarios: list[str]
    metrics: dict[str, list[float]]  # metric_name -> values per scenario


T = TypeVar("T")


class BaseFinancialModel(ABC, Generic[T]):
    """Abstract base class for all financial models.

    Provides common functionality for financial calculations including:
    - Input validation
    - Calculation orchestration
    - Sensitivity analysis
    - Scenario management
    """

    def __init__(self, model_id: str, name: str):
        self.model_id = model_id
        self.name = name
        self.inputs: dict[str, Any] = {}
        self.outputs: dict[str, Any] = {}
        self._calculation_graph: Optional["CalculationGraph"] = None

    @abstractmethod
    def validate_inputs(self) -> tuple[bool, list[str]]:
        """Validate all model inputs.

        Returns:
            Tuple of (is_valid, list of error messages)
        """
        pass

    @abstractmethod
    def calculate(self) -> CalculationResult:
        """Execute the main model calculation.

        Returns:
            CalculationResult with outputs and any errors/warnings
        """
        pass

    @abstractmethod
    def get_key_outputs(self) -> dict[str, Any]:
        """Get the key output metrics for this model type.

        Returns:
            Dictionary of output name -> value
        """
        pass

    def run_sensitivity(
        self,
        input_name: str,
        output_name: str,
        variation_percent: float = 20.0,
        steps: int = 11,
    ) -> SensitivityResult:
        """Run sensitivity analysis on a single input.

        Args:
            input_name: Name of the input to vary
            output_name: Name of the output to measure
            variation_percent: Percent variation (+/-)
            steps: Number of steps in the sensitivity

        Returns:
            SensitivityResult with input and output values
        """
        if input_name not in self.inputs:
            raise ValueError(f"Input '{input_name}' not found in model")

        base_value = self.inputs[input_name]
        if not isinstance(base_value, (int, float)):
            raise ValueError(f"Input '{input_name}' must be numeric for sensitivity")

        # Generate input range
        min_val = base_value * (1 - variation_percent / 100)
        max_val = base_value * (1 + variation_percent / 100)
        input_values = np.linspace(min_val, max_val, steps).tolist()

        # Calculate outputs for each input value
        output_values = []
        original_value = self.inputs[input_name]

        for val in input_values:
            self.inputs[input_name] = val
            result = self.calculate()
            if result.success and output_name in result.outputs:
                output_values.append(result.outputs[output_name])
            else:
                output_values.append(np.nan)

        # Restore original value
        self.inputs[input_name] = original_value

        # Get base output
        result = self.calculate()
        base_output = result.outputs.get(output_name, np.nan)

        return SensitivityResult(
            input_name=input_name,
            input_values=input_values,
            output_name=output_name,
            output_values=output_values,
            base_input=base_value,
            base_output=base_output,
        )

    def run_two_way_sensitivity(
        self,
        input1_name: str,
        input2_name: str,
        output_name: str,
        variation_percent: float = 20.0,
        steps: int = 11,
    ) -> np.ndarray:
        """Run two-way sensitivity analysis.

        Args:
            input1_name: First input to vary (rows)
            input2_name: Second input to vary (columns)
            output_name: Output to measure
            variation_percent: Percent variation (+/-)
            steps: Number of steps per dimension

        Returns:
            2D numpy array of output values
        """
        base1 = self.inputs[input1_name]
        base2 = self.inputs[input2_name]

        vals1 = np.linspace(
            base1 * (1 - variation_percent / 100),
            base1 * (1 + variation_percent / 100),
            steps,
        )
        vals2 = np.linspace(
            base2 * (1 - variation_percent / 100),
            base2 * (1 + variation_percent / 100),
            steps,
        )

        result_matrix = np.zeros((steps, steps))

        for i, v1 in enumerate(vals1):
            for j, v2 in enumerate(vals2):
                self.inputs[input1_name] = v1
                self.inputs[input2_name] = v2
                result = self.calculate()
                if result.success and output_name in result.outputs:
                    result_matrix[i, j] = result.outputs[output_name]
                else:
                    result_matrix[i, j] = np.nan

        # Restore original values
        self.inputs[input1_name] = base1
        self.inputs[input2_name] = base2

        return result_matrix


class FinancialCalculations:
    """Common financial calculation utilities."""

    @staticmethod
    def irr(cash_flows: list[float]) -> float:
        """Calculate Internal Rate of Return.

        Args:
            cash_flows: List of cash flows (first is typically negative investment)

        Returns:
            IRR as a decimal (e.g., 0.15 for 15%)
        """
        try:
            return float(npf.irr(cash_flows))
        except Exception:
            return np.nan

    @staticmethod
    def xirr(cash_flows: list[float], dates: list[datetime]) -> float:
        """Calculate XIRR for irregular cash flows.

        Args:
            cash_flows: List of cash flow amounts
            dates: List of corresponding dates

        Returns:
            XIRR as a decimal
        """
        if len(cash_flows) != len(dates):
            raise ValueError("Cash flows and dates must have same length")

        # Convert dates to years from first date
        base_date = min(dates)
        years = [(d - base_date).days / 365.0 for d in dates]

        # Newton-Raphson iteration to find XIRR
        def xnpv(rate: float) -> float:
            return sum(cf / (1 + rate) ** y for cf, y in zip(cash_flows, years))

        def xnpv_derivative(rate: float) -> float:
            return sum(
                -y * cf / (1 + rate) ** (y + 1) for cf, y in zip(cash_flows, years)
            )

        # Initial guess
        rate = 0.1
        for _ in range(100):
            npv = xnpv(rate)
            if abs(npv) < 1e-10:
                return rate
            deriv = xnpv_derivative(rate)
            if abs(deriv) < 1e-10:
                break
            rate = rate - npv / deriv

        return rate

    @staticmethod
    def npv(rate: float, cash_flows: list[float]) -> float:
        """Calculate Net Present Value.

        Args:
            rate: Discount rate as decimal
            cash_flows: List of cash flows

        Returns:
            NPV value
        """
        return float(npf.npv(rate, cash_flows))

    @staticmethod
    def moic(total_distributions: float, total_invested: float) -> float:
        """Calculate Multiple on Invested Capital.

        Args:
            total_distributions: Total amount returned to investors
            total_invested: Total amount invested

        Returns:
            MOIC multiple
        """
        if total_invested == 0:
            return np.nan
        return total_distributions / total_invested

    @staticmethod
    def wacc(
        equity_weight: float,
        cost_of_equity: float,
        debt_weight: float,
        cost_of_debt: float,
        tax_rate: float,
    ) -> float:
        """Calculate Weighted Average Cost of Capital.

        Args:
            equity_weight: Weight of equity in capital structure
            cost_of_equity: Cost of equity (decimal)
            debt_weight: Weight of debt in capital structure
            cost_of_debt: Cost of debt (decimal)
            tax_rate: Corporate tax rate (decimal)

        Returns:
            WACC as decimal
        """
        return (equity_weight * cost_of_equity) + (
            debt_weight * cost_of_debt * (1 - tax_rate)
        )

    @staticmethod
    def terminal_value_gordon_growth(
        final_fcf: float, discount_rate: float, terminal_growth_rate: float
    ) -> float:
        """Calculate terminal value using Gordon Growth Model.

        Args:
            final_fcf: Final year free cash flow
            discount_rate: Discount rate (WACC)
            terminal_growth_rate: Perpetual growth rate

        Returns:
            Terminal value
        """
        if discount_rate <= terminal_growth_rate:
            raise ValueError("Discount rate must exceed terminal growth rate")
        return final_fcf * (1 + terminal_growth_rate) / (
            discount_rate - terminal_growth_rate
        )

    @staticmethod
    def terminal_value_exit_multiple(final_ebitda: float, exit_multiple: float) -> float:
        """Calculate terminal value using exit multiple.

        Args:
            final_ebitda: Final year EBITDA
            exit_multiple: EV/EBITDA exit multiple

        Returns:
            Terminal value
        """
        return final_ebitda * exit_multiple

    @staticmethod
    def accretion_dilution(
        acquirer_eps_pre: float,
        combined_eps_post: float,
    ) -> tuple[float, str]:
        """Calculate accretion/dilution percentage.

        Args:
            acquirer_eps_pre: Acquirer's EPS before transaction
            combined_eps_post: Combined company EPS after transaction

        Returns:
            Tuple of (percentage change, "accretive" or "dilutive")
        """
        if acquirer_eps_pre == 0:
            return (np.nan, "undefined")

        pct_change = (combined_eps_post - acquirer_eps_pre) / acquirer_eps_pre
        status = "accretive" if pct_change > 0 else "dilutive"

        return (pct_change, status)
