"""API endpoints for valuation analyses."""

from typing import Any, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter()


class DCFInputs(BaseModel):
    """Inputs for DCF valuation."""

    # Cash flow projections
    projection_years: int = Field(default=5, ge=1, le=20)
    free_cash_flows: list[float] = []

    # WACC components
    risk_free_rate: float = 0.04
    equity_risk_premium: float = 0.055
    beta: float = 1.0
    cost_of_debt: float = 0.05
    tax_rate: float = 0.25
    debt_weight: float = 0.30

    # Terminal value
    terminal_method: str = "gordon_growth"  # or "exit_multiple"
    terminal_growth_rate: float = 0.025
    exit_multiple: Optional[float] = None

    # Additional
    net_debt: float = 0.0
    shares_outstanding: float = 1.0


class DCFOutputs(BaseModel):
    """Outputs from DCF valuation."""

    wacc: float
    cost_of_equity: float
    present_value_fcf: float
    terminal_value: float
    present_value_terminal: float
    enterprise_value: float
    equity_value: float
    equity_value_per_share: float
    implied_ev_ebitda: Optional[float] = None


class TradingCompsInputs(BaseModel):
    """Inputs for trading comparables analysis."""

    company_metrics: dict[str, float]  # e.g., {"revenue": 100, "ebitda": 20}
    peer_multiples: list[dict[str, Any]]  # List of peer company multiples


class TradingCompsOutputs(BaseModel):
    """Outputs from trading comparables analysis."""

    multiples_summary: dict[str, dict[str, float]]  # metric -> {mean, median, min, max}
    implied_values: dict[str, dict[str, float]]  # metric -> {mean_val, median_val}


class PrecedentTxnsInputs(BaseModel):
    """Inputs for precedent transactions analysis."""

    target_metrics: dict[str, float]  # Target company metrics
    transactions: list[dict[str, Any]]  # Historical transactions with multiples


class PrecedentTxnsOutputs(BaseModel):
    """Outputs from precedent transactions analysis."""

    multiples_summary: dict[str, dict[str, float]]
    implied_values: dict[str, dict[str, float]]
    premium_analysis: dict[str, float]


@router.post("/dcf", response_model=DCFOutputs)
async def run_dcf(inputs: DCFInputs):
    """Run DCF valuation analysis."""
    from core.engine.base_model import FinancialCalculations

    # Calculate WACC
    cost_of_equity = (
        inputs.risk_free_rate + inputs.beta * inputs.equity_risk_premium
    )
    equity_weight = 1 - inputs.debt_weight
    wacc = FinancialCalculations.wacc(
        equity_weight=equity_weight,
        cost_of_equity=cost_of_equity,
        debt_weight=inputs.debt_weight,
        cost_of_debt=inputs.cost_of_debt,
        tax_rate=inputs.tax_rate,
    )

    # Present value of FCF
    pv_fcf = 0.0
    for i, fcf in enumerate(inputs.free_cash_flows):
        pv_fcf += fcf / ((1 + wacc) ** (i + 1))

    # Terminal value
    if inputs.terminal_method == "gordon_growth":
        if inputs.free_cash_flows:
            final_fcf = inputs.free_cash_flows[-1]
            terminal_value = FinancialCalculations.terminal_value_gordon_growth(
                final_fcf=final_fcf,
                discount_rate=wacc,
                terminal_growth_rate=inputs.terminal_growth_rate,
            )
        else:
            terminal_value = 0.0
    else:
        # Exit multiple method - would need EBITDA
        terminal_value = 0.0

    # PV of terminal value
    n_years = len(inputs.free_cash_flows)
    pv_terminal = terminal_value / ((1 + wacc) ** n_years) if n_years > 0 else 0.0

    # Enterprise and equity value
    enterprise_value = pv_fcf + pv_terminal
    equity_value = enterprise_value - inputs.net_debt
    equity_per_share = equity_value / inputs.shares_outstanding

    return DCFOutputs(
        wacc=wacc,
        cost_of_equity=cost_of_equity,
        present_value_fcf=pv_fcf,
        terminal_value=terminal_value,
        present_value_terminal=pv_terminal,
        enterprise_value=enterprise_value,
        equity_value=equity_value,
        equity_value_per_share=equity_per_share,
    )


@router.post("/comps", response_model=TradingCompsOutputs)
async def run_trading_comps(inputs: TradingCompsInputs):
    """Run trading comparables analysis."""
    import numpy as np

    multiples_summary = {}
    implied_values = {}

    # Get all unique multiple names from peers
    if inputs.peer_multiples:
        multiple_names = set()
        for peer in inputs.peer_multiples:
            multiple_names.update(peer.get("multiples", {}).keys())

        for mult_name in multiple_names:
            values = []
            for peer in inputs.peer_multiples:
                val = peer.get("multiples", {}).get(mult_name)
                if val is not None and not np.isnan(val):
                    values.append(val)

            if values:
                multiples_summary[mult_name] = {
                    "mean": float(np.mean(values)),
                    "median": float(np.median(values)),
                    "min": float(np.min(values)),
                    "max": float(np.max(values)),
                    "count": len(values),
                }

                # Calculate implied values
                # Map multiple to metric (e.g., "ev_ebitda" -> "ebitda")
                metric_name = mult_name.replace("ev_", "").replace("p_", "")
                if metric_name in inputs.company_metrics:
                    base_metric = inputs.company_metrics[metric_name]
                    implied_values[mult_name] = {
                        "mean_implied": base_metric * multiples_summary[mult_name]["mean"],
                        "median_implied": base_metric * multiples_summary[mult_name]["median"],
                    }

    return TradingCompsOutputs(
        multiples_summary=multiples_summary,
        implied_values=implied_values,
    )


@router.post("/precedents", response_model=PrecedentTxnsOutputs)
async def run_precedent_transactions(inputs: PrecedentTxnsInputs):
    """Run precedent transactions analysis."""
    import numpy as np

    multiples_summary = {}
    implied_values = {}
    premium_analysis = {}

    if inputs.transactions:
        # Extract multiples from transactions
        multiple_names = set()
        for txn in inputs.transactions:
            multiple_names.update(txn.get("multiples", {}).keys())

        for mult_name in multiple_names:
            values = []
            for txn in inputs.transactions:
                val = txn.get("multiples", {}).get(mult_name)
                if val is not None and not np.isnan(val):
                    values.append(val)

            if values:
                multiples_summary[mult_name] = {
                    "mean": float(np.mean(values)),
                    "median": float(np.median(values)),
                    "min": float(np.min(values)),
                    "max": float(np.max(values)),
                    "count": len(values),
                }

                # Calculate implied values
                metric_name = mult_name.replace("ev_", "").replace("p_", "")
                if metric_name in inputs.target_metrics:
                    base_metric = inputs.target_metrics[metric_name]
                    implied_values[mult_name] = {
                        "mean_implied": base_metric * multiples_summary[mult_name]["mean"],
                        "median_implied": base_metric * multiples_summary[mult_name]["median"],
                    }

        # Premium analysis
        premiums = []
        for txn in inputs.transactions:
            premium = txn.get("premium_to_unaffected")
            if premium is not None and not np.isnan(premium):
                premiums.append(premium)

        if premiums:
            premium_analysis = {
                "mean_premium": float(np.mean(premiums)),
                "median_premium": float(np.median(premiums)),
                "min_premium": float(np.min(premiums)),
                "max_premium": float(np.max(premiums)),
            }

    return PrecedentTxnsOutputs(
        multiples_summary=multiples_summary,
        implied_values=implied_values,
        premium_analysis=premium_analysis,
    )
