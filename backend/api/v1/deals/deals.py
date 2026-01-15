"""API endpoints for deal analysis (M&A, bespoke transactions)."""

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter()


class MergerInputs(BaseModel):
    """Inputs for merger/M&A analysis."""

    # Acquirer
    acquirer_name: str = "Acquirer"
    acquirer_shares_outstanding: float
    acquirer_stock_price: float
    acquirer_net_income: float
    acquirer_net_debt: float = 0.0

    # Target
    target_name: str = "Target"
    target_shares_outstanding: float
    target_stock_price: float
    target_net_income: float
    target_net_debt: float = 0.0

    # Deal terms
    offer_price_per_share: float
    percent_stock: float = 0.5  # Remainder is cash
    synergies_pretax: float = 0.0
    synergies_phase_in_years: int = 3
    integration_costs: float = 0.0
    tax_rate: float = 0.25

    # Financing
    new_debt_amount: float = 0.0
    new_debt_rate: float = 0.05
    cash_on_hand: float = 0.0


class MergerOutputs(BaseModel):
    """Outputs from merger analysis."""

    # Deal metrics
    transaction_value: float
    premium_percent: float
    implied_ev: float

    # Consideration
    total_consideration: float
    cash_consideration: float
    stock_consideration: float
    exchange_ratio: float
    new_shares_issued: float

    # Ownership
    acquirer_ownership: float
    target_ownership: float

    # Accretion/Dilution
    acquirer_eps_pre: float
    combined_eps_post: float
    accretion_dilution_percent: float
    accretion_dilution_status: str

    # Contribution analysis
    acquirer_revenue_contribution: Optional[float] = None
    target_revenue_contribution: Optional[float] = None
    acquirer_ebitda_contribution: Optional[float] = None
    target_ebitda_contribution: Optional[float] = None


class SpinOffInputs(BaseModel):
    """Inputs for spin-off analysis."""

    parent_name: str
    spinco_name: str

    # Parent financials
    parent_revenue: float
    parent_ebitda: float
    parent_shares: float
    parent_debt: float

    # SpinCo allocation
    spinco_revenue: float
    spinco_ebitda: float
    spinco_debt_allocated: float

    # Distribution
    distribution_ratio: float = 1.0  # SpinCo shares per parent share


class SpinOffOutputs(BaseModel):
    """Outputs from spin-off analysis."""

    # RemainCo
    remainco_revenue: float
    remainco_ebitda: float
    remainco_debt: float

    # SpinCo
    spinco_shares: float

    # Implied valuations (based on multiples)
    spinco_implied_ev: Optional[float] = None
    remainco_implied_ev: Optional[float] = None


@router.post("/merger/accretion", response_model=MergerOutputs)
async def analyze_merger(inputs: MergerInputs):
    """Run merger accretion/dilution analysis."""

    # Transaction value
    transaction_value = inputs.offer_price_per_share * inputs.target_shares_outstanding

    # Premium
    premium_percent = (
        (inputs.offer_price_per_share - inputs.target_stock_price)
        / inputs.target_stock_price
    )

    # Implied EV
    implied_ev = transaction_value + inputs.target_net_debt

    # Consideration split
    stock_consideration = transaction_value * inputs.percent_stock
    cash_consideration = transaction_value * (1 - inputs.percent_stock)

    # Exchange ratio and new shares
    exchange_ratio = (
        inputs.offer_price_per_share * inputs.percent_stock
    ) / inputs.acquirer_stock_price
    new_shares = exchange_ratio * inputs.target_shares_outstanding

    # Combined shares
    combined_shares = inputs.acquirer_shares_outstanding + new_shares

    # Ownership
    acquirer_ownership = inputs.acquirer_shares_outstanding / combined_shares
    target_ownership = new_shares / combined_shares

    # Pre-deal acquirer EPS
    acquirer_eps_pre = inputs.acquirer_net_income / inputs.acquirer_shares_outstanding

    # Combined net income (simplified)
    # Add target NI + synergies - integration costs - new interest expense
    synergies_after_tax = inputs.synergies_pretax * (1 - inputs.tax_rate)
    integration_costs_after_tax = inputs.integration_costs * (1 - inputs.tax_rate)
    new_interest_after_tax = inputs.new_debt_amount * inputs.new_debt_rate * (
        1 - inputs.tax_rate
    )

    # Foregone interest on cash used (assume 2% pre-tax)
    foregone_interest = cash_consideration * 0.02 * (1 - inputs.tax_rate)

    combined_net_income = (
        inputs.acquirer_net_income
        + inputs.target_net_income
        + synergies_after_tax
        - integration_costs_after_tax
        - new_interest_after_tax
        - foregone_interest
    )

    # Combined EPS
    combined_eps = combined_net_income / combined_shares

    # Accretion/Dilution
    accretion_percent = (combined_eps - acquirer_eps_pre) / acquirer_eps_pre
    status = "Accretive" if accretion_percent > 0 else "Dilutive"

    return MergerOutputs(
        transaction_value=transaction_value,
        premium_percent=premium_percent,
        implied_ev=implied_ev,
        total_consideration=transaction_value,
        cash_consideration=cash_consideration,
        stock_consideration=stock_consideration,
        exchange_ratio=exchange_ratio,
        new_shares_issued=new_shares,
        acquirer_ownership=acquirer_ownership,
        target_ownership=target_ownership,
        acquirer_eps_pre=acquirer_eps_pre,
        combined_eps_post=combined_eps,
        accretion_dilution_percent=accretion_percent,
        accretion_dilution_status=status,
    )


@router.post("/spinoff", response_model=SpinOffOutputs)
async def analyze_spinoff(inputs: SpinOffInputs):
    """Run spin-off analysis."""

    # RemainCo (what's left after spin)
    remainco_revenue = inputs.parent_revenue - inputs.spinco_revenue
    remainco_ebitda = inputs.parent_ebitda - inputs.spinco_ebitda
    remainco_debt = inputs.parent_debt - inputs.spinco_debt_allocated

    # SpinCo shares distributed
    spinco_shares = inputs.parent_shares * inputs.distribution_ratio

    return SpinOffOutputs(
        remainco_revenue=remainco_revenue,
        remainco_ebitda=remainco_ebitda,
        remainco_debt=remainco_debt,
        spinco_shares=spinco_shares,
    )


@router.post("/contribution")
async def contribution_analysis(
    acquirer_metrics: dict[str, float],
    target_metrics: dict[str, float],
    ownership_split: dict[str, float],
):
    """Run contribution analysis for M&A."""

    result = {}

    for metric in acquirer_metrics.keys():
        if metric in target_metrics:
            total = acquirer_metrics[metric] + target_metrics[metric]
            if total > 0:
                acquirer_contribution = acquirer_metrics[metric] / total
                target_contribution = target_metrics[metric] / total

                result[metric] = {
                    "acquirer_contribution": acquirer_contribution,
                    "target_contribution": target_contribution,
                    "acquirer_ownership": ownership_split.get("acquirer", 0),
                    "target_ownership": ownership_split.get("target", 0),
                    "acquirer_premium_discount": acquirer_contribution
                    - ownership_split.get("acquirer", 0),
                    "target_premium_discount": target_contribution
                    - ownership_split.get("target", 0),
                }

    return result
