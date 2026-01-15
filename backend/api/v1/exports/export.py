"""Export API endpoints for PDF and PowerPoint generation."""

from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io

from services.pdf_service import PDFExportService, ReportConfig, ReportSection
from services.pptx_service import PowerPointExportService, PresentationConfig, SlideConfig
from services.report_templates import (
    template_manager,
    TemplateType,
    ExportFormat,
    ReportTemplate,
    TemplateSection,
)
from core.models import LBOModel, LBOInputs, ThreeStatementModel, ThreeStatementInputs
from core.models import CashFlow13WeekModel, CashFlowInputs

router = APIRouter(prefix="/export", tags=["Export"])


# ===== Request/Response Models =====

class ExportRequest(BaseModel):
    """Base export request."""
    title: str = "Financial Report"
    subtitle: str = ""
    company_name: str = ""
    prepared_by: str = ""
    prepared_for: str = ""


class LBOExportRequest(ExportRequest):
    """LBO export request with model inputs."""
    inputs: Dict[str, Any]
    template_id: Optional[str] = None


class ThreeStatementExportRequest(ExportRequest):
    """3-statement export request."""
    inputs: Dict[str, Any]
    template_id: Optional[str] = None


class CashFlowExportRequest(ExportRequest):
    """13-week cash flow export request."""
    inputs: Dict[str, Any]
    template_id: Optional[str] = None


class CustomExportRequest(ExportRequest):
    """Custom report export request."""
    sections: List[Dict[str, Any]]
    format: str = "pdf"  # pdf or pptx


class TemplateResponse(BaseModel):
    """Template response."""
    id: str
    name: str
    description: str
    template_type: str
    format: str
    is_default: bool


class TemplateSectionInput(BaseModel):
    """Template section input."""
    name: str
    section_type: str
    title: str
    data_source: str = ""
    visible: bool = True
    order: int = 0
    config: Dict[str, Any] = {}


class TemplateCreateRequest(BaseModel):
    """Create template request."""
    name: str
    description: str = ""
    template_type: str
    format: str
    sections: List[TemplateSectionInput]
    styles: Dict[str, Any] = {}


# ===== PDF Export Endpoints =====

@router.post("/pdf/lbo")
async def export_lbo_pdf(request: LBOExportRequest):
    """Generate PDF report for LBO analysis."""
    try:
        # Create and run LBO model
        lbo_inputs = LBOInputs(**request.inputs)
        model = LBOModel(model_id="export", name="Export Model")
        model.set_inputs(lbo_inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model calculation failed: {result.errors}"
            )

        # Configure PDF service
        config = ReportConfig(
            title=request.title or "LBO Analysis Report",
            subtitle=request.subtitle,
            company_name=request.company_name,
            prepared_by=request.prepared_by,
            prepared_for=request.prepared_for,
        )

        service = PDFExportService(config)
        pdf_bytes = service.generate_lbo_report(result.outputs, request.inputs)

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=lbo_analysis.pdf"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.post("/pdf/three-statement")
async def export_three_statement_pdf(request: ThreeStatementExportRequest):
    """Generate PDF report for 3-statement model."""
    try:
        # Create and run model
        inputs = ThreeStatementInputs(**request.inputs)
        model = ThreeStatementModel(model_id="export", name="Export Model")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model calculation failed: {result.errors}"
            )

        config = ReportConfig(
            title=request.title or "Financial Statements Report",
            subtitle=request.subtitle,
            company_name=request.company_name,
            prepared_by=request.prepared_by,
        )

        service = PDFExportService(config)
        pdf_bytes = service.generate_three_statement_report(result.outputs)

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=financial_statements.pdf"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.post("/pdf/13-week-cash-flow")
async def export_13week_pdf(request: CashFlowExportRequest):
    """Generate PDF report for 13-week cash flow."""
    try:
        inputs = CashFlowInputs(**request.inputs)
        model = CashFlow13WeekModel(model_id="export", name="Export Model")
        model.set_inputs(inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model calculation failed: {result.errors}"
            )

        config = ReportConfig(
            title=request.title or "13-Week Cash Flow Forecast",
            subtitle=request.subtitle,
            company_name=request.company_name,
            prepared_by=request.prepared_by,
        )

        service = PDFExportService(config)
        pdf_bytes = service.generate_13week_report(result.outputs)

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=13_week_cash_flow.pdf"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.post("/pdf/custom")
async def export_custom_pdf(request: CustomExportRequest):
    """Generate custom PDF report with specified sections."""
    try:
        config = ReportConfig(
            title=request.title,
            subtitle=request.subtitle,
            company_name=request.company_name,
            prepared_by=request.prepared_by,
            prepared_for=request.prepared_for,
        )

        sections = [
            ReportSection(
                title=s.get("title", ""),
                section_type=s.get("type", "text"),
                content=s.get("content"),
            )
            for s in request.sections
        ]

        service = PDFExportService(config)
        pdf_bytes = service.generate_report(sections)

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=custom_report.pdf"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


# ===== PowerPoint Export Endpoints =====

@router.post("/pptx/lbo")
async def export_lbo_pptx(request: LBOExportRequest):
    """Generate PowerPoint presentation for LBO analysis."""
    try:
        lbo_inputs = LBOInputs(**request.inputs)
        model = LBOModel(model_id="export", name="Export Model")
        model.set_inputs(lbo_inputs)
        result = model.calculate()

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model calculation failed: {result.errors}"
            )

        config = PresentationConfig(
            title=request.title or "LBO Analysis",
            subtitle=request.subtitle or "Investment Committee Presentation",
            company_name=request.company_name,
            prepared_by=request.prepared_by,
        )

        service = PowerPointExportService(config)
        pptx_bytes = service.generate_lbo_presentation(result.outputs)

        return StreamingResponse(
            io.BytesIO(pptx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename=lbo_presentation.pptx"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.post("/pptx/valuation")
async def export_valuation_pptx(request: Dict[str, Any]):
    """Generate valuation summary presentation."""
    try:
        dcf_data = request.get("dcf", {})
        comps_data = request.get("comps")
        precedents_data = request.get("precedents")

        config = PresentationConfig(
            title=request.get("title", "Valuation Analysis"),
            subtitle=request.get("subtitle", ""),
            company_name=request.get("company_name", ""),
            prepared_by=request.get("prepared_by", ""),
        )

        service = PowerPointExportService(config)
        pptx_bytes = service.generate_valuation_presentation(
            dcf_data, comps_data, precedents_data
        )

        return StreamingResponse(
            io.BytesIO(pptx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename=valuation_presentation.pptx"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.post("/pptx/scenario-comparison")
async def export_scenario_comparison_pptx(request: Dict[str, Any]):
    """Generate scenario comparison presentation."""
    try:
        scenarios = request.get("scenarios", {})

        config = PresentationConfig(
            title=request.get("title", "Scenario Analysis"),
            subtitle=request.get("subtitle", ""),
            company_name=request.get("company_name", ""),
            prepared_by=request.get("prepared_by", ""),
        )

        service = PowerPointExportService(config)
        pptx_bytes = service.generate_scenario_comparison(scenarios)

        return StreamingResponse(
            io.BytesIO(pptx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename=scenario_comparison.pptx"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


@router.post("/pptx/custom")
async def export_custom_pptx(request: CustomExportRequest):
    """Generate custom PowerPoint presentation."""
    try:
        config = PresentationConfig(
            title=request.title,
            subtitle=request.subtitle,
            company_name=request.company_name,
            prepared_by=request.prepared_by,
        )

        slides = [
            SlideConfig(
                title=s.get("title", ""),
                subtitle=s.get("subtitle", ""),
                slide_type=s.get("type", "content"),
                content=s.get("content"),
                notes=s.get("notes", ""),
            )
            for s in request.sections
        ]

        service = PowerPointExportService(config)
        pptx_bytes = service.generate_presentation(slides)

        return StreamingResponse(
            io.BytesIO(pptx_bytes),
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename=custom_presentation.pptx"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )


# ===== Template Management Endpoints =====

@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates(
    template_type: Optional[str] = Query(None, description="Filter by template type"),
    format: Optional[str] = Query(None, description="Filter by format (pdf, pptx)"),
):
    """List available report templates."""
    type_filter = TemplateType(template_type) if template_type else None
    format_filter = ExportFormat(format) if format else None

    templates = template_manager.list_templates(type_filter, format_filter)

    return [
        TemplateResponse(
            id=t.id,
            name=t.name,
            description=t.description,
            template_type=t.template_type.value,
            format=t.format.value,
            is_default=t.is_default,
        )
        for t in templates
    ]


@router.get("/templates/{template_id}")
async def get_template(template_id: str):
    """Get a specific template."""
    template = template_manager.get_template(template_id)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    return template_manager.export_template(template_id)


@router.post("/templates", response_model=TemplateResponse)
async def create_template(request: TemplateCreateRequest):
    """Create a new report template."""
    try:
        sections = [
            TemplateSection(
                name=s.name,
                section_type=s.section_type,
                title=s.title,
                data_source=s.data_source,
                visible=s.visible,
                order=s.order,
                config=s.config,
            )
            for s in request.sections
        ]

        template = template_manager.create_template(
            name=request.name,
            description=request.description,
            template_type=TemplateType(request.template_type),
            format=ExportFormat(request.format),
            sections=sections,
            styles=request.styles,
        )

        return TemplateResponse(
            id=template.id,
            name=template.name,
            description=template.description,
            template_type=template.template_type.value,
            format=template.format.value,
            is_default=template.is_default,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create template: {str(e)}"
        )


@router.delete("/templates/{template_id}")
async def delete_template(template_id: str):
    """Delete a template (cannot delete default templates)."""
    success = template_manager.delete_template(template_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete template (not found or is a default template)"
        )

    return {"message": "Template deleted successfully"}


@router.post("/templates/{template_id}/clone")
async def clone_template(template_id: str, new_name: str = Query(...)):
    """Clone an existing template."""
    template = template_manager.clone_template(template_id, new_name)

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )

    return TemplateResponse(
        id=template.id,
        name=template.name,
        description=template.description,
        template_type=template.template_type.value,
        format=template.format.value,
        is_default=template.is_default,
    )
