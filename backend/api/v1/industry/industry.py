"""API endpoints for industry-specific financial models."""

from typing import Dict, Any, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from core.models import (
    SaleLeasebackModel,
    SaleLeasebackInputs,
    PropertyInfo,
    LeaseType,
    EscalationType,
    REITModel,
    REITInputs,
    REITProperty,
    REITDebt,
    REITType,
    PropertySegment,
    NAVModel,
    NAVInputs,
    NAVAsset,
    NAVLiability,
    AssetType,
    ValuationMethod,
)

router = APIRouter(prefix="/industry", tags=["Industry Models"])


# ===== Request Models =====

class PropertyInfoRequest(BaseModel):
    """Property information for sale-leaseback."""
    name: str
    property_type: str
    square_feet: float = 0
    current_book_value: float = 0
    market_value: float = 0
    annual_noi: float = 0
    location: str = ""
    age_years: int = 0


class SaleLeasebackRequest(BaseModel):
    """Sale-leaseback analysis request."""
    properties: List[PropertyInfoRequest] = []
    sale_price: Optional[float] = None
    transaction_costs_percent: float = 0.02
    initial_lease_term_years: int = 15
    renewal_options: int = 2
    renewal_term_years: int = 5
    lease_type: str = "triple_net"
    initial_rent: Optional[float] = None
    target_cap_rate: float = 0.065
    escalation_type: str = "fixed"
    annual_escalation_rate: float = 0.025
    corporate_tax_rate: float = 0.25
    discount_rate: float = 0.08
    current_ebitda: float = 0
    current_debt: float = 0
    debt_interest_rate: float = 0.05
    debt_paydown_percent: float = 0.50
    reinvestment_return: float = 0.10
    projection_years: int = 15


class REITPropertyRequest(BaseModel):
    """REIT property information."""
    name: str
    property_type: str
    segment: str = "core"
    square_feet: float = 0
    units: int = 0
    occupancy_rate: float = 0.95
    noi: float = 0
    cap_rate: float = 0.06
    market_value: float = 0


class REITDebtRequest(BaseModel):
    """REIT debt facility."""
    name: str
    principal: float
    interest_rate: float
    maturity_year: int
    is_secured: bool = True
    is_fixed_rate: bool = True


class REITAnalysisRequest(BaseModel):
    """REIT analysis request."""
    reit_type: str = "equity"
    shares_outstanding: float = 100_000_000
    current_share_price: float = 25.0
    properties: List[REITPropertyRequest] = []
    total_noi: float = 0
    total_assets: float = 0
    total_real_estate: float = 0
    debt_facilities: List[REITDebtRequest] = []
    total_debt: float = 0
    weighted_avg_interest_rate: float = 0.045
    rental_revenue: float = 0
    other_revenue: float = 0
    property_expenses: float = 0
    general_admin: float = 0
    depreciation: float = 0
    interest_expense: float = 0
    recurring_capex: float = 0
    tenant_improvements: float = 0
    leasing_commissions: float = 0
    projection_years: int = 5
    noi_growth_rate: float = 0.03
    target_payout_ratio: float = 0.75
    exit_cap_rate: float = 0.065
    discount_rate: float = 0.08


class NAVAssetRequest(BaseModel):
    """NAV asset information."""
    name: str
    asset_type: str
    description: str = ""
    book_value: float = 0
    market_value: Optional[float] = None
    valuation_method: str = "book_value"
    annual_income: float = 0
    cap_rate: float = 0.06
    ebitda_multiple: float = 0
    ownership_percent: float = 1.0
    discount_rate: float = 0
    premium_rate: float = 0


class NAVLiabilityRequest(BaseModel):
    """NAV liability information."""
    name: str
    book_value: float
    market_value: Optional[float] = None
    maturity_years: float = 0
    interest_rate: float = 0


class NAVAnalysisRequest(BaseModel):
    """NAV analysis request."""
    company_name: str = ""
    shares_outstanding: float = 100_000_000
    current_share_price: float = 0
    assets: List[NAVAssetRequest] = []
    total_real_estate: float = 0
    total_investments: float = 0
    total_operating_businesses: float = 0
    cash_and_equivalents: float = 0
    other_assets: float = 0
    liabilities: List[NAVLiabilityRequest] = []
    total_debt: float = 0
    other_liabilities: float = 0
    preferred_stock: float = 0
    minority_interest: float = 0
    holding_company_discount: float = 0.10
    liquidity_discount: float = 0
    annual_ga_expenses: float = 0
    ga_capitalization_multiple: float = 10
    embedded_tax_liability: float = 0
    tax_rate: float = 0.25
    nol_carryforward: float = 0


class SensitivityRequest(BaseModel):
    """Sensitivity analysis request."""
    variable: str
    values: List[float]
    output_metric: str


# ===== Sale-Leaseback Endpoints =====

@router.post("/sale-leaseback/analyze")
async def analyze_sale_leaseback(request: SaleLeasebackRequest):
    """Analyze a sale-leaseback transaction."""
    try:
        # Convert request to model inputs
        properties = [
            PropertyInfo(
                name=p.name,
                property_type=p.property_type,
                square_feet=p.square_feet,
                current_book_value=p.current_book_value,
                market_value=p.market_value,
                annual_noi=p.annual_noi,
                location=p.location,
                age_years=p.age_years,
            )
            for p in request.properties
        ]

        inputs = SaleLeasebackInputs(
            properties=properties,
            sale_price=request.sale_price,
            transaction_costs_percent=request.transaction_costs_percent,
            initial_lease_term_years=request.initial_lease_term_years,
            renewal_options=request.renewal_options,
            renewal_term_years=request.renewal_term_years,
            lease_type=LeaseType(request.lease_type),
            initial_rent=request.initial_rent,
            target_cap_rate=request.target_cap_rate,
            escalation_type=EscalationType(request.escalation_type),
            annual_escalation_rate=request.annual_escalation_rate,
            corporate_tax_rate=request.corporate_tax_rate,
            discount_rate=request.discount_rate,
            current_ebitda=request.current_ebitda,
            current_debt=request.current_debt,
            debt_interest_rate=request.debt_interest_rate,
            debt_paydown_percent=request.debt_paydown_percent,
            reinvestment_return=request.reinvestment_return,
            projection_years=request.projection_years,
        )

        model = SaleLeasebackModel(model_id="api", name="API Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Analysis failed: {result.errors}"
            )

        return {"success": True, "outputs": result.outputs}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/sale-leaseback/sensitivity")
async def sale_leaseback_sensitivity(
    request: SaleLeasebackRequest,
    sensitivity: SensitivityRequest
):
    """Run sensitivity analysis on sale-leaseback."""
    try:
        properties = [
            PropertyInfo(
                name=p.name,
                property_type=p.property_type,
                square_feet=p.square_feet,
                current_book_value=p.current_book_value,
                market_value=p.market_value,
                annual_noi=p.annual_noi,
            )
            for p in request.properties
        ]

        inputs = SaleLeasebackInputs(
            properties=properties,
            target_cap_rate=request.target_cap_rate,
            current_ebitda=request.current_ebitda,
            current_debt=request.current_debt,
            projection_years=request.projection_years,
        )

        model = SaleLeasebackModel(model_id="api", name="Sensitivity")
        model.set_inputs(inputs)

        result = model.run_sensitivity(
            sensitivity.variable,
            sensitivity.values,
            sensitivity.output_metric,
        )

        return {"success": True, "sensitivity": result}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sensitivity analysis failed: {str(e)}"
        )


# ===== REIT Endpoints =====

@router.post("/reit/analyze")
async def analyze_reit(request: REITAnalysisRequest):
    """Analyze REIT valuation and metrics."""
    try:
        # Convert properties
        properties = [
            REITProperty(
                name=p.name,
                property_type=p.property_type,
                segment=PropertySegment(p.segment),
                square_feet=p.square_feet,
                units=p.units,
                occupancy_rate=p.occupancy_rate,
                noi=p.noi,
                cap_rate=p.cap_rate,
                market_value=p.market_value,
            )
            for p in request.properties
        ]

        # Convert debt facilities
        debt_facilities = [
            REITDebt(
                name=d.name,
                principal=d.principal,
                interest_rate=d.interest_rate,
                maturity_year=d.maturity_year,
                is_secured=d.is_secured,
                is_fixed_rate=d.is_fixed_rate,
            )
            for d in request.debt_facilities
        ]

        inputs = REITInputs(
            reit_type=REITType(request.reit_type),
            shares_outstanding=request.shares_outstanding,
            current_share_price=request.current_share_price,
            properties=properties,
            total_noi=request.total_noi,
            total_assets=request.total_assets,
            total_real_estate=request.total_real_estate,
            debt_facilities=debt_facilities,
            total_debt=request.total_debt,
            weighted_avg_interest_rate=request.weighted_avg_interest_rate,
            rental_revenue=request.rental_revenue,
            other_revenue=request.other_revenue,
            property_expenses=request.property_expenses,
            general_admin=request.general_admin,
            depreciation=request.depreciation,
            interest_expense=request.interest_expense,
            recurring_capex=request.recurring_capex,
            tenant_improvements=request.tenant_improvements,
            leasing_commissions=request.leasing_commissions,
            projection_years=request.projection_years,
            noi_growth_rate=request.noi_growth_rate,
            target_payout_ratio=request.target_payout_ratio,
            exit_cap_rate=request.exit_cap_rate,
            discount_rate=request.discount_rate,
        )

        model = REITModel(model_id="api", name="REIT Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Analysis failed: {result.errors}"
            )

        return {"success": True, "outputs": result.outputs}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/reit/ffo-affo")
async def calculate_reit_ffo(request: REITAnalysisRequest):
    """Calculate FFO and AFFO metrics."""
    try:
        inputs = REITInputs(
            shares_outstanding=request.shares_outstanding,
            current_share_price=request.current_share_price,
            total_noi=request.total_noi,
            rental_revenue=request.rental_revenue,
            other_revenue=request.other_revenue,
            property_expenses=request.property_expenses,
            general_admin=request.general_admin,
            depreciation=request.depreciation,
            interest_expense=request.interest_expense,
            recurring_capex=request.recurring_capex,
            tenant_improvements=request.tenant_improvements,
            leasing_commissions=request.leasing_commissions,
            total_debt=request.total_debt,
            weighted_avg_interest_rate=request.weighted_avg_interest_rate,
        )

        model = REITModel(model_id="api", name="FFO Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculation failed: {result.errors}"
            )

        return {
            "success": True,
            "ffo_affo": result.outputs.get("ffo_affo", {}),
            "dividend_analysis": result.outputs.get("dividend_analysis", {}),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation failed: {str(e)}"
        )


@router.post("/reit/sensitivity")
async def reit_sensitivity(request: REITAnalysisRequest, sensitivity: SensitivityRequest):
    """Run sensitivity analysis on REIT metrics."""
    try:
        inputs = REITInputs(
            shares_outstanding=request.shares_outstanding,
            current_share_price=request.current_share_price,
            total_noi=request.total_noi,
            total_debt=request.total_debt,
            exit_cap_rate=request.exit_cap_rate,
        )

        model = REITModel(model_id="api", name="Sensitivity")
        model.set_inputs(inputs)

        result = model.run_sensitivity(
            sensitivity.variable,
            sensitivity.values,
            sensitivity.output_metric,
        )

        return {"success": True, "sensitivity": result}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sensitivity analysis failed: {str(e)}"
        )


# ===== NAV Endpoints =====

@router.post("/nav/analyze")
async def analyze_nav(request: NAVAnalysisRequest):
    """Calculate Net Asset Value."""
    try:
        # Convert assets
        assets = [
            NAVAsset(
                name=a.name,
                asset_type=AssetType(a.asset_type),
                description=a.description,
                book_value=a.book_value,
                market_value=a.market_value,
                valuation_method=ValuationMethod(a.valuation_method),
                annual_income=a.annual_income,
                cap_rate=a.cap_rate,
                ebitda_multiple=a.ebitda_multiple,
                ownership_percent=a.ownership_percent,
                discount_rate=a.discount_rate,
                premium_rate=a.premium_rate,
            )
            for a in request.assets
        ]

        # Convert liabilities
        liabilities = [
            NAVLiability(
                name=l.name,
                book_value=l.book_value,
                market_value=l.market_value,
                maturity_years=l.maturity_years,
                interest_rate=l.interest_rate,
            )
            for l in request.liabilities
        ]

        inputs = NAVInputs(
            company_name=request.company_name,
            shares_outstanding=request.shares_outstanding,
            current_share_price=request.current_share_price,
            assets=assets,
            total_real_estate=request.total_real_estate,
            total_investments=request.total_investments,
            total_operating_businesses=request.total_operating_businesses,
            cash_and_equivalents=request.cash_and_equivalents,
            other_assets=request.other_assets,
            liabilities=liabilities,
            total_debt=request.total_debt,
            other_liabilities=request.other_liabilities,
            preferred_stock=request.preferred_stock,
            minority_interest=request.minority_interest,
            holding_company_discount=request.holding_company_discount,
            liquidity_discount=request.liquidity_discount,
            annual_ga_expenses=request.annual_ga_expenses,
            ga_capitalization_multiple=request.ga_capitalization_multiple,
            embedded_tax_liability=request.embedded_tax_liability,
            tax_rate=request.tax_rate,
            nol_carryforward=request.nol_carryforward,
        )

        model = NAVModel(model_id="api", name="NAV Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Analysis failed: {result.errors}"
            )

        return {"success": True, "outputs": result.outputs}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/nav/sotp")
async def nav_sum_of_parts(request: NAVAnalysisRequest):
    """Calculate sum-of-the-parts NAV breakdown."""
    try:
        assets = [
            NAVAsset(
                name=a.name,
                asset_type=AssetType(a.asset_type),
                book_value=a.book_value,
                market_value=a.market_value,
                ownership_percent=a.ownership_percent,
            )
            for a in request.assets
        ]

        inputs = NAVInputs(
            shares_outstanding=request.shares_outstanding,
            current_share_price=request.current_share_price,
            assets=assets,
            total_real_estate=request.total_real_estate,
            total_investments=request.total_investments,
            total_operating_businesses=request.total_operating_businesses,
            cash_and_equivalents=request.cash_and_equivalents,
            total_debt=request.total_debt,
            other_liabilities=request.other_liabilities,
            holding_company_discount=request.holding_company_discount,
        )

        model = NAVModel(model_id="api", name="SOTP Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculation failed: {result.errors}"
            )

        return {
            "success": True,
            "sotp_breakdown": result.outputs.get("sotp_breakdown", {}),
            "nav_calculation": result.outputs.get("nav_calculation", {}),
            "per_share_metrics": result.outputs.get("per_share_metrics", {}),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation failed: {str(e)}"
        )


@router.post("/nav/sensitivity")
async def nav_sensitivity(request: NAVAnalysisRequest, sensitivity: SensitivityRequest):
    """Run sensitivity analysis on NAV."""
    try:
        inputs = NAVInputs(
            shares_outstanding=request.shares_outstanding,
            current_share_price=request.current_share_price,
            total_real_estate=request.total_real_estate,
            total_investments=request.total_investments,
            cash_and_equivalents=request.cash_and_equivalents,
            total_debt=request.total_debt,
            holding_company_discount=request.holding_company_discount,
        )

        model = NAVModel(model_id="api", name="Sensitivity")
        model.set_inputs(inputs)

        result = model.run_sensitivity(
            sensitivity.variable,
            sensitivity.values,
            sensitivity.output_metric,
        )

        return {"success": True, "sensitivity": result}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sensitivity analysis failed: {str(e)}"
        )
