"""
Spin-Off / Carve-Out Financial Model

Analyzes corporate spin-off and carve-out transactions including:
- Separation of business units
- Pro-forma financial statements
- Tax efficiency analysis
- Value creation analysis
- Stranded costs and dis-synergies
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum

from core.engine.base_model import BaseFinancialModel, CalculationResult


class TransactionType(str, Enum):
    """Types of separation transactions."""
    SPINOFF = "spinoff"  # Tax-free distribution to shareholders
    CARVEOUT = "carveout"  # IPO of subsidiary
    SPLIT_OFF = "split_off"  # Exchange offer
    DIVESTITURE = "divestiture"  # Sale to third party


class CostAllocationMethod(str, Enum):
    """Methods for allocating shared costs."""
    REVENUE_BASED = "revenue_based"
    HEADCOUNT_BASED = "headcount_based"
    ASSET_BASED = "asset_based"
    DIRECT_ATTRIBUTION = "direct_attribution"
    HYBRID = "hybrid"


@dataclass
class BusinessUnit:
    """Business unit being separated."""
    name: str
    revenue: float
    ebitda: float
    ebit: float = 0
    total_assets: float = 0
    total_debt: float = 0
    employees: int = 0
    capex: float = 0
    working_capital: float = 0
    growth_rate: float = 0.03
    ebitda_margin: float = 0


@dataclass
class SharedCost:
    """Shared corporate cost to be allocated."""
    name: str
    total_amount: float
    allocation_method: CostAllocationMethod = CostAllocationMethod.REVENUE_BASED
    parent_retention_percent: float = 0.0  # Percent kept by parent
    spinco_allocation_percent: float = 0.0  # Percent allocated to SpinCo


@dataclass
class TransitionService:
    """Transition Service Agreement (TSA) item."""
    name: str
    annual_cost: float
    duration_months: int = 24
    markup_percent: float = 0.05  # Typical TSA markup


@dataclass
class SpinoffInputs:
    """Inputs for spin-off/carve-out analysis."""
    # Transaction structure
    transaction_type: TransactionType = TransactionType.SPINOFF
    spinco_name: str = "SpinCo"
    parent_name: str = "ParentCo"

    # Business units
    spinco_business: Optional[BusinessUnit] = None
    parent_remaining: Optional[BusinessUnit] = None

    # Simplified inputs (if business unit details not provided)
    spinco_revenue: float = 0
    spinco_ebitda: float = 0
    spinco_assets: float = 0
    spinco_debt: float = 0
    parent_revenue: float = 0
    parent_ebitda: float = 0
    parent_assets: float = 0
    parent_debt: float = 0

    # Shared costs and dis-synergies
    shared_costs: List[SharedCost] = field(default_factory=list)
    total_corporate_overhead: float = 0
    spinco_overhead_allocation: float = 0.30  # Default 30% to SpinCo

    # Stranded costs
    stranded_cost_amount: float = 0
    stranded_cost_mitigation_years: int = 3
    stranded_cost_mitigation_percent: float = 0.80  # 80% can be eliminated

    # Transition services
    transition_services: List[TransitionService] = field(default_factory=list)

    # Transaction costs
    transaction_costs: float = 0
    separation_costs: float = 0

    # Capital structure
    spinco_target_leverage: float = 2.5  # Debt/EBITDA
    spinco_interest_rate: float = 0.06
    parent_target_leverage: float = 2.0

    # Tax considerations
    tax_rate: float = 0.25
    is_tax_free: bool = True  # Tax-free spin-off under Section 355
    tax_basis_step_up: float = 0  # For taxable transactions

    # Valuation assumptions
    spinco_ebitda_multiple: float = 8.0
    parent_ebitda_multiple: float = 10.0
    projection_years: int = 5

    # For carve-out IPO
    ipo_proceeds: float = 0
    shares_offered_percent: float = 0.20  # 20% IPO
    ipo_discount: float = 0.15  # Typical IPO discount


class SpinoffModel(BaseFinancialModel):
    """Spin-off and carve-out transaction analysis model."""

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self.inputs: Optional[SpinoffInputs] = None

    def set_inputs(self, inputs: SpinoffInputs) -> None:
        """Set model inputs."""
        self.inputs = inputs

    def validate_inputs(self) -> tuple[bool, List[str]]:
        """Validate model inputs."""
        errors = []

        if not self.inputs:
            errors.append("No inputs provided")
            return (False, errors)

        # Check for business data
        has_business_unit = self.inputs.spinco_business is not None
        has_simplified = self.inputs.spinco_revenue > 0 or self.inputs.spinco_ebitda > 0

        if not has_business_unit and not has_simplified:
            errors.append("SpinCo business data required")

        if self.inputs.spinco_ebitda_multiple <= 0:
            errors.append("SpinCo EBITDA multiple must be positive")

        return (len(errors) == 0, errors)

    def get_key_outputs(self) -> Dict[str, Any]:
        """Get the key output metrics for spin-off analysis."""
        if not self.outputs:
            return {}
        return {
            "spinco_equity_value": self.outputs.get("valuation", {}).get("spinco_equity_value", 0),
            "parent_equity_value": self.outputs.get("valuation", {}).get("parent_equity_value", 0),
            "total_value_created": self.outputs.get("value_creation", {}).get("total_value_created", 0),
            "stranded_costs": self.outputs.get("cost_analysis", {}).get("total_stranded_costs", 0),
            "separation_multiple": self.outputs.get("valuation", {}).get("separation_multiple_expansion", 0),
        }

    def calculate(self) -> CalculationResult:
        """Run the spin-off analysis."""
        is_valid, errors = self.validate_inputs()
        if not is_valid:
            return CalculationResult(success=False, errors=errors, outputs={})

        try:
            outputs = self._calculate_spinoff()
            self.outputs = outputs
            return CalculationResult(success=True, errors=[], outputs=outputs)
        except Exception as e:
            return CalculationResult(success=False, errors=[str(e)], outputs={})

    def _calculate_spinoff(self) -> Dict[str, Any]:
        """Calculate all spin-off metrics."""
        inputs = self.inputs

        # Pro-forma financials
        proforma = self._calculate_proforma_financials()

        # Cost allocation and stranded costs
        cost_analysis = self._calculate_cost_analysis(proforma)

        # Capital structure
        capital = self._calculate_capital_structure(proforma, cost_analysis)

        # Valuation
        valuation = self._calculate_valuation(proforma, cost_analysis, capital)

        # Value creation analysis
        value_creation = self._calculate_value_creation(valuation)

        # TSA analysis
        tsa = self._calculate_tsa_impact()

        # Projections
        projections = self._calculate_projections(proforma, cost_analysis)

        return {
            "transaction_summary": {
                "type": inputs.transaction_type.value,
                "spinco_name": inputs.spinco_name,
                "parent_name": inputs.parent_name,
                "is_tax_free": inputs.is_tax_free,
            },
            "proforma_financials": proforma,
            "cost_analysis": cost_analysis,
            "capital_structure": capital,
            "valuation": valuation,
            "value_creation": value_creation,
            "tsa_analysis": tsa,
            "projections": projections,
            "years": list(range(1, inputs.projection_years + 1)),
        }

    def _calculate_proforma_financials(self) -> Dict[str, Any]:
        """Calculate pro-forma financials for both entities."""
        inputs = self.inputs

        # SpinCo financials
        if inputs.spinco_business:
            spinco_revenue = inputs.spinco_business.revenue
            spinco_ebitda = inputs.spinco_business.ebitda
            spinco_assets = inputs.spinco_business.total_assets
            spinco_debt = inputs.spinco_business.total_debt
            spinco_employees = inputs.spinco_business.employees
        else:
            spinco_revenue = inputs.spinco_revenue
            spinco_ebitda = inputs.spinco_ebitda
            spinco_assets = inputs.spinco_assets
            spinco_debt = inputs.spinco_debt
            spinco_employees = 0

        # Parent remaining financials
        if inputs.parent_remaining:
            parent_revenue = inputs.parent_remaining.revenue
            parent_ebitda = inputs.parent_remaining.ebitda
            parent_assets = inputs.parent_remaining.total_assets
            parent_debt = inputs.parent_remaining.total_debt
            parent_employees = inputs.parent_remaining.employees
        else:
            parent_revenue = inputs.parent_revenue
            parent_ebitda = inputs.parent_ebitda
            parent_assets = inputs.parent_assets
            parent_debt = inputs.parent_debt
            parent_employees = 0

        # Combined pre-separation
        combined_revenue = spinco_revenue + parent_revenue
        combined_ebitda = spinco_ebitda + parent_ebitda

        # Revenue contribution
        spinco_revenue_contribution = spinco_revenue / combined_revenue if combined_revenue > 0 else 0

        # EBITDA margins
        spinco_margin = spinco_ebitda / spinco_revenue if spinco_revenue > 0 else 0
        parent_margin = parent_ebitda / parent_revenue if parent_revenue > 0 else 0

        return {
            "spinco": {
                "revenue": spinco_revenue,
                "ebitda": spinco_ebitda,
                "ebitda_margin": spinco_margin,
                "total_assets": spinco_assets,
                "total_debt": spinco_debt,
                "employees": spinco_employees,
            },
            "parent": {
                "revenue": parent_revenue,
                "ebitda": parent_ebitda,
                "ebitda_margin": parent_margin,
                "total_assets": parent_assets,
                "total_debt": parent_debt,
                "employees": parent_employees,
            },
            "combined": {
                "revenue": combined_revenue,
                "ebitda": combined_ebitda,
            },
            "spinco_revenue_contribution": spinco_revenue_contribution,
        }

    def _calculate_cost_analysis(self, proforma: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cost allocation and stranded costs."""
        inputs = self.inputs

        spinco_revenue = proforma["spinco"]["revenue"]
        parent_revenue = proforma["parent"]["revenue"]
        total_revenue = proforma["combined"]["revenue"]

        # Allocate shared costs
        allocated_costs = []
        spinco_allocated = 0
        parent_allocated = 0

        for cost in inputs.shared_costs:
            if cost.allocation_method == CostAllocationMethod.REVENUE_BASED:
                spinco_share = cost.total_amount * (spinco_revenue / total_revenue) if total_revenue > 0 else 0
            elif cost.spinco_allocation_percent > 0:
                spinco_share = cost.total_amount * cost.spinco_allocation_percent
            else:
                spinco_share = cost.total_amount * inputs.spinco_overhead_allocation

            parent_share = cost.total_amount - spinco_share

            allocated_costs.append({
                "name": cost.name,
                "total": cost.total_amount,
                "spinco_allocation": spinco_share,
                "parent_allocation": parent_share,
            })

            spinco_allocated += spinco_share
            parent_allocated += parent_share

        # Corporate overhead allocation
        if inputs.total_corporate_overhead > 0:
            spinco_overhead = inputs.total_corporate_overhead * inputs.spinco_overhead_allocation
            parent_overhead = inputs.total_corporate_overhead * (1 - inputs.spinco_overhead_allocation)
        else:
            spinco_overhead = spinco_allocated
            parent_overhead = parent_allocated

        # Stranded costs (costs that remain with parent but lose scale benefits)
        stranded = inputs.stranded_cost_amount
        mitigated_stranded = stranded * inputs.stranded_cost_mitigation_percent
        permanent_stranded = stranded - mitigated_stranded

        # Stranded cost schedule
        stranded_schedule = []
        remaining = stranded
        annual_mitigation = mitigated_stranded / inputs.stranded_cost_mitigation_years

        for year in range(1, inputs.stranded_cost_mitigation_years + 2):
            if year <= inputs.stranded_cost_mitigation_years:
                remaining = max(permanent_stranded, remaining - annual_mitigation)
            stranded_schedule.append(remaining)

        # Dis-synergies (additional costs from separation)
        dis_synergies = spinco_overhead * 0.10  # Estimate 10% inefficiency

        return {
            "allocated_costs": allocated_costs,
            "spinco_corporate_costs": spinco_overhead,
            "parent_corporate_costs": parent_overhead,
            "total_stranded_costs": stranded,
            "mitigated_stranded_costs": mitigated_stranded,
            "permanent_stranded_costs": permanent_stranded,
            "stranded_cost_schedule": stranded_schedule,
            "dis_synergies": dis_synergies,
            "transaction_costs": inputs.transaction_costs,
            "separation_costs": inputs.separation_costs,
        }

    def _calculate_capital_structure(self, proforma: Dict[str, Any], cost_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate post-separation capital structure."""
        inputs = self.inputs

        spinco_ebitda = proforma["spinco"]["ebitda"] - cost_analysis["spinco_corporate_costs"]
        parent_ebitda = proforma["parent"]["ebitda"] - cost_analysis["parent_corporate_costs"] - cost_analysis["permanent_stranded_costs"]

        # Target debt levels
        spinco_target_debt = spinco_ebitda * inputs.spinco_target_leverage
        parent_target_debt = parent_ebitda * inputs.parent_target_leverage

        # Interest expense
        spinco_interest = spinco_target_debt * inputs.spinco_interest_rate
        parent_interest = parent_target_debt * inputs.spinco_interest_rate  # Assume same rate

        # Coverage ratios
        spinco_coverage = spinco_ebitda / spinco_interest if spinco_interest > 0 else 0
        parent_coverage = parent_ebitda / parent_interest if parent_interest > 0 else 0

        return {
            "spinco": {
                "adjusted_ebitda": spinco_ebitda,
                "target_debt": spinco_target_debt,
                "target_leverage": inputs.spinco_target_leverage,
                "interest_expense": spinco_interest,
                "interest_coverage": spinco_coverage,
            },
            "parent": {
                "adjusted_ebitda": parent_ebitda,
                "target_debt": parent_target_debt,
                "target_leverage": inputs.parent_target_leverage,
                "interest_expense": parent_interest,
                "interest_coverage": parent_coverage,
            },
        }

    def _calculate_valuation(self, proforma: Dict[str, Any], cost_analysis: Dict[str, Any], capital: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate valuations for both entities."""
        inputs = self.inputs

        # SpinCo valuation
        spinco_ebitda = capital["spinco"]["adjusted_ebitda"]
        spinco_ev = spinco_ebitda * inputs.spinco_ebitda_multiple
        spinco_debt = capital["spinco"]["target_debt"]
        spinco_equity = spinco_ev - spinco_debt

        # Parent valuation
        parent_ebitda = capital["parent"]["adjusted_ebitda"]
        parent_ev = parent_ebitda * inputs.parent_ebitda_multiple
        parent_debt = capital["parent"]["target_debt"]
        parent_equity = parent_ev - parent_debt

        # Combined valuation
        combined_ev = spinco_ev + parent_ev
        combined_equity = spinco_equity + parent_equity
        combined_ebitda = spinco_ebitda + parent_ebitda

        # Pre-separation implied value (if valued as one company)
        pre_sep_ebitda = proforma["combined"]["ebitda"]
        blended_multiple = (inputs.spinco_ebitda_multiple + inputs.parent_ebitda_multiple) / 2
        pre_sep_ev = pre_sep_ebitda * blended_multiple

        # Multiple expansion from separation
        post_sep_implied_multiple = combined_ev / combined_ebitda if combined_ebitda > 0 else 0
        multiple_expansion = post_sep_implied_multiple - blended_multiple

        # For carve-out IPO
        if inputs.transaction_type == TransactionType.CARVEOUT:
            ipo_value = spinco_equity * inputs.shares_offered_percent
            ipo_proceeds = ipo_value * (1 - inputs.ipo_discount)
        else:
            ipo_value = 0
            ipo_proceeds = inputs.ipo_proceeds

        return {
            "spinco_enterprise_value": spinco_ev,
            "spinco_equity_value": spinco_equity,
            "spinco_ebitda_multiple": inputs.spinco_ebitda_multiple,
            "parent_enterprise_value": parent_ev,
            "parent_equity_value": parent_equity,
            "parent_ebitda_multiple": inputs.parent_ebitda_multiple,
            "combined_enterprise_value": combined_ev,
            "combined_equity_value": combined_equity,
            "pre_separation_ev": pre_sep_ev,
            "post_separation_implied_multiple": post_sep_implied_multiple,
            "separation_multiple_expansion": multiple_expansion,
            "ipo_value": ipo_value,
            "ipo_proceeds": ipo_proceeds,
        }

    def _calculate_value_creation(self, valuation: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate value creation from separation."""
        inputs = self.inputs

        # Value creation from multiple expansion
        post_sep_value = valuation["combined_equity_value"]
        pre_sep_value = valuation["pre_separation_ev"] - (
            valuation["spinco_enterprise_value"] - valuation["spinco_equity_value"] +
            valuation["parent_enterprise_value"] - valuation["parent_equity_value"]
        )

        gross_value_created = post_sep_value - pre_sep_value

        # Less: Transaction and separation costs
        total_costs = inputs.transaction_costs + inputs.separation_costs

        # Less: NPV of stranded costs (simplified)
        stranded_npv = inputs.stranded_cost_amount * 3  # ~3 years of costs

        net_value_created = gross_value_created - total_costs - stranded_npv

        # Value creation percent
        value_creation_percent = net_value_created / pre_sep_value if pre_sep_value > 0 else 0

        return {
            "pre_separation_equity_value": pre_sep_value,
            "post_separation_equity_value": post_sep_value,
            "gross_value_created": gross_value_created,
            "transaction_costs": total_costs,
            "stranded_cost_npv": stranded_npv,
            "total_value_created": net_value_created,
            "value_creation_percent": value_creation_percent,
            "multiple_expansion_value": gross_value_created,
        }

    def _calculate_tsa_impact(self) -> Dict[str, Any]:
        """Calculate Transition Service Agreement impact."""
        inputs = self.inputs

        tsa_details = []
        total_annual_cost = 0
        total_tsa_value = 0

        for tsa in inputs.transition_services:
            annual = tsa.annual_cost
            duration_years = tsa.duration_months / 12
            total_cost = annual * duration_years
            markup_revenue = annual * tsa.markup_percent * duration_years

            tsa_details.append({
                "name": tsa.name,
                "annual_cost": annual,
                "duration_months": tsa.duration_months,
                "total_cost": total_cost,
                "markup_revenue": markup_revenue,
            })

            total_annual_cost += annual
            total_tsa_value += total_cost

        return {
            "tsa_agreements": tsa_details,
            "total_annual_tsa_cost": total_annual_cost,
            "total_tsa_value": total_tsa_value,
            "average_duration_months": sum(t.duration_months for t in inputs.transition_services) / len(inputs.transition_services) if inputs.transition_services else 0,
        }

    def _calculate_projections(self, proforma: Dict[str, Any], cost_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Project financials post-separation."""
        inputs = self.inputs
        years = inputs.projection_years

        # Get growth rates
        spinco_growth = inputs.spinco_business.growth_rate if inputs.spinco_business else 0.05
        parent_growth = inputs.parent_remaining.growth_rate if inputs.parent_remaining else 0.03

        spinco_base_ebitda = proforma["spinco"]["ebitda"] - cost_analysis["spinco_corporate_costs"]
        parent_base_ebitda = proforma["parent"]["ebitda"] - cost_analysis["parent_corporate_costs"]

        spinco_ebitda_proj = []
        parent_ebitda_proj = []
        stranded_costs_proj = cost_analysis["stranded_cost_schedule"][:years]

        for year in range(1, years + 1):
            spinco_ebitda = spinco_base_ebitda * ((1 + spinco_growth) ** year)
            parent_ebitda = parent_base_ebitda * ((1 + parent_growth) ** year)

            # Subtract stranded costs from parent
            if year <= len(stranded_costs_proj):
                parent_ebitda -= stranded_costs_proj[year - 1]

            spinco_ebitda_proj.append(spinco_ebitda)
            parent_ebitda_proj.append(parent_ebitda)

        return {
            "spinco_ebitda": spinco_ebitda_proj,
            "parent_ebitda": parent_ebitda_proj,
            "stranded_costs": stranded_costs_proj,
            "spinco_growth_rate": spinco_growth,
            "parent_growth_rate": parent_growth,
        }

    def run_sensitivity(
        self,
        variable: str,
        values: List[float],
        output_metric: str = "value_creation.total_value_created"
    ) -> Dict[str, List[float]]:
        """Run sensitivity analysis on a variable."""
        results = []
        original_value = getattr(self.inputs, variable, None)

        for value in values:
            setattr(self.inputs, variable, value)
            result = self.calculate()

            if result.success:
                metric_value = self._get_nested_value(result.outputs, output_metric)
                results.append(metric_value)
            else:
                results.append(None)

        if original_value is not None:
            setattr(self.inputs, variable, original_value)

        return {
            "variable": variable,
            "values": values,
            "results": results,
            "metric": output_metric,
        }

    def _get_nested_value(self, data: Dict, path: str) -> Any:
        """Get a value from nested dictionary using dot notation."""
        keys = path.split(".")
        value = data
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None
        return value
