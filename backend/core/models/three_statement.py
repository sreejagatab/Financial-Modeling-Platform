"""Three-Statement Financial Model (Income Statement, Balance Sheet, Cash Flow)."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional

import numpy as np

from core.engine.base_model import BaseFinancialModel, CalculationResult


@dataclass
class ThreeStatementInputs:
    """Input parameters for a 3-statement model."""

    # Company info
    company_name: str = ""
    fiscal_year_end: str = "December"

    # Historical base (Year 0)
    base_revenue: float = 0.0
    base_cogs: float = 0.0
    base_gross_profit: float = 0.0
    base_sga: float = 0.0
    base_rd: float = 0.0
    base_da: float = 0.0
    base_interest_expense: float = 0.0
    base_other_income: float = 0.0

    # Balance sheet base
    base_cash: float = 0.0
    base_accounts_receivable: float = 0.0
    base_inventory: float = 0.0
    base_prepaid_expenses: float = 0.0
    base_other_current_assets: float = 0.0
    base_ppe_gross: float = 0.0
    base_accumulated_depreciation: float = 0.0
    base_intangibles: float = 0.0
    base_other_lt_assets: float = 0.0

    base_accounts_payable: float = 0.0
    base_accrued_expenses: float = 0.0
    base_deferred_revenue: float = 0.0
    base_current_debt: float = 0.0
    base_other_current_liabilities: float = 0.0
    base_long_term_debt: float = 0.0
    base_deferred_tax_liabilities: float = 0.0
    base_other_lt_liabilities: float = 0.0

    base_common_stock: float = 0.0
    base_additional_paid_in_capital: float = 0.0
    base_retained_earnings: float = 0.0
    base_treasury_stock: float = 0.0

    # Projection years
    projection_years: int = 5

    # Revenue drivers
    revenue_growth_rates: list[float] = field(default_factory=list)

    # Cost drivers (as % of revenue)
    cogs_percent_revenue: list[float] = field(default_factory=list)
    sga_percent_revenue: list[float] = field(default_factory=list)
    rd_percent_revenue: list[float] = field(default_factory=list)

    # Asset drivers (days)
    ar_days: float = 45.0  # Days Sales Outstanding
    inventory_days: float = 60.0  # Days Inventory Outstanding
    ap_days: float = 30.0  # Days Payable Outstanding
    prepaid_days: float = 15.0

    # CapEx and D&A
    capex_percent_revenue: list[float] = field(default_factory=list)
    depreciation_schedule: list[float] = field(default_factory=list)  # Or use % of PPE

    # Debt
    debt_interest_rate: float = 0.05
    mandatory_debt_repayment: list[float] = field(default_factory=list)
    new_debt_issuance: list[float] = field(default_factory=list)

    # Tax
    tax_rate: float = 0.25

    # Dividends
    dividend_payout_ratio: float = 0.0


@dataclass
class IncomeStatement:
    """Income statement line items."""

    revenue: list[float] = field(default_factory=list)
    cogs: list[float] = field(default_factory=list)
    gross_profit: list[float] = field(default_factory=list)
    gross_margin: list[float] = field(default_factory=list)

    sga: list[float] = field(default_factory=list)
    rd: list[float] = field(default_factory=list)
    operating_expenses: list[float] = field(default_factory=list)

    ebitda: list[float] = field(default_factory=list)
    ebitda_margin: list[float] = field(default_factory=list)
    depreciation: list[float] = field(default_factory=list)
    amortization: list[float] = field(default_factory=list)
    ebit: list[float] = field(default_factory=list)
    ebit_margin: list[float] = field(default_factory=list)

    interest_expense: list[float] = field(default_factory=list)
    interest_income: list[float] = field(default_factory=list)
    other_income: list[float] = field(default_factory=list)
    ebt: list[float] = field(default_factory=list)

    income_tax: list[float] = field(default_factory=list)
    net_income: list[float] = field(default_factory=list)
    net_income_margin: list[float] = field(default_factory=list)


@dataclass
class BalanceSheet:
    """Balance sheet line items."""

    # Assets
    cash: list[float] = field(default_factory=list)
    accounts_receivable: list[float] = field(default_factory=list)
    inventory: list[float] = field(default_factory=list)
    prepaid_expenses: list[float] = field(default_factory=list)
    other_current_assets: list[float] = field(default_factory=list)
    total_current_assets: list[float] = field(default_factory=list)

    ppe_gross: list[float] = field(default_factory=list)
    accumulated_depreciation: list[float] = field(default_factory=list)
    ppe_net: list[float] = field(default_factory=list)
    intangibles: list[float] = field(default_factory=list)
    other_lt_assets: list[float] = field(default_factory=list)
    total_assets: list[float] = field(default_factory=list)

    # Liabilities
    accounts_payable: list[float] = field(default_factory=list)
    accrued_expenses: list[float] = field(default_factory=list)
    deferred_revenue: list[float] = field(default_factory=list)
    current_debt: list[float] = field(default_factory=list)
    other_current_liabilities: list[float] = field(default_factory=list)
    total_current_liabilities: list[float] = field(default_factory=list)

    long_term_debt: list[float] = field(default_factory=list)
    deferred_tax_liabilities: list[float] = field(default_factory=list)
    other_lt_liabilities: list[float] = field(default_factory=list)
    total_liabilities: list[float] = field(default_factory=list)

    # Equity
    common_stock: list[float] = field(default_factory=list)
    additional_paid_in_capital: list[float] = field(default_factory=list)
    retained_earnings: list[float] = field(default_factory=list)
    treasury_stock: list[float] = field(default_factory=list)
    total_equity: list[float] = field(default_factory=list)

    total_liabilities_and_equity: list[float] = field(default_factory=list)
    balance_check: list[float] = field(default_factory=list)  # Should be 0


@dataclass
class CashFlowStatement:
    """Cash flow statement line items."""

    # Operating activities
    net_income: list[float] = field(default_factory=list)
    depreciation: list[float] = field(default_factory=list)
    amortization: list[float] = field(default_factory=list)

    change_ar: list[float] = field(default_factory=list)
    change_inventory: list[float] = field(default_factory=list)
    change_prepaid: list[float] = field(default_factory=list)
    change_ap: list[float] = field(default_factory=list)
    change_accrued: list[float] = field(default_factory=list)
    change_deferred_revenue: list[float] = field(default_factory=list)
    change_other_wc: list[float] = field(default_factory=list)

    cash_from_operations: list[float] = field(default_factory=list)

    # Investing activities
    capex: list[float] = field(default_factory=list)
    acquisitions: list[float] = field(default_factory=list)
    other_investing: list[float] = field(default_factory=list)
    cash_from_investing: list[float] = field(default_factory=list)

    # Financing activities
    debt_repayment: list[float] = field(default_factory=list)
    debt_issuance: list[float] = field(default_factory=list)
    dividends_paid: list[float] = field(default_factory=list)
    stock_repurchases: list[float] = field(default_factory=list)
    stock_issuance: list[float] = field(default_factory=list)
    cash_from_financing: list[float] = field(default_factory=list)

    # Summary
    net_change_in_cash: list[float] = field(default_factory=list)
    beginning_cash: list[float] = field(default_factory=list)
    ending_cash: list[float] = field(default_factory=list)


@dataclass
class ThreeStatementOutputs:
    """Complete 3-statement model outputs."""

    years: list[int] = field(default_factory=list)
    income_statement: IncomeStatement = field(default_factory=IncomeStatement)
    balance_sheet: BalanceSheet = field(default_factory=BalanceSheet)
    cash_flow: CashFlowStatement = field(default_factory=CashFlowStatement)

    # Key metrics
    revenue_growth: list[float] = field(default_factory=list)
    roic: list[float] = field(default_factory=list)
    roe: list[float] = field(default_factory=list)
    roa: list[float] = field(default_factory=list)
    debt_to_equity: list[float] = field(default_factory=list)
    current_ratio: list[float] = field(default_factory=list)
    free_cash_flow: list[float] = field(default_factory=list)


class ThreeStatementModel(BaseFinancialModel[ThreeStatementInputs]):
    """Integrated three-statement financial model.

    Builds a fully integrated Income Statement, Balance Sheet, and
    Cash Flow Statement with circular reference handling for
    interest calculations.
    """

    def __init__(self, model_id: str, name: str):
        super().__init__(model_id, name)
        self._inputs: Optional[ThreeStatementInputs] = None
        self._outputs: Optional[ThreeStatementOutputs] = None

    def set_inputs(self, inputs: ThreeStatementInputs) -> None:
        """Set the model inputs."""
        self._inputs = inputs
        self._extend_arrays()

    def _extend_arrays(self) -> None:
        """Extend input arrays to match projection years."""
        if self._inputs is None:
            return

        n = self._inputs.projection_years

        def extend(arr: list, default: float) -> list:
            if not arr:
                return [default] * n
            while len(arr) < n:
                arr.append(arr[-1] if arr else default)
            return arr[:n]

        self._inputs.revenue_growth_rates = extend(self._inputs.revenue_growth_rates, 0.05)
        self._inputs.cogs_percent_revenue = extend(self._inputs.cogs_percent_revenue, 0.6)
        self._inputs.sga_percent_revenue = extend(self._inputs.sga_percent_revenue, 0.2)
        self._inputs.rd_percent_revenue = extend(self._inputs.rd_percent_revenue, 0.05)
        self._inputs.capex_percent_revenue = extend(self._inputs.capex_percent_revenue, 0.05)
        self._inputs.depreciation_schedule = extend(self._inputs.depreciation_schedule, 0.0)
        self._inputs.mandatory_debt_repayment = extend(self._inputs.mandatory_debt_repayment, 0.0)
        self._inputs.new_debt_issuance = extend(self._inputs.new_debt_issuance, 0.0)

    def validate_inputs(self) -> tuple[bool, list[str]]:
        """Validate all model inputs."""
        errors = []

        if self._inputs is None:
            return False, ["No inputs provided"]

        inputs = self._inputs

        if inputs.base_revenue <= 0:
            errors.append("Base revenue must be positive")

        if inputs.projection_years <= 0:
            errors.append("Projection years must be positive")

        if inputs.tax_rate < 0 or inputs.tax_rate > 1:
            errors.append("Tax rate must be between 0 and 1")

        return len(errors) == 0, errors

    def calculate(self) -> CalculationResult:
        """Execute the 3-statement model calculation."""
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
        outputs = ThreeStatementOutputs()

        try:
            n = inputs.projection_years
            outputs.years = list(range(1, n + 1))

            # Initialize statements
            inc = IncomeStatement()
            bs = BalanceSheet()
            cf = CashFlowStatement()

            # ========== INCOME STATEMENT ==========
            # Revenue
            revenues = [inputs.base_revenue]
            for growth in inputs.revenue_growth_rates:
                revenues.append(revenues[-1] * (1 + growth))
            inc.revenue = revenues[1:]

            # COGS and Gross Profit
            inc.cogs = [rev * pct for rev, pct in zip(inc.revenue, inputs.cogs_percent_revenue)]
            inc.gross_profit = [rev - cogs for rev, cogs in zip(inc.revenue, inc.cogs)]
            inc.gross_margin = [gp / rev if rev else 0 for gp, rev in zip(inc.gross_profit, inc.revenue)]

            # Operating expenses
            inc.sga = [rev * pct for rev, pct in zip(inc.revenue, inputs.sga_percent_revenue)]
            inc.rd = [rev * pct for rev, pct in zip(inc.revenue, inputs.rd_percent_revenue)]
            inc.operating_expenses = [sga + rd for sga, rd in zip(inc.sga, inc.rd)]

            # EBITDA
            inc.ebitda = [gp - opex for gp, opex in zip(inc.gross_profit, inc.operating_expenses)]
            inc.ebitda_margin = [eb / rev if rev else 0 for eb, rev in zip(inc.ebitda, inc.revenue)]

            # D&A - calculate from PPE
            ppe_values = [inputs.base_ppe_gross]
            for i in range(n):
                capex = inc.revenue[i] * inputs.capex_percent_revenue[i]
                ppe_values.append(ppe_values[-1] + capex)

            inc.depreciation = [inputs.base_da] * n  # Simplified
            inc.amortization = [0.0] * n

            # EBIT
            inc.ebit = [ebitda - dep - amort for ebitda, dep, amort in
                        zip(inc.ebitda, inc.depreciation, inc.amortization)]
            inc.ebit_margin = [ebit / rev if rev else 0 for ebit, rev in zip(inc.ebit, inc.revenue)]

            # Interest (circular - use average debt balance)
            # First pass: estimate debt
            debt_balances = [inputs.base_long_term_debt + inputs.base_current_debt]
            for i in range(n):
                new_debt = inputs.new_debt_issuance[i] - inputs.mandatory_debt_repayment[i]
                debt_balances.append(max(0, debt_balances[-1] + new_debt))

            inc.interest_expense = [
                (debt_balances[i] + debt_balances[i + 1]) / 2 * inputs.debt_interest_rate
                for i in range(n)
            ]
            inc.interest_income = [0.0] * n
            inc.other_income = [inputs.base_other_income] * n

            # EBT
            inc.ebt = [
                ebit - int_exp + int_inc + other
                for ebit, int_exp, int_inc, other in
                zip(inc.ebit, inc.interest_expense, inc.interest_income, inc.other_income)
            ]

            # Taxes and Net Income
            inc.income_tax = [max(0, ebt * inputs.tax_rate) for ebt in inc.ebt]
            inc.net_income = [ebt - tax for ebt, tax in zip(inc.ebt, inc.income_tax)]
            inc.net_income_margin = [ni / rev if rev else 0 for ni, rev in zip(inc.net_income, inc.revenue)]

            # ========== BALANCE SHEET ==========
            # Working capital items using days
            daily_rev = [rev / 365 for rev in inc.revenue]
            daily_cogs = [cogs / 365 for cogs in inc.cogs]

            bs.accounts_receivable = [dr * inputs.ar_days for dr in daily_rev]
            bs.inventory = [dc * inputs.inventory_days for dc in daily_cogs]
            bs.prepaid_expenses = [dr * inputs.prepaid_days for dr in daily_rev]
            bs.other_current_assets = [inputs.base_other_current_assets] * n

            bs.accounts_payable = [dc * inputs.ap_days for dc in daily_cogs]
            bs.accrued_expenses = [inputs.base_accrued_expenses] * n
            bs.deferred_revenue = [inputs.base_deferred_revenue] * n
            bs.other_current_liabilities = [inputs.base_other_current_liabilities] * n

            # PP&E
            accumulated_dep = inputs.base_accumulated_depreciation
            bs.ppe_gross = []
            bs.accumulated_depreciation = []
            bs.ppe_net = []

            ppe_gross = inputs.base_ppe_gross
            for i in range(n):
                capex = inc.revenue[i] * inputs.capex_percent_revenue[i]
                ppe_gross += capex
                accumulated_dep += inc.depreciation[i]
                bs.ppe_gross.append(ppe_gross)
                bs.accumulated_depreciation.append(accumulated_dep)
                bs.ppe_net.append(ppe_gross - accumulated_dep)

            bs.intangibles = [inputs.base_intangibles] * n
            bs.other_lt_assets = [inputs.base_other_lt_assets] * n

            # Total assets
            bs.total_current_assets = [
                0 + ar + inv + prep + other  # Cash calculated later
                for ar, inv, prep, other in
                zip(bs.accounts_receivable, bs.inventory, bs.prepaid_expenses, bs.other_current_assets)
            ]

            # Debt
            bs.current_debt = [inputs.base_current_debt] * n
            bs.long_term_debt = debt_balances[1:]

            bs.deferred_tax_liabilities = [inputs.base_deferred_tax_liabilities] * n
            bs.other_lt_liabilities = [inputs.base_other_lt_liabilities] * n

            bs.total_current_liabilities = [
                ap + acc + def_rev + cd + other
                for ap, acc, def_rev, cd, other in
                zip(bs.accounts_payable, bs.accrued_expenses, bs.deferred_revenue,
                    bs.current_debt, bs.other_current_liabilities)
            ]

            bs.total_liabilities = [
                tcl + ltd + dtl + other
                for tcl, ltd, dtl, other in
                zip(bs.total_current_liabilities, bs.long_term_debt,
                    bs.deferred_tax_liabilities, bs.other_lt_liabilities)
            ]

            # Equity
            bs.common_stock = [inputs.base_common_stock] * n
            bs.additional_paid_in_capital = [inputs.base_additional_paid_in_capital] * n
            bs.treasury_stock = [inputs.base_treasury_stock] * n

            # Retained earnings - builds from net income less dividends
            bs.retained_earnings = []
            re = inputs.base_retained_earnings
            for i in range(n):
                dividend = inc.net_income[i] * inputs.dividend_payout_ratio
                re = re + inc.net_income[i] - dividend
                bs.retained_earnings.append(re)

            bs.total_equity = [
                cs + apic + re - ts
                for cs, apic, re, ts in
                zip(bs.common_stock, bs.additional_paid_in_capital,
                    bs.retained_earnings, bs.treasury_stock)
            ]

            # ========== CASH FLOW STATEMENT ==========
            cf.net_income = inc.net_income.copy()
            cf.depreciation = inc.depreciation.copy()
            cf.amortization = inc.amortization.copy()

            # Working capital changes
            prev_ar = inputs.base_accounts_receivable
            prev_inv = inputs.base_inventory
            prev_prep = inputs.base_prepaid_expenses
            prev_ap = inputs.base_accounts_payable
            prev_acc = inputs.base_accrued_expenses
            prev_def = inputs.base_deferred_revenue

            for i in range(n):
                cf.change_ar.append(-(bs.accounts_receivable[i] - prev_ar))
                cf.change_inventory.append(-(bs.inventory[i] - prev_inv))
                cf.change_prepaid.append(-(bs.prepaid_expenses[i] - prev_prep))
                cf.change_ap.append(bs.accounts_payable[i] - prev_ap)
                cf.change_accrued.append(bs.accrued_expenses[i] - prev_acc)
                cf.change_deferred_revenue.append(bs.deferred_revenue[i] - prev_def)
                cf.change_other_wc.append(0.0)

                prev_ar = bs.accounts_receivable[i]
                prev_inv = bs.inventory[i]
                prev_prep = bs.prepaid_expenses[i]
                prev_ap = bs.accounts_payable[i]
                prev_acc = bs.accrued_expenses[i]
                prev_def = bs.deferred_revenue[i]

            cf.cash_from_operations = [
                ni + dep + amort + dar + dinv + dprep + dap + dacc + ddef + dother
                for ni, dep, amort, dar, dinv, dprep, dap, dacc, ddef, dother in
                zip(cf.net_income, cf.depreciation, cf.amortization,
                    cf.change_ar, cf.change_inventory, cf.change_prepaid,
                    cf.change_ap, cf.change_accrued, cf.change_deferred_revenue,
                    cf.change_other_wc)
            ]

            # Investing
            cf.capex = [-(rev * pct) for rev, pct in zip(inc.revenue, inputs.capex_percent_revenue)]
            cf.acquisitions = [0.0] * n
            cf.other_investing = [0.0] * n
            cf.cash_from_investing = [
                capex + acq + other
                for capex, acq, other in zip(cf.capex, cf.acquisitions, cf.other_investing)
            ]

            # Financing
            cf.debt_repayment = [-x for x in inputs.mandatory_debt_repayment]
            cf.debt_issuance = inputs.new_debt_issuance.copy()
            cf.dividends_paid = [-(ni * inputs.dividend_payout_ratio) for ni in inc.net_income]
            cf.stock_repurchases = [0.0] * n
            cf.stock_issuance = [0.0] * n
            cf.cash_from_financing = [
                rep + iss + div + buyback + stock
                for rep, iss, div, buyback, stock in
                zip(cf.debt_repayment, cf.debt_issuance, cf.dividends_paid,
                    cf.stock_repurchases, cf.stock_issuance)
            ]

            # Net change and ending cash
            cf.net_change_in_cash = [
                ops + inv + fin
                for ops, inv, fin in
                zip(cf.cash_from_operations, cf.cash_from_investing, cf.cash_from_financing)
            ]

            cash = inputs.base_cash
            for i in range(n):
                cf.beginning_cash.append(cash)
                cash += cf.net_change_in_cash[i]
                cf.ending_cash.append(cash)

            bs.cash = cf.ending_cash.copy()

            # Recalculate total assets with cash
            bs.total_current_assets = [
                cash + ar + inv + prep + other
                for cash, ar, inv, prep, other in
                zip(bs.cash, bs.accounts_receivable, bs.inventory,
                    bs.prepaid_expenses, bs.other_current_assets)
            ]

            bs.total_assets = [
                tca + ppe + intang + other
                for tca, ppe, intang, other in
                zip(bs.total_current_assets, bs.ppe_net, bs.intangibles, bs.other_lt_assets)
            ]

            bs.total_liabilities_and_equity = [
                tl + te for tl, te in zip(bs.total_liabilities, bs.total_equity)
            ]

            # Balance check
            bs.balance_check = [
                ta - tle for ta, tle in zip(bs.total_assets, bs.total_liabilities_and_equity)
            ]

            # ========== KEY METRICS ==========
            outputs.revenue_growth = inputs.revenue_growth_rates.copy()
            outputs.free_cash_flow = [
                ops + capex for ops, capex in zip(cf.cash_from_operations, cf.capex)
            ]

            # ROE
            outputs.roe = [
                ni / te if te else 0
                for ni, te in zip(inc.net_income, bs.total_equity)
            ]

            # ROA
            outputs.roa = [
                ni / ta if ta else 0
                for ni, ta in zip(inc.net_income, bs.total_assets)
            ]

            # ROIC
            invested_capital = [
                te + ltd - cash
                for te, ltd, cash in zip(bs.total_equity, bs.long_term_debt, bs.cash)
            ]
            nopat = [ebit * (1 - inputs.tax_rate) for ebit in inc.ebit]
            outputs.roic = [
                nopat / ic if ic else 0
                for nopat, ic in zip(nopat, invested_capital)
            ]

            # Debt to equity
            outputs.debt_to_equity = [
                (cd + ltd) / te if te else 0
                for cd, ltd, te in zip(bs.current_debt, bs.long_term_debt, bs.total_equity)
            ]

            # Current ratio
            outputs.current_ratio = [
                tca / tcl if tcl else 0
                for tca, tcl in zip(bs.total_current_assets, bs.total_current_liabilities)
            ]

            # Store statements in outputs
            outputs.income_statement = inc
            outputs.balance_sheet = bs
            outputs.cash_flow = cf

            # Check for balance issues
            for i, check in enumerate(bs.balance_check):
                if abs(check) > 1:  # Allow small rounding
                    warnings.append(f"Balance sheet doesn't balance in year {i + 1}: {check:,.0f}")

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

    def _outputs_to_dict(self, outputs: ThreeStatementOutputs) -> dict[str, Any]:
        """Convert outputs to dictionary."""
        inc = outputs.income_statement
        bs = outputs.balance_sheet
        cf = outputs.cash_flow

        return {
            "years": outputs.years,
            "income_statement": {
                "revenue": inc.revenue,
                "cogs": inc.cogs,
                "gross_profit": inc.gross_profit,
                "gross_margin": inc.gross_margin,
                "sga": inc.sga,
                "rd": inc.rd,
                "ebitda": inc.ebitda,
                "ebitda_margin": inc.ebitda_margin,
                "depreciation": inc.depreciation,
                "ebit": inc.ebit,
                "ebit_margin": inc.ebit_margin,
                "interest_expense": inc.interest_expense,
                "ebt": inc.ebt,
                "income_tax": inc.income_tax,
                "net_income": inc.net_income,
                "net_income_margin": inc.net_income_margin,
            },
            "balance_sheet": {
                "cash": bs.cash,
                "accounts_receivable": bs.accounts_receivable,
                "inventory": bs.inventory,
                "total_current_assets": bs.total_current_assets,
                "ppe_net": bs.ppe_net,
                "total_assets": bs.total_assets,
                "accounts_payable": bs.accounts_payable,
                "total_current_liabilities": bs.total_current_liabilities,
                "long_term_debt": bs.long_term_debt,
                "total_liabilities": bs.total_liabilities,
                "retained_earnings": bs.retained_earnings,
                "total_equity": bs.total_equity,
                "balance_check": bs.balance_check,
            },
            "cash_flow": {
                "net_income": cf.net_income,
                "depreciation": cf.depreciation,
                "cash_from_operations": cf.cash_from_operations,
                "capex": cf.capex,
                "cash_from_investing": cf.cash_from_investing,
                "debt_repayment": cf.debt_repayment,
                "dividends_paid": cf.dividends_paid,
                "cash_from_financing": cf.cash_from_financing,
                "net_change_in_cash": cf.net_change_in_cash,
                "ending_cash": cf.ending_cash,
            },
            "metrics": {
                "revenue_growth": outputs.revenue_growth,
                "free_cash_flow": outputs.free_cash_flow,
                "roe": outputs.roe,
                "roa": outputs.roa,
                "roic": outputs.roic,
                "debt_to_equity": outputs.debt_to_equity,
                "current_ratio": outputs.current_ratio,
            },
        }

    def get_key_outputs(self) -> dict[str, Any]:
        """Get key output metrics."""
        if self._outputs is None:
            return {}

        inc = self._outputs.income_statement
        return {
            "Final Year Revenue": f"${inc.revenue[-1]:,.0f}" if inc.revenue else "N/A",
            "Final Year Net Income": f"${inc.net_income[-1]:,.0f}" if inc.net_income else "N/A",
            "Average EBITDA Margin": f"{np.mean(inc.ebitda_margin):.1%}" if inc.ebitda_margin else "N/A",
            "Final Year FCF": f"${self._outputs.free_cash_flow[-1]:,.0f}" if self._outputs.free_cash_flow else "N/A",
            "Average ROIC": f"{np.mean(self._outputs.roic):.1%}" if self._outputs.roic else "N/A",
        }
