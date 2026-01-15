"""API endpoints for financial models."""

from typing import Any, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import CurrentUser, DbSession, require_analyst
from db.models.base import get_db
from db.models.financial_model import ModelType
from db.models.user import User
from services.model_service import ModelService


router = APIRouter()


# Pydantic schemas for API
class ModelCreateRequest(BaseModel):
    """Request schema for creating a new model."""

    name: str = Field(..., min_length=1, max_length=255)
    model_type: ModelType
    description: Optional[str] = None
    settings: dict[str, Any] = Field(default_factory=dict)


class ModelResponse(BaseModel):
    """Response schema for a financial model."""

    id: str
    name: str
    model_type: str
    description: Optional[str]
    version: int
    owner_id: str
    is_template: bool
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ModelListResponse(BaseModel):
    """Response schema for list of models."""

    items: list[ModelResponse]
    total: int


class CellUpdateRequest(BaseModel):
    """Request schema for updating cells."""

    cells: list[dict[str, Any]]


class CalculationRequest(BaseModel):
    """Request schema for triggering calculation."""

    force_recalculate: bool = False
    scenario_id: Optional[str] = None


class CalculationResponse(BaseModel):
    """Response schema for calculation results."""

    success: bool
    outputs: dict[str, Any]
    errors: list[str] = []
    warnings: list[str] = []
    calculation_time_ms: float


class LBOInputsRequest(BaseModel):
    """Request schema for LBO model inputs."""

    # Transaction
    enterprise_value: float = Field(..., gt=0)
    equity_purchase_price: float = Field(..., gt=0)
    existing_debt: float = 0.0
    transaction_fees: float = 0.0
    financing_fees: float = 0.0

    # Debt structure
    senior_debt_amount: float = 0.0
    senior_debt_rate: float = 0.05
    senior_debt_term_years: int = 7
    senior_debt_amortization: float = 0.0

    subordinated_debt_amount: float = 0.0
    subordinated_debt_rate: float = 0.10
    subordinated_debt_term_years: int = 8

    mezzanine_debt_amount: float = 0.0
    mezzanine_cash_rate: float = 0.08
    mezzanine_pik_rate: float = 0.04

    # Equity
    sponsor_equity: float = 0.0
    management_rollover: float = 0.0

    # Operating assumptions
    projection_years: int = 5
    revenue_base: float = 0.0
    revenue_growth_rates: list[float] = []
    ebitda_margins: list[float] = []
    capex_percent_revenue: float = 0.03
    nwc_percent_revenue: float = 0.10
    tax_rate: float = 0.25
    depreciation_percent_revenue: float = 0.02

    # Exit
    exit_year: int = 5
    exit_multiple: float = 8.0


class LBOSensitivityRequest(BaseModel):
    """Request schema for LBO sensitivity analysis."""

    exit_multiples: list[float] = [6.0, 7.0, 8.0, 9.0, 10.0]
    exit_years: list[int] = [3, 4, 5, 6, 7]


# Endpoints
@router.post("/", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    request: ModelCreateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a new financial model."""
    model = await ModelService.create_model(
        db=db,
        name=request.name,
        model_type=request.model_type,
        owner_id=current_user.id,
        description=request.description,
    )
    await db.commit()

    return ModelResponse(
        id=model.id,
        name=model.name,
        model_type=model.model_type,
        description=model.description,
        version=model.version,
        owner_id=model.owner_id,
        is_template=model.is_template,
        created_at=model.created_at.isoformat() if model.created_at else "",
        updated_at=model.updated_at.isoformat() if model.updated_at else "",
    )


@router.get("/", response_model=ModelListResponse)
async def list_models(
    db: DbSession,
    current_user: CurrentUser,
    model_type: Optional[ModelType] = None,
    include_archived: bool = False,
    limit: int = 100,
    offset: int = 0,
):
    """List all financial models for the current user."""
    models = await ModelService.list_models(
        db=db,
        owner_id=current_user.id,
        model_type=model_type,
        include_archived=include_archived,
        limit=limit,
        offset=offset,
    )

    items = [
        ModelResponse(
            id=m.id,
            name=m.name,
            model_type=m.model_type,
            description=m.description,
            version=m.version,
            owner_id=m.owner_id,
            is_template=m.is_template,
            created_at=m.created_at.isoformat() if m.created_at else "",
            updated_at=m.updated_at.isoformat() if m.updated_at else "",
        )
        for m in models
    ]

    return ModelListResponse(items=items, total=len(items))


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Get a financial model by ID."""
    model = await ModelService.get_model(db, model_id)

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found",
        )

    # Check ownership or admin
    if model.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this model",
        )

    return ModelResponse(
        id=model.id,
        name=model.name,
        model_type=model.model_type,
        description=model.description,
        version=model.version,
        owner_id=model.owner_id,
        is_template=model.is_template,
        created_at=model.created_at.isoformat() if model.created_at else "",
        updated_at=model.updated_at.isoformat() if model.updated_at else "",
    )


@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: str,
    request: ModelCreateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update a financial model."""
    model = await ModelService.get_model(db, model_id)

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found",
        )

    if model.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this model",
        )

    model = await ModelService.update_model(
        db=db,
        model=model,
        name=request.name,
        description=request.description,
        settings=request.settings,
    )
    await db.commit()

    return ModelResponse(
        id=model.id,
        name=model.name,
        model_type=model.model_type,
        description=model.description,
        version=model.version,
        owner_id=model.owner_id,
        is_template=model.is_template,
        created_at=model.created_at.isoformat() if model.created_at else "",
        updated_at=model.updated_at.isoformat() if model.updated_at else "",
    )


@router.delete("/{model_id}")
async def delete_model(
    model_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete (archive) a financial model."""
    model = await ModelService.get_model(db, model_id)

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found",
        )

    if model.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this model",
        )

    await ModelService.delete_model(db, model)
    await db.commit()

    return {"message": "Model deleted successfully"}


@router.put("/{model_id}/cells")
async def update_cells(
    model_id: str,
    request: CellUpdateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Batch update cells in a model."""
    model = await ModelService.get_model(db, model_id)

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found",
        )

    if model.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this model",
        )

    # TODO: Implement cell updates with calculation engine
    await db.commit()

    return {
        "updated_count": len(request.cells),
        "model_id": model_id,
    }


@router.post("/{model_id}/calculate", response_model=CalculationResponse)
async def calculate_model(
    model_id: str,
    request: CalculationRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    """Trigger calculation for a model."""
    model = await ModelService.get_model(db, model_id)

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found",
        )

    # TODO: Implement with calculation engine
    return {
        "success": True,
        "outputs": {},
        "errors": [],
        "warnings": [],
        "calculation_time_ms": 0.0,
    }


# LBO Analysis endpoints (no auth required for standalone analysis)
@router.post("/lbo/analyze", response_model=CalculationResponse)
async def analyze_lbo(request: LBOInputsRequest):
    """Run LBO analysis with provided inputs."""
    from core.models.lbo_model import LBOModel, LBOInputs

    # Convert request to LBOInputs
    inputs = LBOInputs(
        enterprise_value=request.enterprise_value,
        equity_purchase_price=request.equity_purchase_price,
        existing_debt=request.existing_debt,
        transaction_fees=request.transaction_fees,
        financing_fees=request.financing_fees,
        senior_debt_amount=request.senior_debt_amount,
        senior_debt_rate=request.senior_debt_rate,
        senior_debt_term_years=request.senior_debt_term_years,
        senior_debt_amortization=request.senior_debt_amortization,
        subordinated_debt_amount=request.subordinated_debt_amount,
        subordinated_debt_rate=request.subordinated_debt_rate,
        subordinated_debt_term_years=request.subordinated_debt_term_years,
        mezzanine_debt_amount=request.mezzanine_debt_amount,
        mezzanine_cash_rate=request.mezzanine_cash_rate,
        mezzanine_pik_rate=request.mezzanine_pik_rate,
        sponsor_equity=request.sponsor_equity,
        management_rollover=request.management_rollover,
        projection_years=request.projection_years,
        revenue_base=request.revenue_base,
        revenue_growth_rates=request.revenue_growth_rates,
        ebitda_margins=request.ebitda_margins,
        capex_percent_revenue=request.capex_percent_revenue,
        nwc_percent_revenue=request.nwc_percent_revenue,
        tax_rate=request.tax_rate,
        depreciation_percent_revenue=request.depreciation_percent_revenue,
        exit_year=request.exit_year,
        exit_multiple=request.exit_multiple,
    )

    model = LBOModel(model_id="temp", name="LBO Analysis")
    model.set_inputs(inputs)
    result = model.calculate()

    return {
        "success": result.success,
        "outputs": result.outputs,
        "errors": result.errors,
        "warnings": result.warnings,
        "calculation_time_ms": result.calculation_time_ms,
    }


@router.post("/lbo/sensitivity")
async def lbo_sensitivity(
    inputs: LBOInputsRequest,
    sensitivity: LBOSensitivityRequest,
):
    """Run LBO sensitivity analysis on exit multiple and year."""
    from core.models.lbo_model import LBOModel, LBOInputs

    # Convert request to LBOInputs
    lbo_inputs = LBOInputs(
        enterprise_value=inputs.enterprise_value,
        equity_purchase_price=inputs.equity_purchase_price,
        existing_debt=inputs.existing_debt,
        transaction_fees=inputs.transaction_fees,
        financing_fees=inputs.financing_fees,
        senior_debt_amount=inputs.senior_debt_amount,
        senior_debt_rate=inputs.senior_debt_rate,
        senior_debt_term_years=inputs.senior_debt_term_years,
        senior_debt_amortization=inputs.senior_debt_amortization,
        subordinated_debt_amount=inputs.subordinated_debt_amount,
        subordinated_debt_rate=inputs.subordinated_debt_rate,
        subordinated_debt_term_years=inputs.subordinated_debt_term_years,
        mezzanine_debt_amount=inputs.mezzanine_debt_amount,
        mezzanine_cash_rate=inputs.mezzanine_cash_rate,
        mezzanine_pik_rate=inputs.mezzanine_pik_rate,
        sponsor_equity=inputs.sponsor_equity,
        management_rollover=inputs.management_rollover,
        projection_years=inputs.projection_years,
        revenue_base=inputs.revenue_base,
        revenue_growth_rates=inputs.revenue_growth_rates,
        ebitda_margins=inputs.ebitda_margins,
        capex_percent_revenue=inputs.capex_percent_revenue,
        nwc_percent_revenue=inputs.nwc_percent_revenue,
        tax_rate=inputs.tax_rate,
        depreciation_percent_revenue=inputs.depreciation_percent_revenue,
        exit_year=inputs.exit_year,
        exit_multiple=inputs.exit_multiple,
    )

    model = LBOModel(model_id="temp", name="LBO Analysis")
    model.set_inputs(lbo_inputs)

    sensitivity_result = model.run_returns_sensitivity(
        exit_multiples=sensitivity.exit_multiples,
        exit_years=sensitivity.exit_years,
    )

    return {
        "exit_multiples": sensitivity.exit_multiples,
        "exit_years": sensitivity.exit_years,
        "irr_matrix": sensitivity_result["irr"],
        "moic_matrix": sensitivity_result["moic"],
    }
