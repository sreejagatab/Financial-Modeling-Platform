"""
Net Asset Value (NAV) Model

Calculates NAV for asset-heavy companies including real estate,
investment companies, holding companies, and conglomerates.
Supports sum-of-the-parts valuation methodology.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum

from core.engine.base_model import BaseFinancialModel, CalculationResult


class AssetType(str, Enum):
    """Types of assets in NAV calculation."""
    REAL_ESTATE = "real_estate"
    OPERATING_BUSINESS = "operating_business"
    INVESTMENT = "investment"
    CASH = "cash"
    RECEIVABLES = "receivables"
    INVENTORY = "inventory"
    PP_E = "property_plant_equipment"
    INTANGIBLES = "intangibles"
    EQUITY_STAKE = "equity_stake"
    DEBT_INVESTMENT = "debt_investment"
    OTHER = "other"


class ValuationMethod(str, Enum):
    """Valuation methods for assets."""
    MARKET_VALUE = "market_value"  # Observed market price
    APPRAISAL = "appraisal"  # Third-party appraisal
    INCOME = "income"  # DCF / Income approach
    COMPARABLE = "comparable"  # Comparable transactions
    BOOK_VALUE = "book_value"  # Accounting book value
    REPLACEMENT_COST = "replacement_cost"


@dataclass
class NAVAsset:
    """Individual asset in NAV calculation."""
    name: str
    asset_type: AssetType
    description: str = ""

    # Value inputs
    book_value: float = 0
    market_value: Optional[float] = None
    valuation_method: ValuationMethod = ValuationMethod.BOOK_VALUE

    # For income-producing assets
    annual_income: float = 0  # NOI, EBITDA, or cash flow
    cap_rate: float = 0.06  # For real estate
    ebitda_multiple: float = 0  # For operating businesses

    # For equity stakes
    ownership_percent: float = 1.0
    underlying_value: float = 0

    # Adjustments
    discount_rate: float = 0  # Illiquidity discount, etc.
    premium_rate: float = 0  # Control premium, etc.

    # Metadata
    last_valuation_date: str = ""
    confidence_level: str = "medium"  # low, medium, high


@dataclass
class NAVLiability:
    """Liability in NAV calculation."""
    name: str
    book_value: float
    market_value: Optional[float] = None
    maturity_years: float = 0
    interest_rate: float = 0
    is_recourse: bool = True
    is_secured: bool = False
    secured_by: str = ""


@dataclass
class NAVInputs:
    """Inputs for NAV model."""
    # Company info
    company_name: str = ""
    shares_outstanding: float = 100_000_000
    current_share_price: float = 0
    valuation_date: str = ""

    # Assets
    assets: List[NAVAsset] = field(default_factory=list)

    # Simplified inputs (if detailed assets not provided)
    total_real_estate: float = 0
    total_investments: float = 0
    total_operating_businesses: float = 0
    cash_and_equivalents: float = 0
    other_assets: float = 0

    # Liabilities
    liabilities: List[NAVLiability] = field(default_factory=list)

    # Simplified liability inputs
    total_debt: float = 0
    other_liabilities: float = 0
    preferred_stock: float = 0
    minority_interest: float = 0

    # Adjustment factors
    holding_company_discount: float = 0.10  # Typical 10-15% discount
    liquidity_discount: float = 0
    control_premium: float = 0

    # G&A burden
    annual_ga_expenses: float = 0
    ga_capitalization_multiple: float = 10  # Years to capitalize G&A

    # Tax considerations
    embedded_tax_liability: float = 0  # Unrealized gains tax
    tax_rate: float = 0.25
    nol_carryforward: float = 0


class NAVModel(BaseFinancialModel):
    """Net Asset Value calculation model."""

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self.inputs: Optional[NAVInputs] = None

    def set_inputs(self, inputs: NAVInputs) -> None:
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

        # Must have either detailed assets or simplified totals
        has_detailed = len(self.inputs.assets) > 0
        has_simplified = (
            self.inputs.total_real_estate > 0 or
            self.inputs.total_investments > 0 or
            self.inputs.cash_and_equivalents > 0
        )

        if not has_detailed and not has_simplified:
            errors.append("Asset values required (either detailed or simplified)")

        return (len(errors) == 0, errors)

    def get_key_outputs(self) -> Dict[str, Any]:
        """Get the key output metrics for NAV calculation."""
        if not self.outputs:
            return {}
        return {
            "nav": self.outputs.get("nav_calculation", {}).get("net_asset_value", 0),
            "nav_per_share": self.outputs.get("per_share_metrics", {}).get("nav_per_share", 0),
            "gross_asset_value": self.outputs.get("nav_calculation", {}).get("gross_asset_value", 0),
            "total_liabilities": self.outputs.get("nav_calculation", {}).get("total_liabilities", 0),
            "premium_discount_to_nav": self.outputs.get("per_share_metrics", {}).get("premium_discount_to_nav", 0),
        }

    def calculate(self) -> CalculationResult:
        """Calculate NAV."""
        is_valid, errors = self.validate_inputs()
        if not is_valid:
            return CalculationResult(success=False, errors=errors, outputs={})

        try:
            outputs = self._calculate_nav()
            self.outputs = outputs
            return CalculationResult(success=True, errors=[], outputs=outputs)
        except Exception as e:
            return CalculationResult(success=False, errors=[str(e)], outputs={})

    def _calculate_nav(self) -> Dict[str, Any]:
        """Calculate all NAV components."""
        inputs = self.inputs

        # Asset valuation
        assets = self._value_assets()

        # Liability valuation
        liabilities = self._value_liabilities()

        # NAV calculation
        nav = self._calculate_nav_components(assets, liabilities)

        # Per share metrics
        per_share = self._calculate_per_share_metrics(nav)

        # Sensitivity analysis
        sensitivity = self._calculate_nav_sensitivity(assets, liabilities)

        # Sum of parts breakdown
        sotp = self._calculate_sotp_breakdown(assets)

        return {
            "asset_valuation": assets,
            "liability_valuation": liabilities,
            "nav_calculation": nav,
            "per_share_metrics": per_share,
            "sensitivity": sensitivity,
            "sotp_breakdown": sotp,
        }

    def _value_assets(self) -> Dict[str, Any]:
        """Value all assets."""
        inputs = self.inputs

        asset_values = []
        by_type = {}

        if inputs.assets:
            for asset in inputs.assets:
                value = self._value_single_asset(asset)
                asset_values.append(value)

                # Aggregate by type
                asset_type = asset.asset_type.value
                if asset_type not in by_type:
                    by_type[asset_type] = {
                        "count": 0,
                        "book_value": 0,
                        "market_value": 0,
                        "adjusted_value": 0,
                    }
                by_type[asset_type]["count"] += 1
                by_type[asset_type]["book_value"] += value["book_value"]
                by_type[asset_type]["market_value"] += value["market_value"]
                by_type[asset_type]["adjusted_value"] += value["adjusted_value"]

            total_book = sum(v["book_value"] for v in asset_values)
            total_market = sum(v["market_value"] for v in asset_values)
            total_adjusted = sum(v["adjusted_value"] for v in asset_values)
        else:
            # Use simplified inputs
            total_book = (
                inputs.total_real_estate +
                inputs.total_investments +
                inputs.total_operating_businesses +
                inputs.cash_and_equivalents +
                inputs.other_assets
            )
            total_market = total_book  # Assume book = market for simplified
            total_adjusted = total_book

            by_type = {
                "real_estate": {
                    "count": 1,
                    "book_value": inputs.total_real_estate,
                    "market_value": inputs.total_real_estate,
                    "adjusted_value": inputs.total_real_estate,
                },
                "investment": {
                    "count": 1,
                    "book_value": inputs.total_investments,
                    "market_value": inputs.total_investments,
                    "adjusted_value": inputs.total_investments,
                },
                "operating_business": {
                    "count": 1,
                    "book_value": inputs.total_operating_businesses,
                    "market_value": inputs.total_operating_businesses,
                    "adjusted_value": inputs.total_operating_businesses,
                },
                "cash": {
                    "count": 1,
                    "book_value": inputs.cash_and_equivalents,
                    "market_value": inputs.cash_and_equivalents,
                    "adjusted_value": inputs.cash_and_equivalents,
                },
            }

        return {
            "individual_assets": asset_values,
            "by_type": by_type,
            "total_book_value": total_book,
            "total_market_value": total_market,
            "total_adjusted_value": total_adjusted,
            "book_to_market_ratio": total_book / total_market if total_market > 0 else 0,
        }

    def _value_single_asset(self, asset: NAVAsset) -> Dict[str, Any]:
        """Value a single asset."""
        # Determine market value based on valuation method
        if asset.market_value is not None:
            market_value = asset.market_value
        elif asset.valuation_method == ValuationMethod.INCOME:
            if asset.cap_rate > 0 and asset.annual_income > 0:
                market_value = asset.annual_income / asset.cap_rate
            elif asset.ebitda_multiple > 0 and asset.annual_income > 0:
                market_value = asset.annual_income * asset.ebitda_multiple
            else:
                market_value = asset.book_value
        elif asset.valuation_method == ValuationMethod.BOOK_VALUE:
            market_value = asset.book_value
        else:
            market_value = asset.book_value

        # Apply ownership percentage
        attributable_value = market_value * asset.ownership_percent

        # Apply discounts/premiums
        discount_factor = 1 - asset.discount_rate
        premium_factor = 1 + asset.premium_rate
        adjusted_value = attributable_value * discount_factor * premium_factor

        return {
            "name": asset.name,
            "asset_type": asset.asset_type.value,
            "book_value": asset.book_value,
            "market_value": market_value,
            "ownership_percent": asset.ownership_percent,
            "attributable_value": attributable_value,
            "discount_applied": asset.discount_rate,
            "premium_applied": asset.premium_rate,
            "adjusted_value": adjusted_value,
            "valuation_method": asset.valuation_method.value,
        }

    def _value_liabilities(self) -> Dict[str, Any]:
        """Value all liabilities."""
        inputs = self.inputs

        liability_values = []

        if inputs.liabilities:
            for liability in inputs.liabilities:
                value = self._value_single_liability(liability)
                liability_values.append(value)

            total_book = sum(v["book_value"] for v in liability_values)
            total_market = sum(v["market_value"] for v in liability_values)
        else:
            total_book = inputs.total_debt + inputs.other_liabilities
            total_market = total_book

        # Add other liability items
        total_book += inputs.preferred_stock + inputs.minority_interest
        total_market += inputs.preferred_stock + inputs.minority_interest

        return {
            "individual_liabilities": liability_values,
            "total_debt": inputs.total_debt,
            "other_liabilities": inputs.other_liabilities,
            "preferred_stock": inputs.preferred_stock,
            "minority_interest": inputs.minority_interest,
            "total_book_value": total_book,
            "total_market_value": total_market,
        }

    def _value_single_liability(self, liability: NAVLiability) -> Dict[str, Any]:
        """Value a single liability."""
        if liability.market_value is not None:
            market_value = liability.market_value
        else:
            # Simple market value approximation
            market_value = liability.book_value

        return {
            "name": liability.name,
            "book_value": liability.book_value,
            "market_value": market_value,
            "maturity_years": liability.maturity_years,
            "interest_rate": liability.interest_rate,
            "is_recourse": liability.is_recourse,
        }

    def _calculate_nav_components(self, assets: Dict[str, Any], liabilities: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate NAV with all components."""
        inputs = self.inputs

        # Gross Asset Value
        gav = assets["total_adjusted_value"]

        # Less: Liabilities
        total_liabilities = liabilities["total_market_value"]

        # Less: G&A burden (capitalized corporate overhead)
        ga_burden = inputs.annual_ga_expenses * inputs.ga_capitalization_multiple

        # Less: Embedded tax liability
        tax_liability = inputs.embedded_tax_liability

        # Add: NOL benefit
        nol_benefit = inputs.nol_carryforward * inputs.tax_rate

        # Pre-discount NAV
        pre_discount_nav = gav - total_liabilities - ga_burden - tax_liability + nol_benefit

        # Apply holding company discount
        holding_discount_amount = pre_discount_nav * inputs.holding_company_discount

        # Final NAV
        nav = pre_discount_nav - holding_discount_amount

        return {
            "gross_asset_value": gav,
            "total_liabilities": total_liabilities,
            "ga_burden": ga_burden,
            "embedded_tax_liability": tax_liability,
            "nol_benefit": nol_benefit,
            "pre_discount_nav": pre_discount_nav,
            "holding_company_discount": inputs.holding_company_discount,
            "holding_discount_amount": holding_discount_amount,
            "net_asset_value": nav,
        }

    def _calculate_per_share_metrics(self, nav: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate per share metrics."""
        inputs = self.inputs
        shares = inputs.shares_outstanding

        nav_value = nav["net_asset_value"]
        nav_per_share = nav_value / shares if shares > 0 else 0

        # Pre-discount NAV per share
        pre_discount_nav_per_share = nav["pre_discount_nav"] / shares if shares > 0 else 0

        # Premium/discount to current price
        current_price = inputs.current_share_price
        if current_price > 0 and nav_per_share > 0:
            premium_discount = (current_price / nav_per_share) - 1
        else:
            premium_discount = 0

        # GAV per share
        gav_per_share = nav["gross_asset_value"] / shares if shares > 0 else 0

        return {
            "nav_per_share": nav_per_share,
            "pre_discount_nav_per_share": pre_discount_nav_per_share,
            "gav_per_share": gav_per_share,
            "current_share_price": current_price,
            "premium_discount_to_nav": premium_discount,
            "trading_at_premium": premium_discount > 0,
            "implied_discount_at_current_price": 1 - (current_price / pre_discount_nav_per_share) if pre_discount_nav_per_share > 0 else 0,
            "upside_to_nav": (nav_per_share / current_price - 1) if current_price > 0 else 0,
        }

    def _calculate_nav_sensitivity(self, assets: Dict[str, Any], liabilities: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate NAV sensitivity to key assumptions."""
        inputs = self.inputs
        base_nav = assets["total_adjusted_value"] - liabilities["total_market_value"]

        # Sensitivity to holding company discount
        discount_sensitivities = {}
        for discount in [0.0, 0.05, 0.10, 0.15, 0.20, 0.25]:
            adj_nav = base_nav * (1 - discount)
            nav_per_share = adj_nav / inputs.shares_outstanding
            discount_sensitivities[f"{discount:.0%}"] = {
                "nav": adj_nav,
                "nav_per_share": nav_per_share,
            }

        # Sensitivity to asset value changes
        asset_sensitivities = {}
        for change in [-0.20, -0.10, -0.05, 0, 0.05, 0.10, 0.20]:
            adj_assets = assets["total_adjusted_value"] * (1 + change)
            adj_nav = adj_assets - liabilities["total_market_value"]
            adj_nav = adj_nav * (1 - inputs.holding_company_discount)
            nav_per_share = adj_nav / inputs.shares_outstanding
            asset_sensitivities[f"{change:+.0%}"] = {
                "nav": adj_nav,
                "nav_per_share": nav_per_share,
            }

        return {
            "holding_company_discount_sensitivity": discount_sensitivities,
            "asset_value_sensitivity": asset_sensitivities,
        }

    def _calculate_sotp_breakdown(self, assets: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate sum-of-the-parts breakdown."""
        inputs = self.inputs
        shares = inputs.shares_outstanding

        by_type = assets["by_type"]
        total_value = assets["total_adjusted_value"]

        breakdown = {}
        for asset_type, values in by_type.items():
            adj_value = values["adjusted_value"]
            breakdown[asset_type] = {
                "value": adj_value,
                "per_share": adj_value / shares if shares > 0 else 0,
                "percent_of_total": adj_value / total_value if total_value > 0 else 0,
            }

        # Add liabilities as negative
        total_liabilities = inputs.total_debt + inputs.other_liabilities + inputs.preferred_stock
        breakdown["less_liabilities"] = {
            "value": -total_liabilities,
            "per_share": -total_liabilities / shares if shares > 0 else 0,
            "percent_of_total": -total_liabilities / total_value if total_value > 0 else 0,
        }

        return breakdown

    def run_sensitivity(
        self,
        variable: str,
        values: List[float],
        output_metric: str = "nav_calculation.net_asset_value"
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
        """Get nested dictionary value using dot notation."""
        keys = path.split(".")
        value = data
        for key in keys:
            if isinstance(value, dict):
                value = value.get(key)
            else:
                return None
        return value
