"""API endpoints for bespoke transaction models."""

from typing import Dict, Any, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from core.models import (
    SpinoffModel,
    SpinoffInputs,
    BusinessUnit,
    SharedCost,
    TransitionService,
    TransactionType,
    CostAllocationMethod,
    IPLicensingModel,
    IPLicensingInputs,
    IPAsset,
    RoyaltyTier,
    IPType,
    LicenseType,
    RoyaltyStructure,
    RMTModel,
    RMTInputs,
    CompanyProfile,
    MergerConsideration,
)

router = APIRouter(prefix="/bespoke", tags=["Bespoke Transactions"])


# ===== Request Models =====

class BusinessUnitRequest(BaseModel):
    """Business unit for spin-off."""
    name: str
    revenue: float = 0
    ebitda: float = 0
    ebit: float = 0
    total_assets: float = 0
    total_debt: float = 0
    employees: int = 0
    capex: float = 0
    working_capital: float = 0
    growth_rate: float = 0.03
    ebitda_margin: float = 0


class SharedCostRequest(BaseModel):
    """Shared cost allocation."""
    name: str
    total_amount: float
    allocation_method: str = "revenue_based"
    parent_retention_percent: float = 0.0
    spinco_allocation_percent: float = 0.0


class TransitionServiceRequest(BaseModel):
    """Transition service agreement."""
    name: str
    annual_cost: float
    duration_months: int = 24
    markup_percent: float = 0.05


class SpinoffRequest(BaseModel):
    """Spin-off analysis request."""
    transaction_type: str = "spinoff"
    spinco_name: str = "SpinCo"
    parent_name: str = "ParentCo"
    spinco_business: Optional[BusinessUnitRequest] = None
    parent_remaining: Optional[BusinessUnitRequest] = None
    spinco_revenue: float = 0
    spinco_ebitda: float = 0
    spinco_assets: float = 0
    spinco_debt: float = 0
    parent_revenue: float = 0
    parent_ebitda: float = 0
    parent_assets: float = 0
    parent_debt: float = 0
    shared_costs: List[SharedCostRequest] = []
    total_corporate_overhead: float = 0
    spinco_overhead_allocation: float = 0.30
    stranded_cost_amount: float = 0
    stranded_cost_mitigation_years: int = 3
    stranded_cost_mitigation_percent: float = 0.80
    transition_services: List[TransitionServiceRequest] = []
    transaction_costs: float = 0
    separation_costs: float = 0
    spinco_target_leverage: float = 2.5
    spinco_interest_rate: float = 0.06
    parent_target_leverage: float = 2.0
    tax_rate: float = 0.25
    is_tax_free: bool = True
    spinco_ebitda_multiple: float = 8.0
    parent_ebitda_multiple: float = 10.0
    projection_years: int = 5
    ipo_proceeds: float = 0
    shares_offered_percent: float = 0.20
    ipo_discount: float = 0.15


class IPAssetRequest(BaseModel):
    """IP asset for licensing."""
    name: str
    ip_type: str = "patent"
    description: str = ""
    remaining_life_years: int = 15
    current_annual_revenue: float = 0
    cost_basis: float = 0
    book_value: float = 0
    market_comparable_value: float = 0


class RoyaltyTierRequest(BaseModel):
    """Royalty tier structure."""
    threshold: float
    rate: float


class MilestoneRequest(BaseModel):
    """Milestone payment."""
    name: str
    amount: float
    year: int = 1
    probability: float = 1.0


class IPLicensingRequest(BaseModel):
    """IP licensing analysis request."""
    ip_assets: List[IPAssetRequest] = []
    ip_type: str = "patent"
    ip_name: str = ""
    remaining_life_years: int = 15
    license_type: str = "non_exclusive"
    license_term_years: int = 10
    territory: str = "worldwide"
    field_of_use: str = ""
    royalty_structure: str = "percent_of_sales"
    royalty_rate: float = 0.05
    minimum_royalty: float = 0
    per_unit_royalty: float = 0
    royalty_tiers: List[RoyaltyTierRequest] = []
    upfront_fee: float = 0
    signing_bonus: float = 0
    milestone_payments: List[MilestoneRequest] = []
    licensee_base_revenue: float = 0
    licensee_revenue_growth: float = 0.10
    licensee_units_base: float = 0
    licensee_unit_growth: float = 0.08
    industry_avg_royalty_rate: float = 0.05
    discount_rate: float = 0.12
    terminal_growth_rate: float = 0.02
    tax_rate: float = 0.25
    enforcement_costs: float = 0
    maintenance_costs: float = 0
    projection_years: int = 10


class CompanyProfileRequest(BaseModel):
    """Company profile for RMT."""
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
    tax_basis: float = 0


class RMTRequest(BaseModel):
    """Reverse Morris Trust analysis request."""
    parent: Optional[CompanyProfileRequest] = None
    parent_name: str = "ParentCo"
    parent_revenue: float = 0
    parent_ebitda: float = 0
    parent_shares: float = 0
    parent_share_price: float = 0
    spinco: Optional[CompanyProfileRequest] = None
    spinco_name: str = "SpinCo"
    spinco_revenue: float = 0
    spinco_ebitda: float = 0
    spinco_assets: float = 0
    spinco_debt: float = 0
    spinco_tax_basis: float = 0
    acquirer: Optional[CompanyProfileRequest] = None
    acquirer_name: str = "AcquirerCo"
    acquirer_revenue: float = 0
    acquirer_ebitda: float = 0
    acquirer_shares: float = 0
    acquirer_share_price: float = 0
    acquirer_debt: float = 0
    consideration_type: str = "all_stock"
    cash_component: float = 0
    exchange_ratio: float = 0
    spinco_ebitda_multiple: float = 8.0
    acquirer_ebitda_multiple: float = 10.0
    combined_ebitda_multiple: float = 9.0
    revenue_synergies: float = 0
    cost_synergies: float = 0
    synergy_phase_in_years: int = 3
    target_parent_ownership: float = 0.51
    corporate_tax_rate: float = 0.25
    capital_gains_rate: float = 0.20
    built_in_gains: float = 0
    advisory_fees: float = 0
    legal_fees: float = 0
    other_transaction_costs: float = 0
    projection_years: int = 5
    revenue_growth_rate: float = 0.03
    margin_improvement: float = 0.01


class SensitivityRequest(BaseModel):
    """Sensitivity analysis request."""
    variable: str
    values: List[float]
    output_metric: str


# ===== Spin-off Endpoints =====

@router.post("/spinoff/analyze")
async def analyze_spinoff(request: SpinoffRequest):
    """Analyze a spin-off or carve-out transaction."""
    try:
        # Convert business units
        spinco_business = None
        if request.spinco_business:
            spinco_business = BusinessUnit(
                name=request.spinco_business.name,
                revenue=request.spinco_business.revenue,
                ebitda=request.spinco_business.ebitda,
                ebit=request.spinco_business.ebit,
                total_assets=request.spinco_business.total_assets,
                total_debt=request.spinco_business.total_debt,
                employees=request.spinco_business.employees,
                growth_rate=request.spinco_business.growth_rate,
            )

        parent_remaining = None
        if request.parent_remaining:
            parent_remaining = BusinessUnit(
                name=request.parent_remaining.name,
                revenue=request.parent_remaining.revenue,
                ebitda=request.parent_remaining.ebitda,
                ebit=request.parent_remaining.ebit,
                total_assets=request.parent_remaining.total_assets,
                total_debt=request.parent_remaining.total_debt,
                employees=request.parent_remaining.employees,
                growth_rate=request.parent_remaining.growth_rate,
            )

        # Convert shared costs
        shared_costs = [
            SharedCost(
                name=c.name,
                total_amount=c.total_amount,
                allocation_method=CostAllocationMethod(c.allocation_method),
                parent_retention_percent=c.parent_retention_percent,
                spinco_allocation_percent=c.spinco_allocation_percent,
            )
            for c in request.shared_costs
        ]

        # Convert transition services
        transition_services = [
            TransitionService(
                name=t.name,
                annual_cost=t.annual_cost,
                duration_months=t.duration_months,
                markup_percent=t.markup_percent,
            )
            for t in request.transition_services
        ]

        inputs = SpinoffInputs(
            transaction_type=TransactionType(request.transaction_type),
            spinco_name=request.spinco_name,
            parent_name=request.parent_name,
            spinco_business=spinco_business,
            parent_remaining=parent_remaining,
            spinco_revenue=request.spinco_revenue,
            spinco_ebitda=request.spinco_ebitda,
            spinco_assets=request.spinco_assets,
            spinco_debt=request.spinco_debt,
            parent_revenue=request.parent_revenue,
            parent_ebitda=request.parent_ebitda,
            parent_assets=request.parent_assets,
            parent_debt=request.parent_debt,
            shared_costs=shared_costs,
            total_corporate_overhead=request.total_corporate_overhead,
            spinco_overhead_allocation=request.spinco_overhead_allocation,
            stranded_cost_amount=request.stranded_cost_amount,
            stranded_cost_mitigation_years=request.stranded_cost_mitigation_years,
            stranded_cost_mitigation_percent=request.stranded_cost_mitigation_percent,
            transition_services=transition_services,
            transaction_costs=request.transaction_costs,
            separation_costs=request.separation_costs,
            spinco_target_leverage=request.spinco_target_leverage,
            spinco_interest_rate=request.spinco_interest_rate,
            parent_target_leverage=request.parent_target_leverage,
            tax_rate=request.tax_rate,
            is_tax_free=request.is_tax_free,
            spinco_ebitda_multiple=request.spinco_ebitda_multiple,
            parent_ebitda_multiple=request.parent_ebitda_multiple,
            projection_years=request.projection_years,
            ipo_proceeds=request.ipo_proceeds,
            shares_offered_percent=request.shares_offered_percent,
            ipo_discount=request.ipo_discount,
        )

        model = SpinoffModel(model_id="api", name="Spinoff Analysis")
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


@router.post("/spinoff/value-creation")
async def spinoff_value_creation(request: SpinoffRequest):
    """Calculate value creation from spin-off."""
    try:
        inputs = SpinoffInputs(
            spinco_ebitda=request.spinco_ebitda,
            parent_ebitda=request.parent_ebitda,
            spinco_debt=request.spinco_debt,
            parent_debt=request.parent_debt,
            spinco_ebitda_multiple=request.spinco_ebitda_multiple,
            parent_ebitda_multiple=request.parent_ebitda_multiple,
            stranded_cost_amount=request.stranded_cost_amount,
            transaction_costs=request.transaction_costs,
            separation_costs=request.separation_costs,
        )

        model = SpinoffModel(model_id="api", name="Value Creation")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculation failed: {result.errors}"
            )

        return {
            "success": True,
            "value_creation": result.outputs.get("value_creation", {}),
            "valuation": result.outputs.get("valuation", {}),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation failed: {str(e)}"
        )


# ===== IP Licensing Endpoints =====

@router.post("/ip-licensing/analyze")
async def analyze_ip_licensing(request: IPLicensingRequest):
    """Analyze an IP licensing transaction."""
    try:
        # Convert IP assets
        ip_assets = [
            IPAsset(
                name=a.name,
                ip_type=IPType(a.ip_type),
                description=a.description,
                remaining_life_years=a.remaining_life_years,
                current_annual_revenue=a.current_annual_revenue,
                cost_basis=a.cost_basis,
                book_value=a.book_value,
                market_comparable_value=a.market_comparable_value,
            )
            for a in request.ip_assets
        ]

        # Convert royalty tiers
        royalty_tiers = [
            RoyaltyTier(threshold=t.threshold, rate=t.rate)
            for t in request.royalty_tiers
        ]

        # Convert milestones
        milestones = [
            {"name": m.name, "amount": m.amount, "year": m.year, "probability": m.probability}
            for m in request.milestone_payments
        ]

        inputs = IPLicensingInputs(
            ip_assets=ip_assets,
            ip_type=IPType(request.ip_type),
            ip_name=request.ip_name,
            remaining_life_years=request.remaining_life_years,
            license_type=LicenseType(request.license_type),
            license_term_years=request.license_term_years,
            territory=request.territory,
            field_of_use=request.field_of_use,
            royalty_structure=RoyaltyStructure(request.royalty_structure),
            royalty_rate=request.royalty_rate,
            minimum_royalty=request.minimum_royalty,
            per_unit_royalty=request.per_unit_royalty,
            royalty_tiers=royalty_tiers,
            upfront_fee=request.upfront_fee,
            signing_bonus=request.signing_bonus,
            milestone_payments=milestones,
            licensee_base_revenue=request.licensee_base_revenue,
            licensee_revenue_growth=request.licensee_revenue_growth,
            licensee_units_base=request.licensee_units_base,
            licensee_unit_growth=request.licensee_unit_growth,
            industry_avg_royalty_rate=request.industry_avg_royalty_rate,
            discount_rate=request.discount_rate,
            terminal_growth_rate=request.terminal_growth_rate,
            tax_rate=request.tax_rate,
            enforcement_costs=request.enforcement_costs,
            maintenance_costs=request.maintenance_costs,
            projection_years=request.projection_years,
        )

        model = IPLicensingModel(model_id="api", name="IP Licensing Analysis")
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


@router.post("/ip-licensing/valuation")
async def ip_licensing_valuation(request: IPLicensingRequest):
    """Calculate IP license valuation."""
    try:
        inputs = IPLicensingInputs(
            ip_type=IPType(request.ip_type),
            license_type=LicenseType(request.license_type),
            license_term_years=request.license_term_years,
            royalty_rate=request.royalty_rate,
            minimum_royalty=request.minimum_royalty,
            upfront_fee=request.upfront_fee,
            licensee_base_revenue=request.licensee_base_revenue,
            licensee_revenue_growth=request.licensee_revenue_growth,
            discount_rate=request.discount_rate,
            projection_years=request.projection_years,
        )

        model = IPLicensingModel(model_id="api", name="IP Valuation")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculation failed: {result.errors}"
            )

        return {
            "success": True,
            "valuation": result.outputs.get("valuation", {}),
            "royalty_analysis": result.outputs.get("royalty_analysis", {}),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation failed: {str(e)}"
        )


# ===== RMT Endpoints =====

@router.post("/rmt/analyze")
async def analyze_rmt(request: RMTRequest):
    """Analyze a Reverse Morris Trust transaction."""
    try:
        # Convert company profiles
        parent = None
        if request.parent:
            parent = CompanyProfile(
                name=request.parent.name,
                revenue=request.parent.revenue,
                ebitda=request.parent.ebitda,
                net_income=request.parent.net_income,
                total_assets=request.parent.total_assets,
                total_debt=request.parent.total_debt,
                cash=request.parent.cash,
                shares_outstanding=request.parent.shares_outstanding,
                share_price=request.parent.share_price,
            )

        spinco = None
        if request.spinco:
            spinco = CompanyProfile(
                name=request.spinco.name,
                revenue=request.spinco.revenue,
                ebitda=request.spinco.ebitda,
                net_income=request.spinco.net_income,
                total_assets=request.spinco.total_assets,
                total_debt=request.spinco.total_debt,
                cash=request.spinco.cash,
                tax_basis=request.spinco.tax_basis,
            )

        acquirer = None
        if request.acquirer:
            acquirer = CompanyProfile(
                name=request.acquirer.name,
                revenue=request.acquirer.revenue,
                ebitda=request.acquirer.ebitda,
                net_income=request.acquirer.net_income,
                total_assets=request.acquirer.total_assets,
                total_debt=request.acquirer.total_debt,
                cash=request.acquirer.cash,
                shares_outstanding=request.acquirer.shares_outstanding,
                share_price=request.acquirer.share_price,
            )

        inputs = RMTInputs(
            parent=parent,
            parent_name=request.parent_name,
            parent_revenue=request.parent_revenue,
            parent_ebitda=request.parent_ebitda,
            parent_shares=request.parent_shares,
            parent_share_price=request.parent_share_price,
            spinco=spinco,
            spinco_name=request.spinco_name,
            spinco_revenue=request.spinco_revenue,
            spinco_ebitda=request.spinco_ebitda,
            spinco_assets=request.spinco_assets,
            spinco_debt=request.spinco_debt,
            spinco_tax_basis=request.spinco_tax_basis,
            acquirer=acquirer,
            acquirer_name=request.acquirer_name,
            acquirer_revenue=request.acquirer_revenue,
            acquirer_ebitda=request.acquirer_ebitda,
            acquirer_shares=request.acquirer_shares,
            acquirer_share_price=request.acquirer_share_price,
            acquirer_debt=request.acquirer_debt,
            consideration_type=MergerConsideration(request.consideration_type),
            cash_component=request.cash_component,
            exchange_ratio=request.exchange_ratio,
            spinco_ebitda_multiple=request.spinco_ebitda_multiple,
            acquirer_ebitda_multiple=request.acquirer_ebitda_multiple,
            combined_ebitda_multiple=request.combined_ebitda_multiple,
            revenue_synergies=request.revenue_synergies,
            cost_synergies=request.cost_synergies,
            synergy_phase_in_years=request.synergy_phase_in_years,
            target_parent_ownership=request.target_parent_ownership,
            corporate_tax_rate=request.corporate_tax_rate,
            capital_gains_rate=request.capital_gains_rate,
            built_in_gains=request.built_in_gains,
            advisory_fees=request.advisory_fees,
            legal_fees=request.legal_fees,
            other_transaction_costs=request.other_transaction_costs,
            projection_years=request.projection_years,
            revenue_growth_rate=request.revenue_growth_rate,
            margin_improvement=request.margin_improvement,
        )

        model = RMTModel(model_id="api", name="RMT Analysis")
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


@router.post("/rmt/tax-analysis")
async def rmt_tax_analysis(request: RMTRequest):
    """Calculate tax implications of RMT."""
    try:
        inputs = RMTInputs(
            spinco_ebitda=request.spinco_ebitda,
            spinco_assets=request.spinco_assets,
            spinco_debt=request.spinco_debt,
            spinco_tax_basis=request.spinco_tax_basis,
            acquirer_ebitda=request.acquirer_ebitda,
            acquirer_shares=request.acquirer_shares,
            acquirer_share_price=request.acquirer_share_price,
            spinco_ebitda_multiple=request.spinco_ebitda_multiple,
            corporate_tax_rate=request.corporate_tax_rate,
            capital_gains_rate=request.capital_gains_rate,
        )

        model = RMTModel(model_id="api", name="Tax Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculation failed: {result.errors}"
            )

        return {
            "success": True,
            "tax_analysis": result.outputs.get("tax_analysis", {}),
            "ownership_analysis": result.outputs.get("ownership_analysis", {}),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation failed: {str(e)}"
        )


@router.post("/rmt/accretion-dilution")
async def rmt_accretion_dilution(request: RMTRequest):
    """Calculate accretion/dilution for RMT."""
    try:
        inputs = RMTInputs(
            spinco_ebitda=request.spinco_ebitda,
            spinco_debt=request.spinco_debt,
            acquirer_ebitda=request.acquirer_ebitda,
            acquirer_shares=request.acquirer_shares,
            acquirer_share_price=request.acquirer_share_price,
            spinco_ebitda_multiple=request.spinco_ebitda_multiple,
            acquirer_ebitda_multiple=request.acquirer_ebitda_multiple,
            cost_synergies=request.cost_synergies,
            revenue_synergies=request.revenue_synergies,
            synergy_phase_in_years=request.synergy_phase_in_years,
            corporate_tax_rate=request.corporate_tax_rate,
        )

        model = RMTModel(model_id="api", name="Accretion Analysis")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculation failed: {result.errors}"
            )

        return {
            "success": True,
            "accretion_dilution": result.outputs.get("accretion_dilution", {}),
            "synergy_analysis": result.outputs.get("synergy_analysis", {}),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Calculation failed: {str(e)}"
        )
