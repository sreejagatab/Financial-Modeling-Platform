"""
Reverse Morris Trust (RMT) Financial Model

Analyzes Reverse Morris Trust transactions - tax-efficient structures
combining a spin-off with a merger where the parent's shareholders
end up owning majority of the combined company.

Key requirements:
- Parent must spin off subsidiary tax-free (Section 355)
- Immediately merge with acquirer
- Parent shareholders must own >50% of combined company
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from enum import Enum

from core.engine.base_model import BaseFinancialModel, CalculationResult


class MergerConsideration(str, Enum):
    """Types of merger consideration."""
    ALL_STOCK = "all_stock"
    STOCK_AND_CASH = "stock_and_cash"
    CASH = "cash"  # Would make it taxable


@dataclass
class CompanyProfile:
    """Financial profile of a company."""
    name: str
    revenue: float = 0
    ebitda: float = 0
    ebit: float = 0
    net_income: float = 0
    total_assets: float = 0
    total_debt: float = 0
    cash: float = 0
    shares_outstanding: float = 0
    share_price: float = 0
    tax_basis: float = 0  # Tax basis in assets


@dataclass
class RMTInputs:
    """Inputs for RMT analysis."""
    # Parent company (distributing shareholder)
    parent: Optional[CompanyProfile] = None
    parent_name: str = "ParentCo"
    parent_revenue: float = 0
    parent_ebitda: float = 0
    parent_shares: float = 0
    parent_share_price: float = 0

    # SpinCo (subsidiary being spun off)
    spinco: Optional[CompanyProfile] = None
    spinco_name: str = "SpinCo"
    spinco_revenue: float = 0
    spinco_ebitda: float = 0
    spinco_assets: float = 0
    spinco_debt: float = 0
    spinco_tax_basis: float = 0

    # Acquirer (merger partner)
    acquirer: Optional[CompanyProfile] = None
    acquirer_name: str = "AcquirerCo"
    acquirer_revenue: float = 0
    acquirer_ebitda: float = 0
    acquirer_shares: float = 0
    acquirer_share_price: float = 0
    acquirer_debt: float = 0

    # Transaction structure
    consideration_type: MergerConsideration = MergerConsideration.ALL_STOCK
    cash_component: float = 0  # Cash paid by acquirer
    exchange_ratio: float = 0  # SpinCo shares per Acquirer share (if not calculated)

    # Valuation assumptions
    spinco_ebitda_multiple: float = 8.0
    acquirer_ebitda_multiple: float = 10.0
    combined_ebitda_multiple: float = 9.0

    # Synergies
    revenue_synergies: float = 0
    cost_synergies: float = 0
    synergy_phase_in_years: int = 3

    # Parent shareholder minimum ownership (must be >50% for tax-free)
    target_parent_ownership: float = 0.51  # 51% minimum

    # Tax assumptions
    corporate_tax_rate: float = 0.25
    capital_gains_rate: float = 0.20
    built_in_gains: float = 0  # Unrealized gains in SpinCo assets

    # Transaction costs
    advisory_fees: float = 0
    legal_fees: float = 0
    other_transaction_costs: float = 0

    # Debt refinancing
    debt_refinancing_amount: float = 0
    new_debt_rate: float = 0.05

    # Projection assumptions
    projection_years: int = 5
    revenue_growth_rate: float = 0.03
    margin_improvement: float = 0.01  # Annual margin improvement from synergies


class RMTModel(BaseFinancialModel):
    """Reverse Morris Trust transaction analysis model."""

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self.inputs: Optional[RMTInputs] = None

    def set_inputs(self, inputs: RMTInputs) -> None:
        """Set model inputs."""
        self.inputs = inputs

    def validate_inputs(self) -> tuple[bool, List[str]]:
        """Validate model inputs."""
        errors = []

        if not self.inputs:
            errors.append("No inputs provided")
            return (False, errors)

        # Check for required data
        has_spinco = self.inputs.spinco is not None or self.inputs.spinco_ebitda > 0
        has_acquirer = self.inputs.acquirer is not None or self.inputs.acquirer_ebitda > 0

        if not has_spinco:
            errors.append("SpinCo financial data required")

        if not has_acquirer:
            errors.append("Acquirer financial data required")

        # RMT requirement: parent shareholders must own >50%
        if self.inputs.target_parent_ownership <= 0.50:
            errors.append("Parent shareholder ownership must exceed 50% for tax-free treatment")

        return (len(errors) == 0, errors)

    def get_key_outputs(self) -> Dict[str, Any]:
        """Get the key output metrics for RMT analysis."""
        if not self.outputs:
            return {}
        return {
            "parent_ownership": self.outputs.get("ownership_analysis", {}).get("parent_shareholder_ownership", 0),
            "combined_equity_value": self.outputs.get("valuation", {}).get("combined_equity_value", 0),
            "tax_savings": self.outputs.get("tax_analysis", {}).get("total_tax_savings", 0),
            "total_synergies": self.outputs.get("synergy_analysis", {}).get("total_synergies_npv", 0),
            "accretion_dilution": self.outputs.get("accretion_dilution", {}).get("accretion_dilution_percent", 0),
        }

    def calculate(self) -> CalculationResult:
        """Run the RMT analysis."""
        is_valid, errors = self.validate_inputs()
        if not is_valid:
            return CalculationResult(success=False, errors=errors, outputs={})

        try:
            outputs = self._calculate_rmt()
            self.outputs = outputs
            return CalculationResult(success=True, errors=[], outputs=outputs)
        except Exception as e:
            return CalculationResult(success=False, errors=[str(e)], outputs={})

    def _calculate_rmt(self) -> Dict[str, Any]:
        """Calculate all RMT metrics."""
        inputs = self.inputs

        # Extract company data
        companies = self._extract_company_data()

        # Valuation analysis
        valuation = self._calculate_valuation(companies)

        # Ownership analysis
        ownership = self._calculate_ownership(companies, valuation)

        # Tax analysis
        tax = self._calculate_tax_analysis(companies)

        # Synergy analysis
        synergies = self._calculate_synergy_analysis(companies)

        # Accretion/dilution
        accretion = self._calculate_accretion_dilution(companies, valuation, synergies)

        # Pro-forma combined
        proforma = self._calculate_proforma(companies, synergies)

        # Transaction structure
        structure = self._calculate_transaction_structure(companies, valuation, ownership)

        # Projections
        projections = self._calculate_projections(proforma, synergies)

        return {
            "transaction_summary": {
                "spinco_name": inputs.spinco_name,
                "acquirer_name": inputs.acquirer_name,
                "consideration_type": inputs.consideration_type.value,
                "is_tax_free": ownership["qualifies_as_tax_free"],
            },
            "company_data": companies,
            "valuation": valuation,
            "ownership_analysis": ownership,
            "tax_analysis": tax,
            "synergy_analysis": synergies,
            "accretion_dilution": accretion,
            "proforma_combined": proforma,
            "transaction_structure": structure,
            "projections": projections,
            "years": list(range(1, inputs.projection_years + 1)),
        }

    def _extract_company_data(self) -> Dict[str, Any]:
        """Extract and normalize company financial data."""
        inputs = self.inputs

        # SpinCo data
        if inputs.spinco:
            spinco = {
                "name": inputs.spinco.name,
                "revenue": inputs.spinco.revenue,
                "ebitda": inputs.spinco.ebitda,
                "net_income": inputs.spinco.net_income,
                "assets": inputs.spinco.total_assets,
                "debt": inputs.spinco.total_debt,
                "cash": inputs.spinco.cash,
                "tax_basis": inputs.spinco.tax_basis,
            }
        else:
            spinco = {
                "name": inputs.spinco_name,
                "revenue": inputs.spinco_revenue,
                "ebitda": inputs.spinco_ebitda,
                "net_income": inputs.spinco_ebitda * 0.6,  # Estimate
                "assets": inputs.spinco_assets,
                "debt": inputs.spinco_debt,
                "cash": 0,
                "tax_basis": inputs.spinco_tax_basis,
            }

        # Acquirer data
        if inputs.acquirer:
            acquirer = {
                "name": inputs.acquirer.name,
                "revenue": inputs.acquirer.revenue,
                "ebitda": inputs.acquirer.ebitda,
                "net_income": inputs.acquirer.net_income,
                "shares": inputs.acquirer.shares_outstanding,
                "share_price": inputs.acquirer.share_price,
                "debt": inputs.acquirer.total_debt,
                "cash": inputs.acquirer.cash,
            }
        else:
            acquirer = {
                "name": inputs.acquirer_name,
                "revenue": inputs.acquirer_revenue,
                "ebitda": inputs.acquirer_ebitda,
                "net_income": inputs.acquirer_ebitda * 0.6,  # Estimate
                "shares": inputs.acquirer_shares,
                "share_price": inputs.acquirer_share_price,
                "debt": inputs.acquirer_debt,
                "cash": 0,
            }

        # Parent data
        if inputs.parent:
            parent = {
                "name": inputs.parent.name,
                "shares": inputs.parent.shares_outstanding,
                "share_price": inputs.parent.share_price,
            }
        else:
            parent = {
                "name": inputs.parent_name,
                "shares": inputs.parent_shares,
                "share_price": inputs.parent_share_price,
            }

        # Market caps
        acquirer["market_cap"] = acquirer["shares"] * acquirer["share_price"]
        acquirer["equity_value"] = acquirer["market_cap"]
        acquirer["enterprise_value"] = acquirer["equity_value"] + acquirer["debt"] - acquirer["cash"]

        return {
            "spinco": spinco,
            "acquirer": acquirer,
            "parent": parent,
        }

    def _calculate_valuation(self, companies: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate valuations for all parties."""
        inputs = self.inputs

        spinco = companies["spinco"]
        acquirer = companies["acquirer"]

        # SpinCo valuation
        spinco_ev = spinco["ebitda"] * inputs.spinco_ebitda_multiple
        spinco_equity = spinco_ev - spinco["debt"] + spinco.get("cash", 0)

        # Acquirer valuation
        acquirer_ev = acquirer["ebitda"] * inputs.acquirer_ebitda_multiple
        acquirer_equity = acquirer["equity_value"]

        # Combined valuation (pre-synergies)
        combined_ebitda = spinco["ebitda"] + acquirer["ebitda"]
        combined_ev = combined_ebitda * inputs.combined_ebitda_multiple
        combined_debt = spinco["debt"] + acquirer["debt"]
        combined_equity = combined_ev - combined_debt

        # Premium/discount analysis
        implied_premium = (spinco_ev / (spinco["ebitda"] * inputs.acquirer_ebitda_multiple) - 1) if spinco["ebitda"] > 0 else 0

        return {
            "spinco_enterprise_value": spinco_ev,
            "spinco_equity_value": spinco_equity,
            "spinco_ebitda_multiple": inputs.spinco_ebitda_multiple,
            "acquirer_enterprise_value": acquirer_ev,
            "acquirer_equity_value": acquirer_equity,
            "acquirer_ebitda_multiple": inputs.acquirer_ebitda_multiple,
            "combined_enterprise_value": combined_ev,
            "combined_equity_value": combined_equity,
            "combined_ebitda": combined_ebitda,
            "combined_ebitda_multiple": inputs.combined_ebitda_multiple,
            "implied_premium": implied_premium,
        }

    def _calculate_ownership(self, companies: Dict[str, Any], valuation: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate post-merger ownership structure."""
        inputs = self.inputs

        spinco_equity = valuation["spinco_equity_value"]
        acquirer_equity = valuation["acquirer_equity_value"]

        # Total equity value
        total_equity = spinco_equity + acquirer_equity - inputs.cash_component

        # Ownership percentages
        parent_ownership = spinco_equity / total_equity if total_equity > 0 else 0
        acquirer_ownership = 1 - parent_ownership

        # Check tax-free qualification
        qualifies = parent_ownership > 0.50

        # Shares calculation
        acquirer_shares = companies["acquirer"]["shares"]
        if inputs.exchange_ratio > 0:
            exchange_ratio = inputs.exchange_ratio
        else:
            # Calculate exchange ratio to achieve target ownership
            exchange_ratio = (spinco_equity / companies["acquirer"]["share_price"]) / acquirer_shares if acquirer_shares > 0 and companies["acquirer"]["share_price"] > 0 else 1

        new_shares_to_parent = acquirer_shares * exchange_ratio * (spinco_equity / acquirer_equity) if acquirer_equity > 0 else 0
        total_shares = acquirer_shares + new_shares_to_parent

        # Verify ownership
        calculated_parent_ownership = new_shares_to_parent / total_shares if total_shares > 0 else 0

        return {
            "parent_shareholder_ownership": parent_ownership,
            "acquirer_shareholder_ownership": acquirer_ownership,
            "qualifies_as_tax_free": qualifies,
            "ownership_threshold": 0.50,
            "ownership_cushion": parent_ownership - 0.50,
            "exchange_ratio": exchange_ratio,
            "new_shares_to_parent": new_shares_to_parent,
            "total_shares_post_merger": total_shares,
            "calculated_ownership_check": calculated_parent_ownership,
        }

    def _calculate_tax_analysis(self, companies: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze tax implications of RMT structure."""
        inputs = self.inputs

        spinco = companies["spinco"]

        # Built-in gains
        fair_value = spinco["assets"]
        tax_basis = spinco["tax_basis"] or spinco["assets"] * 0.5  # Estimate if not provided
        built_in_gain = max(0, fair_value - tax_basis)

        # Tax if sold outright (taxable transaction)
        tax_if_taxable = built_in_gain * inputs.corporate_tax_rate

        # Tax savings from RMT (tax-free spin + merger)
        tax_savings = tax_if_taxable

        # Shareholder level tax
        spinco_equity = spinco["ebitda"] * inputs.spinco_ebitda_multiple - spinco["debt"]
        shareholder_gain_if_taxable = spinco_equity * inputs.capital_gains_rate

        # Total tax efficiency
        total_tax_savings = tax_savings + shareholder_gain_if_taxable

        # Step-up analysis (acquirer's tax basis)
        acquirer_tax_basis = tax_basis  # Carryover basis in RMT

        return {
            "built_in_gain": built_in_gain,
            "tax_basis": tax_basis,
            "fair_market_value": fair_value,
            "corporate_tax_if_taxable": tax_if_taxable,
            "corporate_tax_savings": tax_savings,
            "shareholder_tax_if_taxable": shareholder_gain_if_taxable,
            "total_tax_savings": total_tax_savings,
            "acquirer_carryover_basis": acquirer_tax_basis,
            "tax_rate_used": inputs.corporate_tax_rate,
        }

    def _calculate_synergy_analysis(self, companies: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze expected synergies."""
        inputs = self.inputs

        # Total synergies
        revenue_synergies = inputs.revenue_synergies
        cost_synergies = inputs.cost_synergies
        total_synergies = revenue_synergies + cost_synergies

        # Phase-in schedule
        phase_in = []
        for year in range(1, inputs.synergy_phase_in_years + 1):
            realization = year / inputs.synergy_phase_in_years
            phase_in.append({
                "year": year,
                "realization_percent": realization,
                "revenue_synergies": revenue_synergies * realization,
                "cost_synergies": cost_synergies * realization,
                "total": total_synergies * realization,
            })

        # NPV of synergies
        discount_rate = 0.10  # Assume 10% discount rate
        npv_synergies = sum(
            (total_synergies * (i + 1) / inputs.synergy_phase_in_years) / ((1 + discount_rate) ** (i + 1))
            for i in range(inputs.synergy_phase_in_years)
        )

        # Add terminal value of run-rate synergies
        terminal_synergy_value = total_synergies / discount_rate
        terminal_pv = terminal_synergy_value / ((1 + discount_rate) ** inputs.synergy_phase_in_years)
        npv_synergies += terminal_pv

        # Synergies as % of combined EBITDA
        combined_ebitda = companies["spinco"]["ebitda"] + companies["acquirer"]["ebitda"]
        synergy_yield = total_synergies / combined_ebitda if combined_ebitda > 0 else 0

        return {
            "revenue_synergies": revenue_synergies,
            "cost_synergies": cost_synergies,
            "total_run_rate_synergies": total_synergies,
            "phase_in_schedule": phase_in,
            "phase_in_years": inputs.synergy_phase_in_years,
            "total_synergies_npv": npv_synergies,
            "synergy_yield": synergy_yield,
            "synergies_ebitda_multiple": npv_synergies / total_synergies if total_synergies > 0 else 0,
        }

    def _calculate_accretion_dilution(self, companies: Dict[str, Any], valuation: Dict[str, Any], synergies: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate accretion/dilution to acquirer EPS."""
        inputs = self.inputs

        acquirer = companies["acquirer"]
        spinco = companies["spinco"]

        # Pre-merger acquirer EPS
        acquirer_eps = acquirer["net_income"] / acquirer["shares"] if acquirer["shares"] > 0 else 0

        # Post-merger combined earnings
        combined_net_income = acquirer["net_income"] + spinco["net_income"]

        # Add synergies (after tax, phased in)
        year_1_synergies = synergies["total_run_rate_synergies"] / inputs.synergy_phase_in_years
        after_tax_synergies = year_1_synergies * (1 - inputs.corporate_tax_rate)
        combined_net_income_with_synergies = combined_net_income + after_tax_synergies

        # Post-merger shares
        new_shares = valuation["spinco_equity_value"] / acquirer["share_price"] if acquirer["share_price"] > 0 else 0
        total_shares = acquirer["shares"] + new_shares

        # Post-merger EPS
        post_merger_eps = combined_net_income / total_shares if total_shares > 0 else 0
        post_merger_eps_with_synergies = combined_net_income_with_synergies / total_shares if total_shares > 0 else 0

        # Accretion/dilution
        accretion_dilution = post_merger_eps - acquirer_eps
        accretion_dilution_percent = accretion_dilution / acquirer_eps if acquirer_eps > 0 else 0

        accretion_dilution_with_synergies = post_merger_eps_with_synergies - acquirer_eps
        accretion_dilution_percent_with_synergies = accretion_dilution_with_synergies / acquirer_eps if acquirer_eps > 0 else 0

        return {
            "acquirer_pre_merger_eps": acquirer_eps,
            "combined_net_income": combined_net_income,
            "post_merger_shares": total_shares,
            "post_merger_eps": post_merger_eps,
            "post_merger_eps_with_synergies": post_merger_eps_with_synergies,
            "accretion_dilution_amount": accretion_dilution,
            "accretion_dilution_percent": accretion_dilution_percent,
            "accretion_dilution_with_synergies_amount": accretion_dilution_with_synergies,
            "accretion_dilution_with_synergies_percent": accretion_dilution_percent_with_synergies,
            "is_accretive": accretion_dilution_percent > 0,
            "is_accretive_with_synergies": accretion_dilution_percent_with_synergies > 0,
        }

    def _calculate_proforma(self, companies: Dict[str, Any], synergies: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate pro-forma combined financials."""
        inputs = self.inputs

        spinco = companies["spinco"]
        acquirer = companies["acquirer"]

        # Combined financials
        combined_revenue = spinco["revenue"] + acquirer["revenue"]
        combined_ebitda = spinco["ebitda"] + acquirer["ebitda"]
        combined_debt = spinco["debt"] + acquirer["debt"]
        combined_cash = spinco.get("cash", 0) + acquirer.get("cash", 0)

        # With synergies (run-rate)
        combined_ebitda_with_synergies = combined_ebitda + synergies["total_run_rate_synergies"]

        # Margins
        combined_margin = combined_ebitda / combined_revenue if combined_revenue > 0 else 0
        combined_margin_with_synergies = combined_ebitda_with_synergies / combined_revenue if combined_revenue > 0 else 0

        # Leverage
        leverage = combined_debt / combined_ebitda if combined_ebitda > 0 else 0
        leverage_with_synergies = combined_debt / combined_ebitda_with_synergies if combined_ebitda_with_synergies > 0 else 0

        return {
            "combined_revenue": combined_revenue,
            "combined_ebitda": combined_ebitda,
            "combined_ebitda_with_synergies": combined_ebitda_with_synergies,
            "combined_debt": combined_debt,
            "combined_cash": combined_cash,
            "net_debt": combined_debt - combined_cash,
            "ebitda_margin": combined_margin,
            "ebitda_margin_with_synergies": combined_margin_with_synergies,
            "leverage_ratio": leverage,
            "leverage_with_synergies": leverage_with_synergies,
            "spinco_revenue_contribution": spinco["revenue"] / combined_revenue if combined_revenue > 0 else 0,
            "spinco_ebitda_contribution": spinco["ebitda"] / combined_ebitda if combined_ebitda > 0 else 0,
        }

    def _calculate_transaction_structure(self, companies: Dict[str, Any], valuation: Dict[str, Any], ownership: Dict[str, Any]) -> Dict[str, Any]:
        """Detail the transaction structure."""
        inputs = self.inputs

        total_costs = inputs.advisory_fees + inputs.legal_fees + inputs.other_transaction_costs

        return {
            "step_1_spinoff": {
                "description": f"Parent distributes {inputs.spinco_name} shares to shareholders",
                "is_tax_free": True,
                "requirement": "Must qualify under Section 355",
            },
            "step_2_merger": {
                "description": f"{inputs.spinco_name} merges with {inputs.acquirer_name}",
                "consideration": inputs.consideration_type.value,
                "exchange_ratio": ownership["exchange_ratio"],
                "cash_component": inputs.cash_component,
            },
            "result": {
                "parent_shareholders_receive": f"{ownership['parent_shareholder_ownership']:.1%} of combined company",
                "acquirer_shareholders_retain": f"{ownership['acquirer_shareholder_ownership']:.1%} of combined company",
            },
            "transaction_costs": {
                "advisory_fees": inputs.advisory_fees,
                "legal_fees": inputs.legal_fees,
                "other_costs": inputs.other_transaction_costs,
                "total_costs": total_costs,
                "costs_as_percent_of_deal": total_costs / valuation["spinco_equity_value"] if valuation["spinco_equity_value"] > 0 else 0,
            },
            "timeline_typical": "6-12 months from announcement to close",
            "key_approvals": ["Parent Board", "Acquirer Board", "IRS Private Letter Ruling (optional)", "SEC Filing", "Shareholder Votes"],
        }

    def _calculate_projections(self, proforma: Dict[str, Any], synergies: Dict[str, Any]) -> Dict[str, Any]:
        """Project combined financials."""
        inputs = self.inputs
        years = inputs.projection_years

        revenue_proj = []
        ebitda_proj = []
        synergy_proj = []

        base_revenue = proforma["combined_revenue"]
        base_ebitda = proforma["combined_ebitda"]
        run_rate_synergies = synergies["total_run_rate_synergies"]

        for year in range(1, years + 1):
            # Revenue growth
            revenue = base_revenue * ((1 + inputs.revenue_growth_rate) ** year)

            # Synergy realization
            if year <= inputs.synergy_phase_in_years:
                synergy_realized = run_rate_synergies * (year / inputs.synergy_phase_in_years)
            else:
                synergy_realized = run_rate_synergies

            # EBITDA with margin improvement
            margin = proforma["ebitda_margin"] + (inputs.margin_improvement * min(year, inputs.synergy_phase_in_years))
            ebitda = revenue * margin + synergy_realized

            revenue_proj.append(revenue)
            ebitda_proj.append(ebitda)
            synergy_proj.append(synergy_realized)

        # CAGR calculations
        revenue_cagr = ((revenue_proj[-1] / base_revenue) ** (1 / years) - 1) if base_revenue > 0 else 0
        ebitda_cagr = ((ebitda_proj[-1] / base_ebitda) ** (1 / years) - 1) if base_ebitda > 0 else 0

        return {
            "revenue": revenue_proj,
            "ebitda": ebitda_proj,
            "synergies_realized": synergy_proj,
            "revenue_cagr": revenue_cagr,
            "ebitda_cagr": ebitda_cagr,
            "terminal_revenue": revenue_proj[-1] if revenue_proj else 0,
            "terminal_ebitda": ebitda_proj[-1] if ebitda_proj else 0,
        }

    def run_sensitivity(
        self,
        variable: str,
        values: List[float],
        output_metric: str = "valuation.combined_equity_value"
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
