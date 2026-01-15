"""Report template system for customizable exports."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import uuid4


class TemplateType(Enum):
    """Type of report template."""
    LBO = "lbo"
    DCF = "dcf"
    THREE_STATEMENT = "three_statement"
    OPERATING_MODEL = "operating_model"
    CASH_FLOW_13WEEK = "cash_flow_13week"
    COMPARISON = "comparison"
    CUSTOM = "custom"


class ExportFormat(Enum):
    """Export file format."""
    PDF = "pdf"
    PPTX = "pptx"
    XLSX = "xlsx"


@dataclass
class TemplateSection:
    """A section within a template."""
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    section_type: str = "text"  # text, table, chart, metrics, page_break
    title: str = ""
    data_source: str = ""  # Path to data in model outputs
    visible: bool = True
    order: int = 0
    config: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ReportTemplate:
    """A customizable report template."""
    id: str = field(default_factory=lambda: str(uuid4()))
    name: str = ""
    description: str = ""
    template_type: TemplateType = TemplateType.CUSTOM
    format: ExportFormat = ExportFormat.PDF
    sections: List[TemplateSection] = field(default_factory=list)
    styles: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    created_by: str = ""
    is_default: bool = False


class TemplateManager:
    """Manages report templates."""

    def __init__(self):
        self._templates: Dict[str, ReportTemplate] = {}
        self._register_default_templates()

    def _register_default_templates(self):
        """Register built-in default templates."""

        # LBO Report Template (PDF)
        lbo_pdf = ReportTemplate(
            name="LBO Analysis Report",
            description="Standard LBO analysis report with key metrics and projections",
            template_type=TemplateType.LBO,
            format=ExportFormat.PDF,
            is_default=True,
            sections=[
                TemplateSection(
                    name="executive_summary",
                    section_type="metrics",
                    title="Executive Summary",
                    data_source="key_metrics",
                    order=1,
                    config={
                        "metrics": ["irr", "moic", "entry_ev_ebitda", "exit_equity_value",
                                    "total_equity_invested", "equity_contribution_percent"]
                    }
                ),
                TemplateSection(
                    name="sources_uses",
                    section_type="table",
                    title="Sources & Uses",
                    data_source="sources_uses",
                    order=2,
                ),
                TemplateSection(
                    name="projections",
                    section_type="table",
                    title="Financial Projections",
                    data_source="projections",
                    order=3,
                    config={
                        "columns": ["year", "revenue", "ebitda", "free_cash_flow"]
                    }
                ),
                TemplateSection(
                    name="debt_schedule",
                    section_type="table",
                    title="Debt Schedule",
                    data_source="debt_balances",
                    order=4,
                ),
                TemplateSection(
                    name="returns_analysis",
                    section_type="chart",
                    title="Returns Analysis",
                    data_source="equity_cash_flows",
                    order=5,
                    config={"chart_type": "bar"}
                ),
            ],
            styles={
                "primary_color": (26, 51, 128),
                "accent_color": (51, 153, 76),
                "font_family": "Helvetica",
            }
        )
        self._templates[lbo_pdf.id] = lbo_pdf

        # LBO Presentation Template (PPTX)
        lbo_pptx = ReportTemplate(
            name="LBO Investment Memo",
            description="Investment committee presentation for LBO analysis",
            template_type=TemplateType.LBO,
            format=ExportFormat.PPTX,
            is_default=True,
            sections=[
                TemplateSection(
                    name="summary",
                    section_type="metrics",
                    title="Executive Summary",
                    data_source="key_metrics",
                    order=1,
                ),
                TemplateSection(
                    name="sources_uses",
                    section_type="table",
                    title="Sources & Uses of Funds",
                    data_source="sources_uses",
                    order=2,
                ),
                TemplateSection(
                    name="projections_chart",
                    section_type="chart",
                    title="Revenue & EBITDA Projections",
                    data_source="projections",
                    order=3,
                    config={"chart_type": "bar"}
                ),
                TemplateSection(
                    name="key_considerations",
                    section_type="text",
                    title="Key Investment Considerations",
                    data_source="",
                    order=4,
                    config={
                        "auto_generate": True,
                        "bullet_points": 5
                    }
                ),
            ],
        )
        self._templates[lbo_pptx.id] = lbo_pptx

        # 3-Statement Report Template
        three_stmt = ReportTemplate(
            name="Financial Statements Report",
            description="Comprehensive 3-statement financial analysis",
            template_type=TemplateType.THREE_STATEMENT,
            format=ExportFormat.PDF,
            is_default=True,
            sections=[
                TemplateSection(
                    name="key_metrics",
                    section_type="metrics",
                    title="Key Financial Metrics",
                    data_source="metrics",
                    order=1,
                ),
                TemplateSection(
                    name="income_statement",
                    section_type="table",
                    title="Income Statement Summary",
                    data_source="income_statement",
                    order=2,
                ),
                TemplateSection(
                    name="balance_sheet",
                    section_type="table",
                    title="Balance Sheet Summary",
                    data_source="balance_sheet",
                    order=3,
                ),
                TemplateSection(
                    name="cash_flow",
                    section_type="table",
                    title="Cash Flow Statement",
                    data_source="cash_flow",
                    order=4,
                ),
                TemplateSection(
                    name="ratios_chart",
                    section_type="chart",
                    title="Key Ratios Over Time",
                    data_source="metrics.roic",
                    order=5,
                    config={"chart_type": "line"}
                ),
            ],
        )
        self._templates[three_stmt.id] = three_stmt

        # 13-Week Cash Flow Template
        cash_flow_13wk = ReportTemplate(
            name="13-Week Cash Flow Forecast",
            description="Short-term liquidity forecast report",
            template_type=TemplateType.CASH_FLOW_13WEEK,
            format=ExportFormat.PDF,
            is_default=True,
            sections=[
                TemplateSection(
                    name="liquidity_summary",
                    section_type="metrics",
                    title="Liquidity Summary",
                    data_source="metrics",
                    order=1,
                ),
                TemplateSection(
                    name="weekly_detail",
                    section_type="table",
                    title="Weekly Cash Position",
                    data_source="liquidity",
                    order=2,
                ),
                TemplateSection(
                    name="cash_chart",
                    section_type="chart",
                    title="Cash & Available Liquidity",
                    data_source="liquidity.ending_cash",
                    order=3,
                    config={"chart_type": "line"}
                ),
            ],
        )
        self._templates[cash_flow_13wk.id] = cash_flow_13wk

        # DCF Valuation Template
        dcf = ReportTemplate(
            name="DCF Valuation Analysis",
            description="Discounted cash flow valuation report",
            template_type=TemplateType.DCF,
            format=ExportFormat.PDF,
            is_default=True,
            sections=[
                TemplateSection(
                    name="valuation_summary",
                    section_type="metrics",
                    title="Valuation Summary",
                    data_source="summary",
                    order=1,
                ),
                TemplateSection(
                    name="wacc_build",
                    section_type="table",
                    title="WACC Build-Up",
                    data_source="wacc_components",
                    order=2,
                ),
                TemplateSection(
                    name="fcf_projections",
                    section_type="table",
                    title="Free Cash Flow Projections",
                    data_source="projected_fcf",
                    order=3,
                ),
                TemplateSection(
                    name="sensitivity",
                    section_type="table",
                    title="Sensitivity Analysis",
                    data_source="sensitivity",
                    order=4,
                ),
            ],
        )
        self._templates[dcf.id] = dcf

    def get_template(self, template_id: str) -> Optional[ReportTemplate]:
        """Get a template by ID."""
        return self._templates.get(template_id)

    def list_templates(
        self,
        template_type: Optional[TemplateType] = None,
        format: Optional[ExportFormat] = None,
    ) -> List[ReportTemplate]:
        """List templates with optional filters."""
        templates = list(self._templates.values())

        if template_type:
            templates = [t for t in templates if t.template_type == template_type]
        if format:
            templates = [t for t in templates if t.format == format]

        return templates

    def get_default_template(
        self,
        template_type: TemplateType,
        format: ExportFormat,
    ) -> Optional[ReportTemplate]:
        """Get the default template for a type and format."""
        for template in self._templates.values():
            if (template.template_type == template_type and
                template.format == format and
                template.is_default):
                return template
        return None

    def create_template(
        self,
        name: str,
        template_type: TemplateType,
        format: ExportFormat,
        sections: List[TemplateSection],
        description: str = "",
        styles: Dict[str, Any] = None,
        created_by: str = "",
    ) -> ReportTemplate:
        """Create a new template."""
        template = ReportTemplate(
            name=name,
            description=description,
            template_type=template_type,
            format=format,
            sections=sections,
            styles=styles or {},
            created_by=created_by,
            is_default=False,
        )
        self._templates[template.id] = template
        return template

    def update_template(
        self,
        template_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        sections: Optional[List[TemplateSection]] = None,
        styles: Optional[Dict[str, Any]] = None,
    ) -> Optional[ReportTemplate]:
        """Update an existing template."""
        template = self._templates.get(template_id)
        if not template:
            return None

        if name is not None:
            template.name = name
        if description is not None:
            template.description = description
        if sections is not None:
            template.sections = sections
        if styles is not None:
            template.styles = styles

        return template

    def delete_template(self, template_id: str) -> bool:
        """Delete a template. Cannot delete default templates."""
        template = self._templates.get(template_id)
        if not template or template.is_default:
            return False

        del self._templates[template_id]
        return True

    def clone_template(self, template_id: str, new_name: str) -> Optional[ReportTemplate]:
        """Clone an existing template."""
        original = self._templates.get(template_id)
        if not original:
            return None

        cloned = ReportTemplate(
            name=new_name,
            description=f"Clone of {original.name}",
            template_type=original.template_type,
            format=original.format,
            sections=[
                TemplateSection(
                    name=s.name,
                    section_type=s.section_type,
                    title=s.title,
                    data_source=s.data_source,
                    visible=s.visible,
                    order=s.order,
                    config=s.config.copy(),
                )
                for s in original.sections
            ],
            styles=original.styles.copy(),
            is_default=False,
        )
        self._templates[cloned.id] = cloned
        return cloned

    def export_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Export a template to a serializable format."""
        template = self._templates.get(template_id)
        if not template:
            return None

        return {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "template_type": template.template_type.value,
            "format": template.format.value,
            "sections": [
                {
                    "id": s.id,
                    "name": s.name,
                    "section_type": s.section_type,
                    "title": s.title,
                    "data_source": s.data_source,
                    "visible": s.visible,
                    "order": s.order,
                    "config": s.config,
                }
                for s in template.sections
            ],
            "styles": template.styles,
            "is_default": template.is_default,
        }

    def import_template(self, data: Dict[str, Any]) -> ReportTemplate:
        """Import a template from serialized format."""
        template = ReportTemplate(
            name=data["name"],
            description=data.get("description", ""),
            template_type=TemplateType(data["template_type"]),
            format=ExportFormat(data["format"]),
            sections=[
                TemplateSection(
                    name=s["name"],
                    section_type=s["section_type"],
                    title=s["title"],
                    data_source=s.get("data_source", ""),
                    visible=s.get("visible", True),
                    order=s.get("order", 0),
                    config=s.get("config", {}),
                )
                for s in data.get("sections", [])
            ],
            styles=data.get("styles", {}),
            is_default=False,
        )
        self._templates[template.id] = template
        return template


# Global template manager instance
template_manager = TemplateManager()
