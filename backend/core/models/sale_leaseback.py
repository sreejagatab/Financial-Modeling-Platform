"""
Sale-Leaseback Financial Model

Analyzes sale-leaseback transactions where a company sells real estate
and leases it back from the buyer. Evaluates proceeds, rent coverage,
implied cap rates, and impact on financial statements.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum

from core.engine.base_model import BaseFinancialModel, CalculationResult


class LeaseType(str, Enum):
    """Types of lease structures."""
    TRIPLE_NET = "triple_net"  # NNN - tenant pays taxes, insurance, maintenance
    DOUBLE_NET = "double_net"  # NN - tenant pays taxes and insurance
    GROSS = "gross"  # Landlord pays all expenses
    MODIFIED_GROSS = "modified_gross"  # Shared expenses


class EscalationType(str, Enum):
    """Rent escalation types."""
    FIXED = "fixed"  # Fixed percentage increase
    CPI = "cpi"  # Consumer Price Index linked
    STEP = "step"  # Stepped increases at specific years
    FAIR_MARKET = "fair_market"  # Fair market value resets


@dataclass
class PropertyInfo:
    """Information about a property in the portfolio."""
    name: str
    property_type: str  # office, industrial, retail, etc.
    square_feet: float
    current_book_value: float
    market_value: float
    annual_noi: float  # Net Operating Income
    location: str = ""
    age_years: int = 0
    remaining_useful_life: int = 30


@dataclass
class SaleLeasebackInputs:
    """Inputs for sale-leaseback analysis."""
    # Property portfolio
    properties: List[PropertyInfo] = field(default_factory=list)

    # Transaction terms
    sale_price: Optional[float] = None  # If None, use market values
    transaction_costs_percent: float = 0.02  # 2% of sale price

    # Lease terms
    initial_lease_term_years: int = 15
    renewal_options: int = 2  # Number of renewal periods
    renewal_term_years: int = 5
    lease_type: LeaseType = LeaseType.TRIPLE_NET

    # Rent structure
    initial_rent: Optional[float] = None  # If None, derive from cap rate
    target_cap_rate: float = 0.065  # 6.5% cap rate
    escalation_type: EscalationType = EscalationType.FIXED
    annual_escalation_rate: float = 0.025  # 2.5% annual increase
    escalation_steps: List[Dict[str, float]] = field(default_factory=list)  # For stepped escalations

    # Financial assumptions
    corporate_tax_rate: float = 0.25
    discount_rate: float = 0.08  # For NPV calculations
    current_ebitda: float = 0.0  # Company's EBITDA for coverage ratios
    current_debt: float = 0.0  # For debt paydown analysis
    debt_interest_rate: float = 0.05

    # Use of proceeds
    debt_paydown_percent: float = 0.50  # Percent of proceeds to pay down debt
    reinvestment_return: float = 0.10  # Return on reinvested proceeds

    # Analysis period
    projection_years: int = 15


class SaleLeasebackModel(BaseFinancialModel):
    """Sale-leaseback transaction analysis model."""

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self.inputs: Optional[SaleLeasebackInputs] = None

    def set_inputs(self, inputs: SaleLeasebackInputs) -> None:
        """Set model inputs."""
        self.inputs = inputs

    def validate_inputs(self) -> tuple[bool, List[str]]:
        """Validate model inputs."""
        errors = []

        if not self.inputs:
            errors.append("No inputs provided")
            return (False, errors)

        if not self.inputs.properties:
            errors.append("At least one property is required")

        for i, prop in enumerate(self.inputs.properties):
            if prop.market_value <= 0:
                errors.append(f"Property {i+1} ({prop.name}): Market value must be positive")
            if prop.annual_noi < 0:
                errors.append(f"Property {i+1} ({prop.name}): NOI cannot be negative")

        if self.inputs.target_cap_rate <= 0 or self.inputs.target_cap_rate > 0.20:
            errors.append("Cap rate should be between 0% and 20%")

        if self.inputs.initial_lease_term_years < 1:
            errors.append("Initial lease term must be at least 1 year")

        return (len(errors) == 0, errors)

    def get_key_outputs(self) -> Dict[str, Any]:
        """Get the key output metrics for sale-leaseback analysis."""
        if not self.outputs:
            return {}
        return {
            "net_proceeds": self.outputs.get("transaction_economics", {}).get("after_tax_proceeds", 0),
            "initial_annual_rent": self.outputs.get("transaction_economics", {}).get("initial_annual_rent", 0),
            "implied_cap_rate": self.outputs.get("transaction_economics", {}).get("implied_cap_rate", 0),
            "npv": self.outputs.get("npv_analysis", {}).get("net_present_value", 0),
            "ebitda_coverage": self.outputs.get("coverage_ratios", {}).get("ebitda_rent_coverage", 0),
        }

    def calculate(self) -> CalculationResult:
        """Run the sale-leaseback analysis."""
        is_valid, errors = self.validate_inputs()
        if not is_valid:
            return CalculationResult(success=False, errors=errors, outputs={})

        try:
            outputs = self._calculate_transaction()
            self.outputs = outputs
            return CalculationResult(success=True, errors=[], outputs=outputs)
        except Exception as e:
            return CalculationResult(success=False, errors=[str(e)], outputs={})

    def _calculate_transaction(self) -> Dict[str, Any]:
        """Calculate all transaction metrics."""
        inputs = self.inputs

        # Portfolio summary
        portfolio = self._calculate_portfolio_summary()

        # Transaction economics
        transaction = self._calculate_transaction_economics(portfolio)

        # Lease projections
        lease = self._calculate_lease_projections(transaction)

        # Financial impact
        impact = self._calculate_financial_impact(transaction, lease)

        # Coverage ratios
        coverage = self._calculate_coverage_ratios(lease, impact)

        # NPV analysis
        npv = self._calculate_npv_analysis(transaction, lease)

        # Use of proceeds analysis
        proceeds = self._calculate_proceeds_analysis(transaction)

        return {
            "portfolio_summary": portfolio,
            "transaction_economics": transaction,
            "lease_projections": lease,
            "financial_impact": impact,
            "coverage_ratios": coverage,
            "npv_analysis": npv,
            "proceeds_analysis": proceeds,
            "years": list(range(1, inputs.projection_years + 1)),
        }

    def _calculate_portfolio_summary(self) -> Dict[str, Any]:
        """Calculate portfolio-level summary."""
        inputs = self.inputs

        total_sf = sum(p.square_feet for p in inputs.properties)
        total_book_value = sum(p.current_book_value for p in inputs.properties)
        total_market_value = sum(p.market_value for p in inputs.properties)
        total_noi = sum(p.annual_noi for p in inputs.properties)

        # Weighted average metrics
        implied_cap_rate = total_noi / total_market_value if total_market_value > 0 else 0
        avg_age = sum(p.age_years * p.square_feet for p in inputs.properties) / total_sf if total_sf > 0 else 0

        # Property type breakdown
        by_type = {}
        for prop in inputs.properties:
            if prop.property_type not in by_type:
                by_type[prop.property_type] = {
                    "count": 0,
                    "square_feet": 0,
                    "market_value": 0,
                    "noi": 0,
                }
            by_type[prop.property_type]["count"] += 1
            by_type[prop.property_type]["square_feet"] += prop.square_feet
            by_type[prop.property_type]["market_value"] += prop.market_value
            by_type[prop.property_type]["noi"] += prop.annual_noi

        return {
            "property_count": len(inputs.properties),
            "total_square_feet": total_sf,
            "total_book_value": total_book_value,
            "total_market_value": total_market_value,
            "total_annual_noi": total_noi,
            "implied_cap_rate": implied_cap_rate,
            "average_age_years": avg_age,
            "book_to_market_ratio": total_book_value / total_market_value if total_market_value > 0 else 0,
            "by_property_type": by_type,
        }

    def _calculate_transaction_economics(self, portfolio: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate transaction economics."""
        inputs = self.inputs

        # Determine sale price
        sale_price = inputs.sale_price or portfolio["total_market_value"]

        # Transaction costs
        transaction_costs = sale_price * inputs.transaction_costs_percent
        net_proceeds = sale_price - transaction_costs

        # Gain/loss calculation
        book_value = portfolio["total_book_value"]
        gain_loss = sale_price - book_value
        tax_impact = gain_loss * inputs.corporate_tax_rate if gain_loss > 0 else 0
        after_tax_proceeds = net_proceeds - tax_impact

        # Cap rate implied by sale
        implied_cap_rate = portfolio["total_annual_noi"] / sale_price if sale_price > 0 else 0

        # Initial rent calculation
        if inputs.initial_rent:
            initial_rent = inputs.initial_rent
        else:
            initial_rent = sale_price * inputs.target_cap_rate

        return {
            "sale_price": sale_price,
            "transaction_costs": transaction_costs,
            "net_proceeds": net_proceeds,
            "book_value": book_value,
            "gain_loss": gain_loss,
            "tax_on_gain": tax_impact,
            "after_tax_proceeds": after_tax_proceeds,
            "implied_cap_rate": implied_cap_rate,
            "initial_annual_rent": initial_rent,
            "rent_per_sf": initial_rent / portfolio["total_square_feet"] if portfolio["total_square_feet"] > 0 else 0,
            "price_per_sf": sale_price / portfolio["total_square_feet"] if portfolio["total_square_feet"] > 0 else 0,
        }

    def _calculate_lease_projections(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Project lease payments over time."""
        inputs = self.inputs
        years = inputs.projection_years

        initial_rent = transaction["initial_annual_rent"]
        annual_rents = []
        cumulative_rent = 0

        for year in range(1, years + 1):
            if inputs.escalation_type == EscalationType.FIXED:
                rent = initial_rent * ((1 + inputs.annual_escalation_rate) ** (year - 1))
            elif inputs.escalation_type == EscalationType.STEP:
                # Find applicable escalation step
                rent = initial_rent
                for step in inputs.escalation_steps:
                    if year >= step.get("year", 0):
                        rent = step.get("rent", initial_rent)
            else:
                # Default to fixed escalation
                rent = initial_rent * ((1 + inputs.annual_escalation_rate) ** (year - 1))

            annual_rents.append(rent)
            cumulative_rent += rent

        # Calculate averages
        avg_rent = sum(annual_rents) / len(annual_rents)
        total_lease_term = inputs.initial_lease_term_years + (inputs.renewal_options * inputs.renewal_term_years)

        return {
            "annual_rents": annual_rents,
            "cumulative_rent": cumulative_rent,
            "average_rent": avg_rent,
            "initial_lease_term": inputs.initial_lease_term_years,
            "total_potential_term": total_lease_term,
            "escalation_type": inputs.escalation_type.value,
            "annual_escalation_rate": inputs.annual_escalation_rate,
            "final_year_rent": annual_rents[-1] if annual_rents else 0,
            "rent_growth_total": (annual_rents[-1] / annual_rents[0] - 1) if annual_rents else 0,
        }

    def _calculate_financial_impact(self, transaction: Dict[str, Any], lease: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate impact on financial statements."""
        inputs = self.inputs

        # P&L impact - replace depreciation with rent expense
        portfolio_book = transaction["book_value"]
        avg_useful_life = 30  # years
        annual_depreciation_avoided = portfolio_book / avg_useful_life

        # Operating lease treatment (ASC 842)
        # Right-of-use asset and lease liability
        discount_rate = inputs.discount_rate
        lease_liability = sum(
            rent / ((1 + discount_rate) ** year)
            for year, rent in enumerate(lease["annual_rents"], 1)
        )

        # Annual P&L impact
        annual_rent = lease["annual_rents"][0] if lease["annual_rents"] else 0
        ebitda_impact = -annual_rent  # Rent increases operating expenses
        ebit_impact = annual_depreciation_avoided - annual_rent  # Net of depreciation savings

        # Tax shield changes
        old_tax_shield = annual_depreciation_avoided * inputs.corporate_tax_rate
        new_tax_shield = annual_rent * inputs.corporate_tax_rate
        tax_shield_change = new_tax_shield - old_tax_shield

        # Net income impact
        net_income_impact = ebit_impact * (1 - inputs.corporate_tax_rate)

        return {
            "annual_depreciation_avoided": annual_depreciation_avoided,
            "initial_annual_rent": annual_rent,
            "ebitda_impact": ebitda_impact,
            "ebit_impact": ebit_impact,
            "net_income_impact": net_income_impact,
            "lease_liability": lease_liability,
            "rou_asset": lease_liability,  # Right-of-use asset = lease liability at inception
            "tax_shield_change": tax_shield_change,
            "cash_flow_impact_year_1": transaction["after_tax_proceeds"] - annual_rent,
        }

    def _calculate_coverage_ratios(self, lease: Dict[str, Any], impact: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate rent coverage ratios."""
        inputs = self.inputs

        annual_rent = lease["annual_rents"][0] if lease["annual_rents"] else 0

        # EBITDA coverage (EBITDAR if rent is added back)
        ebitda_coverage = inputs.current_ebitda / annual_rent if annual_rent > 0 else 0

        # Fixed charge coverage ratio
        # (EBITDA - CapEx) / (Interest + Rent + Principal)
        interest_expense = inputs.current_debt * inputs.debt_interest_rate
        fixed_charges = annual_rent + interest_expense
        fccr = inputs.current_ebitda / fixed_charges if fixed_charges > 0 else 0

        # Rent as % of revenue (assuming EBITDA margin of 15%)
        implied_revenue = inputs.current_ebitda / 0.15 if inputs.current_ebitda > 0 else 0
        rent_to_revenue = annual_rent / implied_revenue if implied_revenue > 0 else 0

        # Coverage over time
        coverage_by_year = []
        for rent in lease["annual_rents"]:
            coverage = inputs.current_ebitda / rent if rent > 0 else 0
            coverage_by_year.append(coverage)

        return {
            "ebitda_rent_coverage": ebitda_coverage,
            "fixed_charge_coverage": fccr,
            "rent_to_revenue_percent": rent_to_revenue,
            "coverage_by_year": coverage_by_year,
            "minimum_coverage": min(coverage_by_year) if coverage_by_year else 0,
            "average_coverage": sum(coverage_by_year) / len(coverage_by_year) if coverage_by_year else 0,
        }

    def _calculate_npv_analysis(self, transaction: Dict[str, Any], lease: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate NPV of transaction."""
        inputs = self.inputs
        discount_rate = inputs.discount_rate

        # PV of lease payments
        pv_lease_payments = sum(
            rent / ((1 + discount_rate) ** year)
            for year, rent in enumerate(lease["annual_rents"], 1)
        )

        # NPV of transaction = Proceeds - PV of lease obligations
        npv = transaction["after_tax_proceeds"] - pv_lease_payments

        # Breakeven analysis - years until cumulative rent equals proceeds
        cumulative = 0
        breakeven_year = 0
        for year, rent in enumerate(lease["annual_rents"], 1):
            cumulative += rent
            if cumulative >= transaction["after_tax_proceeds"] and breakeven_year == 0:
                breakeven_year = year

        # IRR approximation (simplified)
        # Cash flow: +Proceeds in year 0, -Rent each year
        cash_flows = [-transaction["after_tax_proceeds"]] + lease["annual_rents"]
        irr = self._calculate_irr(cash_flows)

        return {
            "pv_lease_payments": pv_lease_payments,
            "net_present_value": npv,
            "breakeven_year": breakeven_year,
            "implied_irr": irr,
            "discount_rate_used": discount_rate,
            "npv_positive": npv > 0,
        }

    def _calculate_proceeds_analysis(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze use of proceeds."""
        inputs = self.inputs
        proceeds = transaction["after_tax_proceeds"]

        # Debt paydown
        debt_paydown = proceeds * inputs.debt_paydown_percent
        remaining_debt = max(0, inputs.current_debt - debt_paydown)
        interest_savings = debt_paydown * inputs.debt_interest_rate

        # Reinvestment
        reinvestment = proceeds * (1 - inputs.debt_paydown_percent)
        reinvestment_income = reinvestment * inputs.reinvestment_return

        # Net annual benefit
        net_annual_benefit = interest_savings + reinvestment_income

        # Payback period
        initial_rent = transaction["initial_annual_rent"]
        net_cash_impact = net_annual_benefit - initial_rent

        return {
            "total_proceeds": proceeds,
            "debt_paydown": debt_paydown,
            "remaining_debt": remaining_debt,
            "annual_interest_savings": interest_savings,
            "reinvestment_amount": reinvestment,
            "reinvestment_income": reinvestment_income,
            "net_annual_benefit": net_annual_benefit,
            "net_cash_impact_year_1": net_cash_impact,
            "debt_reduction_percent": debt_paydown / inputs.current_debt if inputs.current_debt > 0 else 0,
        }

    def _calculate_irr(self, cash_flows: List[float], max_iterations: int = 100) -> float:
        """Calculate IRR using Newton-Raphson method."""
        if not cash_flows or len(cash_flows) < 2:
            return 0.0

        # Initial guess
        rate = 0.10

        for _ in range(max_iterations):
            npv = sum(cf / ((1 + rate) ** i) for i, cf in enumerate(cash_flows))
            npv_derivative = sum(
                -i * cf / ((1 + rate) ** (i + 1))
                for i, cf in enumerate(cash_flows)
            )

            if abs(npv_derivative) < 1e-10:
                break

            new_rate = rate - npv / npv_derivative

            if abs(new_rate - rate) < 1e-7:
                return new_rate

            rate = new_rate

            # Bound the rate
            if rate < -0.99:
                rate = -0.99
            elif rate > 10:
                rate = 10

        return rate

    def run_sensitivity(
        self,
        variable: str,
        values: List[float],
        output_metric: str = "npv"
    ) -> Dict[str, List[float]]:
        """Run sensitivity analysis on a variable."""
        results = []
        original_value = getattr(self.inputs, variable, None)

        for value in values:
            setattr(self.inputs, variable, value)
            result = self.calculate()

            if result.success:
                # Navigate to the output metric
                metric_value = self._get_nested_value(result.outputs, output_metric)
                results.append(metric_value)
            else:
                results.append(None)

        # Restore original value
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
