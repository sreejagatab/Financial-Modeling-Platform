"""
REIT Conversion & Valuation Model

Analyzes Real Estate Investment Trust (REIT) valuations, conversions,
and distributions. Calculates FFO, AFFO, dividend yields, and NAV.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum

from core.engine.base_model import BaseFinancialModel, CalculationResult


class REITType(str, Enum):
    """Types of REITs by asset focus."""
    EQUITY = "equity"  # Owns and operates properties
    MORTGAGE = "mortgage"  # Invests in mortgages
    HYBRID = "hybrid"  # Both equity and mortgage
    HEALTHCARE = "healthcare"
    RETAIL = "retail"
    OFFICE = "office"
    INDUSTRIAL = "industrial"
    RESIDENTIAL = "residential"
    DATA_CENTER = "data_center"
    INFRASTRUCTURE = "infrastructure"


class PropertySegment(str, Enum):
    """Property segments for portfolio analysis."""
    CORE = "core"  # Stabilized, low-risk assets
    VALUE_ADD = "value_add"  # Properties with upside potential
    OPPORTUNISTIC = "opportunistic"  # Higher risk/return
    DEVELOPMENT = "development"  # Under construction


@dataclass
class REITProperty:
    """Individual property in REIT portfolio."""
    name: str
    property_type: str
    segment: PropertySegment = PropertySegment.CORE
    square_feet: float = 0
    units: int = 0  # For residential
    occupancy_rate: float = 0.95
    gross_potential_rent: float = 0
    effective_gross_income: float = 0
    operating_expenses: float = 0
    noi: float = 0
    cap_rate: float = 0.06
    market_value: float = 0
    book_value: float = 0
    debt_allocated: float = 0
    acquisition_date: str = ""


@dataclass
class REITDebt:
    """Debt facility in REIT capital structure."""
    name: str
    principal: float
    interest_rate: float
    maturity_year: int
    is_secured: bool = True
    is_fixed_rate: bool = True
    prepayment_penalty: float = 0


@dataclass
class REITInputs:
    """Inputs for REIT analysis."""
    # Company info
    reit_type: REITType = REITType.EQUITY
    shares_outstanding: float = 100_000_000
    current_share_price: float = 25.0

    # Property portfolio
    properties: List[REITProperty] = field(default_factory=list)

    # For simplified input without property detail
    total_noi: float = 0
    total_assets: float = 0
    total_real_estate: float = 0

    # Debt structure
    debt_facilities: List[REITDebt] = field(default_factory=list)
    total_debt: float = 0
    weighted_avg_interest_rate: float = 0.045
    weighted_avg_maturity: float = 5.0

    # Income statement items
    rental_revenue: float = 0
    other_revenue: float = 0
    property_expenses: float = 0
    general_admin: float = 0
    depreciation: float = 0
    interest_expense: float = 0
    gain_loss_on_sale: float = 0

    # FFO adjustments
    non_cash_items: float = 0  # Other non-cash charges
    straight_line_rent_adjustment: float = 0
    above_below_market_lease_amort: float = 0

    # AFFO adjustments
    recurring_capex: float = 0
    tenant_improvements: float = 0
    leasing_commissions: float = 0

    # Growth assumptions
    projection_years: int = 5
    noi_growth_rate: float = 0.03
    rent_growth_rate: float = 0.025
    expense_growth_rate: float = 0.02
    acquisition_volume_annual: float = 0
    acquisition_cap_rate: float = 0.06
    disposition_volume_annual: float = 0

    # Distribution policy
    target_payout_ratio: float = 0.75  # % of AFFO
    minimum_distribution_requirement: float = 0.90  # REIT requirement

    # Valuation assumptions
    exit_cap_rate: float = 0.065
    discount_rate: float = 0.08
    terminal_growth_rate: float = 0.02


class REITModel(BaseFinancialModel):
    """REIT analysis and valuation model."""

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self.inputs: Optional[REITInputs] = None

    def set_inputs(self, inputs: REITInputs) -> None:
        """Set model inputs."""
        self.inputs = inputs

    def validate_inputs(self) -> tuple[bool, List[str]]:
        """Validate model inputs."""
        errors = []

        if not self.inputs:
            errors.append("No inputs provided")
            return (False, errors)

        if self.inputs.shares_outstanding <= 0:
            errors.append("Shares outstanding must be positive")

        # Note: total_noi can be 0 if we have rental_revenue and property_expenses
        has_noi_source = (
            self.inputs.total_noi > 0 or
            self.inputs.properties or
            self.inputs.rental_revenue > 0
        )
        if not has_noi_source:
            errors.append("NOI source required (total_noi, properties, or rental_revenue)")

        # target_payout_ratio is % of AFFO, not taxable income
        # REIT requirement is 90% of taxable income, which is different from AFFO
        if self.inputs.target_payout_ratio <= 0 or self.inputs.target_payout_ratio > 1.0:
            errors.append("Target payout ratio must be between 0 and 100%")

        return (len(errors) == 0, errors)

    def get_key_outputs(self) -> Dict[str, Any]:
        """Get the key output metrics for REIT analysis."""
        if not self.outputs:
            return {}
        return {
            "ffo": self.outputs.get("ffo_affo", {}).get("ffo", 0),
            "affo": self.outputs.get("ffo_affo", {}).get("affo", 0),
            "ffo_per_share": self.outputs.get("ffo_affo", {}).get("ffo_per_share", 0),
            "dividend_yield": self.outputs.get("dividend_analysis", {}).get("current_yield", 0),
            "nav_per_share": self.outputs.get("nav", {}).get("nav_per_share", 0),
            "premium_discount_to_nav": self.outputs.get("nav", {}).get("premium_discount_to_nav", 0),
        }

    def calculate(self) -> CalculationResult:
        """Run the REIT analysis."""
        is_valid, errors = self.validate_inputs()
        if not is_valid:
            return CalculationResult(success=False, errors=errors, outputs={})

        try:
            outputs = self._calculate_reit_metrics()
            self.outputs = outputs
            return CalculationResult(success=True, errors=[], outputs=outputs)
        except Exception as e:
            return CalculationResult(success=False, errors=[str(e)], outputs={})

    def _calculate_reit_metrics(self) -> Dict[str, Any]:
        """Calculate all REIT metrics."""
        inputs = self.inputs

        # Portfolio metrics
        portfolio = self._calculate_portfolio_metrics()

        # FFO and AFFO
        ffo_metrics = self._calculate_ffo_affo()

        # Dividend analysis
        dividend = self._calculate_dividend_metrics(ffo_metrics)

        # Valuation metrics
        valuation = self._calculate_valuation_metrics(portfolio, ffo_metrics)

        # NAV calculation
        nav = self._calculate_nav(portfolio)

        # Capital structure
        capital = self._calculate_capital_structure()

        # Projections
        projections = self._calculate_projections(ffo_metrics)

        return {
            "portfolio_metrics": portfolio,
            "ffo_affo": ffo_metrics,
            "dividend_analysis": dividend,
            "valuation": valuation,
            "nav": nav,
            "capital_structure": capital,
            "projections": projections,
            "years": list(range(1, inputs.projection_years + 1)),
        }

    def _calculate_portfolio_metrics(self) -> Dict[str, Any]:
        """Calculate portfolio-level metrics."""
        inputs = self.inputs

        if inputs.properties:
            total_sf = sum(p.square_feet for p in inputs.properties)
            total_noi = sum(p.noi for p in inputs.properties)
            total_market_value = sum(p.market_value for p in inputs.properties)
            weighted_occupancy = sum(
                p.occupancy_rate * p.square_feet for p in inputs.properties
            ) / total_sf if total_sf > 0 else 0

            # Segment breakdown
            by_segment = {}
            for prop in inputs.properties:
                seg = prop.segment.value
                if seg not in by_segment:
                    by_segment[seg] = {"count": 0, "noi": 0, "value": 0}
                by_segment[seg]["count"] += 1
                by_segment[seg]["noi"] += prop.noi
                by_segment[seg]["value"] += prop.market_value
        else:
            total_sf = 0
            total_noi = inputs.total_noi
            total_market_value = inputs.total_real_estate
            weighted_occupancy = 0.95
            by_segment = {}

        # Calculate implied cap rate
        implied_cap_rate = total_noi / total_market_value if total_market_value > 0 else 0

        return {
            "property_count": len(inputs.properties),
            "total_square_feet": total_sf,
            "total_noi": total_noi,
            "total_market_value": total_market_value,
            "weighted_avg_occupancy": weighted_occupancy,
            "implied_cap_rate": implied_cap_rate,
            "noi_per_sf": total_noi / total_sf if total_sf > 0 else 0,
            "value_per_sf": total_market_value / total_sf if total_sf > 0 else 0,
            "by_segment": by_segment,
        }

    def _calculate_ffo_affo(self) -> Dict[str, Any]:
        """Calculate Funds From Operations (FFO) and Adjusted FFO (AFFO)."""
        inputs = self.inputs

        # Start with Net Income components
        rental_revenue = inputs.rental_revenue or inputs.total_noi + inputs.property_expenses
        total_revenue = rental_revenue + inputs.other_revenue

        # Operating expenses
        total_opex = inputs.property_expenses + inputs.general_admin

        # EBITDA
        ebitda = total_revenue - total_opex

        # Net Operating Income
        noi = inputs.total_noi or (rental_revenue - inputs.property_expenses)

        # EBIT
        ebit = ebitda - inputs.depreciation

        # Interest expense
        interest = inputs.interest_expense or (inputs.total_debt * inputs.weighted_avg_interest_rate)

        # Pre-tax income
        pretax_income = ebit - interest + inputs.gain_loss_on_sale

        # Net income (REITs typically have minimal taxes if compliant)
        net_income = pretax_income * 0.98  # Small amount for retained earnings

        # FFO Calculation (NAREIT definition)
        ffo = (
            net_income
            + inputs.depreciation  # Add back real estate depreciation
            - inputs.gain_loss_on_sale  # Exclude gains/losses on property sales
            + inputs.non_cash_items  # Add back other non-cash items
        )

        # AFFO Calculation
        affo = (
            ffo
            - inputs.straight_line_rent_adjustment
            - inputs.above_below_market_lease_amort
            - inputs.recurring_capex
            - inputs.tenant_improvements
            - inputs.leasing_commissions
        )

        # Per share metrics
        shares = inputs.shares_outstanding
        ffo_per_share = ffo / shares if shares > 0 else 0
        affo_per_share = affo / shares if shares > 0 else 0

        # Multiples
        price = inputs.current_share_price
        price_to_ffo = price / ffo_per_share if ffo_per_share > 0 else 0
        price_to_affo = price / affo_per_share if affo_per_share > 0 else 0

        return {
            "total_revenue": total_revenue,
            "noi": noi,
            "ebitda": ebitda,
            "ebit": ebit,
            "interest_expense": interest,
            "net_income": net_income,
            "depreciation": inputs.depreciation,
            "ffo": ffo,
            "affo": affo,
            "ffo_per_share": ffo_per_share,
            "affo_per_share": affo_per_share,
            "price_to_ffo": price_to_ffo,
            "price_to_affo": price_to_affo,
            "ffo_margin": ffo / total_revenue if total_revenue > 0 else 0,
            "affo_margin": affo / total_revenue if total_revenue > 0 else 0,
        }

    def _calculate_dividend_metrics(self, ffo_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate dividend and yield metrics."""
        inputs = self.inputs

        affo = ffo_metrics["affo"]
        affo_per_share = ffo_metrics["affo_per_share"]

        # Target dividend based on payout ratio
        total_dividend = affo * inputs.target_payout_ratio
        dividend_per_share = total_dividend / inputs.shares_outstanding

        # Yield calculations
        current_yield = dividend_per_share / inputs.current_share_price if inputs.current_share_price > 0 else 0

        # REIT requirement check
        minimum_required_dividend = affo * inputs.minimum_distribution_requirement
        excess_coverage = total_dividend - minimum_required_dividend

        # Payout ratios
        ffo_payout_ratio = total_dividend / ffo_metrics["ffo"] if ffo_metrics["ffo"] > 0 else 0
        affo_payout_ratio = total_dividend / affo if affo > 0 else 0

        return {
            "annual_dividend": total_dividend,
            "dividend_per_share": dividend_per_share,
            "quarterly_dividend_per_share": dividend_per_share / 4,
            "current_yield": current_yield,
            "ffo_payout_ratio": ffo_payout_ratio,
            "affo_payout_ratio": affo_payout_ratio,
            "minimum_required_dividend": minimum_required_dividend,
            "excess_coverage": excess_coverage,
            "dividend_coverage_ratio": affo / total_dividend if total_dividend > 0 else 0,
            "meets_reit_requirement": affo_payout_ratio >= 0.90,
        }

    def _calculate_valuation_metrics(self, portfolio: Dict[str, Any], ffo_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate valuation metrics and implied values."""
        inputs = self.inputs

        # Market cap
        market_cap = inputs.shares_outstanding * inputs.current_share_price

        # Enterprise value
        enterprise_value = market_cap + inputs.total_debt

        # Implied cap rate (EV / NOI)
        implied_cap_rate = portfolio["total_noi"] / enterprise_value if enterprise_value > 0 else 0

        # EV multiples
        ev_to_noi = enterprise_value / portfolio["total_noi"] if portfolio["total_noi"] > 0 else 0
        ev_to_ebitda = enterprise_value / ffo_metrics["ebitda"] if ffo_metrics["ebitda"] > 0 else 0

        # Peer comparison metrics
        ffo_multiple = inputs.current_share_price / ffo_metrics["ffo_per_share"] if ffo_metrics["ffo_per_share"] > 0 else 0
        affo_multiple = inputs.current_share_price / ffo_metrics["affo_per_share"] if ffo_metrics["affo_per_share"] > 0 else 0

        # Implied value at different cap rates
        implied_values = {}
        for cap_rate in [0.05, 0.055, 0.06, 0.065, 0.07, 0.075]:
            implied_ev = portfolio["total_noi"] / cap_rate
            implied_equity = implied_ev - inputs.total_debt
            implied_share_price = implied_equity / inputs.shares_outstanding
            implied_values[f"{cap_rate:.1%}"] = {
                "enterprise_value": implied_ev,
                "equity_value": implied_equity,
                "share_price": implied_share_price,
                "upside": (implied_share_price / inputs.current_share_price - 1) if inputs.current_share_price > 0 else 0,
            }

        return {
            "market_cap": market_cap,
            "enterprise_value": enterprise_value,
            "implied_cap_rate": implied_cap_rate,
            "ev_to_noi": ev_to_noi,
            "ev_to_ebitda": ev_to_ebitda,
            "ffo_multiple": ffo_multiple,
            "affo_multiple": affo_multiple,
            "implied_values_by_cap_rate": implied_values,
        }

    def _calculate_nav(self, portfolio: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate Net Asset Value (NAV)."""
        inputs = self.inputs

        # Gross asset value
        if inputs.properties:
            # Value each property at its implied cap rate
            gross_real_estate_value = sum(p.market_value for p in inputs.properties)
        else:
            # Use NOI and cap rate
            gross_real_estate_value = portfolio["total_noi"] / inputs.exit_cap_rate

        # Other assets (cash, receivables, etc.)
        other_assets = inputs.total_assets - inputs.total_real_estate if inputs.total_assets > 0 else 0

        # Total gross asset value
        total_gav = gross_real_estate_value + other_assets

        # Liabilities
        total_debt = inputs.total_debt
        other_liabilities = 0  # Could add accounts payable, etc.

        # NAV
        nav = total_gav - total_debt - other_liabilities

        # Per share
        nav_per_share = nav / inputs.shares_outstanding if inputs.shares_outstanding > 0 else 0

        # Premium/discount to NAV
        premium_discount = (inputs.current_share_price / nav_per_share - 1) if nav_per_share > 0 else 0

        return {
            "gross_real_estate_value": gross_real_estate_value,
            "other_assets": other_assets,
            "total_gross_asset_value": total_gav,
            "total_debt": total_debt,
            "other_liabilities": other_liabilities,
            "nav": nav,
            "nav_per_share": nav_per_share,
            "current_price": inputs.current_share_price,
            "premium_discount_to_nav": premium_discount,
            "trading_at_premium": premium_discount > 0,
        }

    def _calculate_capital_structure(self) -> Dict[str, Any]:
        """Analyze capital structure and leverage."""
        inputs = self.inputs

        # Total capitalization
        market_cap = inputs.shares_outstanding * inputs.current_share_price
        total_cap = market_cap + inputs.total_debt

        # Leverage ratios
        debt_to_total_cap = inputs.total_debt / total_cap if total_cap > 0 else 0
        debt_to_equity = inputs.total_debt / market_cap if market_cap > 0 else 0

        # Asset-based leverage
        total_assets = inputs.total_assets or (inputs.total_real_estate + inputs.total_debt * 0.1)
        debt_to_assets = inputs.total_debt / total_assets if total_assets > 0 else 0

        # Interest coverage
        noi = inputs.total_noi
        interest = inputs.total_debt * inputs.weighted_avg_interest_rate
        interest_coverage = noi / interest if interest > 0 else 0

        # Debt maturity profile
        if inputs.debt_facilities:
            total_principal = sum(d.principal for d in inputs.debt_facilities)
            weighted_maturity = sum(
                d.maturity_year * d.principal for d in inputs.debt_facilities
            ) / total_principal if total_principal > 0 else 0
            weighted_rate = sum(
                d.interest_rate * d.principal for d in inputs.debt_facilities
            ) / total_principal if total_principal > 0 else 0
        else:
            weighted_maturity = inputs.weighted_avg_maturity
            weighted_rate = inputs.weighted_avg_interest_rate

        return {
            "market_cap": market_cap,
            "total_debt": inputs.total_debt,
            "total_capitalization": total_cap,
            "debt_to_total_cap": debt_to_total_cap,
            "debt_to_equity": debt_to_equity,
            "debt_to_assets": debt_to_assets,
            "interest_coverage": interest_coverage,
            "weighted_avg_interest_rate": weighted_rate,
            "weighted_avg_maturity": weighted_maturity,
            "fixed_rate_debt_percent": self._calculate_fixed_rate_percent(),
        }

    def _calculate_fixed_rate_percent(self) -> float:
        """Calculate percentage of fixed rate debt."""
        inputs = self.inputs

        if not inputs.debt_facilities:
            return 0.80  # Default assumption

        total = sum(d.principal for d in inputs.debt_facilities)
        fixed = sum(d.principal for d in inputs.debt_facilities if d.is_fixed_rate)

        return fixed / total if total > 0 else 0

    def _calculate_projections(self, ffo_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Project key metrics over time."""
        inputs = self.inputs
        years = inputs.projection_years

        # Initialize projections
        noi_proj = []
        ffo_proj = []
        affo_proj = []
        dividend_proj = []
        share_price_proj = []

        base_noi = inputs.total_noi
        base_ffo = ffo_metrics["ffo"]
        base_affo = ffo_metrics["affo"]

        for year in range(1, years + 1):
            # NOI growth
            noi = base_noi * ((1 + inputs.noi_growth_rate) ** year)

            # Account for acquisitions/dispositions
            net_acquisition = inputs.acquisition_volume_annual - inputs.disposition_volume_annual
            acquisition_noi = net_acquisition * inputs.acquisition_cap_rate * year

            total_noi = noi + acquisition_noi

            # FFO growth (similar to NOI with some margin expansion)
            ffo = base_ffo * ((1 + inputs.noi_growth_rate * 1.05) ** year)

            # AFFO (slightly lower growth due to capex)
            affo = base_affo * ((1 + inputs.noi_growth_rate * 0.95) ** year)

            # Dividend (based on payout ratio)
            dividend = affo * inputs.target_payout_ratio

            # Implied share price (using terminal multiple)
            ffo_per_share = ffo / inputs.shares_outstanding
            implied_price = ffo_per_share * ffo_metrics["price_to_ffo"]

            noi_proj.append(total_noi)
            ffo_proj.append(ffo)
            affo_proj.append(affo)
            dividend_proj.append(dividend)
            share_price_proj.append(implied_price)

        # Calculate growth rates
        ffo_cagr = ((ffo_proj[-1] / base_ffo) ** (1 / years) - 1) if base_ffo > 0 else 0
        affo_cagr = ((affo_proj[-1] / base_affo) ** (1 / years) - 1) if base_affo > 0 else 0

        return {
            "noi": noi_proj,
            "ffo": ffo_proj,
            "affo": affo_proj,
            "dividends": dividend_proj,
            "implied_share_prices": share_price_proj,
            "ffo_cagr": ffo_cagr,
            "affo_cagr": affo_cagr,
            "terminal_ffo": ffo_proj[-1] if ffo_proj else 0,
            "terminal_affo": affo_proj[-1] if affo_proj else 0,
        }

    def run_sensitivity(
        self,
        variable: str,
        values: List[float],
        output_metric: str = "nav.nav_per_share"
    ) -> Dict[str, List[float]]:
        """Run sensitivity analysis."""
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
        """Get nested dictionary value using dot notation."""
        keys = path.split(".")
        value = data
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None
        return value
