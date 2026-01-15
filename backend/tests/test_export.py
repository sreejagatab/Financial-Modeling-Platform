"""Tests for export services - PDF and PowerPoint generation."""

import pytest
from io import BytesIO

from services.pdf_service import PDFExportService, ReportConfig, ReportSection
from services.pptx_service import PowerPointExportService, PresentationConfig, SlideConfig
from services.report_templates import (
    TemplateManager,
    TemplateType,
    ExportFormat,
    TemplateSection,
)


class TestPDFExportService:
    """Tests for PDF export service."""

    def test_pdf_service_initialization(self):
        """Test PDF service initializes correctly."""
        service = PDFExportService()
        assert service.config is not None
        assert service.styles is not None

    def test_pdf_service_with_config(self):
        """Test PDF service with custom config."""
        config = ReportConfig(
            title="Custom Report",
            company_name="Test Company",
            prepared_by="Test User",
        )
        service = PDFExportService(config)
        assert service.config.title == "Custom Report"
        assert service.config.company_name == "Test Company"

    def test_generate_empty_report(self):
        """Test generating a report with no sections."""
        service = PDFExportService()
        pdf_bytes = service.generate_report([])

        assert pdf_bytes is not None
        assert len(pdf_bytes) > 0
        assert pdf_bytes[:4] == b'%PDF'  # PDF magic bytes

    def test_generate_text_section(self):
        """Test generating a report with text section."""
        service = PDFExportService()
        sections = [
            ReportSection(
                title="Introduction",
                section_type="text",
                content="This is a test report with sample content.",
            )
        ]
        pdf_bytes = service.generate_report(sections)

        assert pdf_bytes is not None
        assert len(pdf_bytes) > 0

    def test_generate_metrics_section(self):
        """Test generating a report with metrics section."""
        service = PDFExportService()
        sections = [
            ReportSection(
                title="Key Metrics",
                section_type="metrics",
                content={
                    "IRR": "25.5%",
                    "MOIC": "2.5x",
                    "Investment": "$100M",
                }
            )
        ]
        pdf_bytes = service.generate_report(sections)

        assert pdf_bytes is not None
        assert len(pdf_bytes) > 0

    def test_generate_table_section(self):
        """Test generating a report with table section."""
        service = PDFExportService()
        sections = [
            ReportSection(
                title="Financial Summary",
                section_type="table",
                content={
                    "headers": ["Year", "Revenue", "EBITDA"],
                    "rows": [
                        ["2024", "$100M", "$20M"],
                        ["2025", "$110M", "$24M"],
                    ]
                }
            )
        ]
        pdf_bytes = service.generate_report(sections)

        assert pdf_bytes is not None
        assert len(pdf_bytes) > 0

    def test_generate_lbo_report(self):
        """Test generating LBO analysis report."""
        service = PDFExportService()
        lbo_outputs = {
            "irr": 0.25,
            "moic": 2.5,
            "entry_ev_ebitda": 8.0,
            "exit_equity_value": 500000,
            "total_equity_invested": 200000,
            "equity_contribution_percent": 0.4,
            "sources": {"Senior Debt": 300, "Equity": 200},
            "uses": {"Purchase Price": 500},
            "years": [1, 2, 3, 4, 5],
            "revenues": [100, 110, 121, 133, 146],
            "ebitda": [20, 24, 29, 35, 42],
            "free_cash_flow": [10, 15, 20, 25, 30],
        }

        pdf_bytes = service.generate_lbo_report(lbo_outputs)

        assert pdf_bytes is not None
        assert len(pdf_bytes) > 0
        assert pdf_bytes[:4] == b'%PDF'

    def test_generate_three_statement_report(self):
        """Test generating 3-statement report."""
        service = PDFExportService()
        outputs = {
            "years": [1, 2, 3],
            "income_statement": {
                "revenue": [1000000, 1100000, 1210000],
                "gross_profit": [400000, 450000, 510000],
                "ebitda": [200000, 230000, 270000],
                "ebitda_margin": [0.20, 0.21, 0.22],
                "net_income": [100000, 120000, 145000],
            },
            "balance_sheet": {
                "total_assets": [2000000, 2200000, 2400000],
                "total_liabilities": [1000000, 1050000, 1100000],
                "total_equity": [1000000, 1150000, 1300000],
            },
            "metrics": {
                "free_cash_flow": [80000, 100000, 130000],
                "roe": [0.10, 0.11, 0.12],
                "roic": [0.08, 0.09, 0.10],
            },
        }

        pdf_bytes = service.generate_three_statement_report(outputs)

        assert pdf_bytes is not None
        assert len(pdf_bytes) > 0

    def test_generate_13week_report(self):
        """Test generating 13-week cash flow report."""
        service = PDFExportService()
        outputs = {
            "weeks": list(range(1, 14)),
            "week_ending_dates": [f"2024-01-{7*i}" for i in range(1, 14)],
            "receipts": {
                "total": [200000] * 13,
            },
            "liquidity": {
                "beginning_cash": [500000] + [520000] * 12,
                "ending_cash": [520000] * 13,
                "available_liquidity": [1500000] * 13,
            },
            "metrics": {
                "minimum_cash_week": 6,
                "minimum_cash_amount": 400000,
                "peak_revolver_usage": 200000,
                "weeks_of_runway": 15.5,
            },
        }

        pdf_bytes = service.generate_13week_report(outputs)

        assert pdf_bytes is not None
        assert len(pdf_bytes) > 0


class TestPowerPointExportService:
    """Tests for PowerPoint export service."""

    def test_pptx_service_initialization(self):
        """Test PPTX service initializes correctly."""
        service = PowerPointExportService()
        assert service.config is not None
        assert service.prs is not None

    def test_pptx_service_with_config(self):
        """Test PPTX service with custom config."""
        config = PresentationConfig(
            title="Investment Memo",
            company_name="Target Corp",
            prepared_by="Investment Team",
        )
        service = PowerPointExportService(config)
        assert service.config.title == "Investment Memo"

    def test_generate_empty_presentation(self):
        """Test generating presentation with no slides."""
        service = PowerPointExportService()
        pptx_bytes = service.generate_presentation([])

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0
        # PPTX files start with PK (ZIP format)
        assert pptx_bytes[:2] == b'PK'

    def test_generate_content_slide(self):
        """Test generating presentation with content slide."""
        service = PowerPointExportService()
        slides = [
            SlideConfig(
                title="Overview",
                slide_type="content",
                content=["Point 1", "Point 2", "Point 3"],
            )
        ]
        pptx_bytes = service.generate_presentation(slides)

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0

    def test_generate_metrics_slide(self):
        """Test generating presentation with metrics slide."""
        service = PowerPointExportService()
        slides = [
            SlideConfig(
                title="Key Metrics",
                slide_type="metrics",
                content={
                    "IRR": "25.5%",
                    "MOIC": "2.5x",
                    "Investment": "$100M",
                    "Holding Period": "5 Years",
                }
            )
        ]
        pptx_bytes = service.generate_presentation(slides)

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0

    def test_generate_table_slide(self):
        """Test generating presentation with table slide."""
        service = PowerPointExportService()
        slides = [
            SlideConfig(
                title="Financial Summary",
                slide_type="table",
                content={
                    "headers": ["Year", "Revenue", "EBITDA"],
                    "rows": [
                        ["2024", "$100M", "$20M"],
                        ["2025", "$110M", "$24M"],
                    ]
                }
            )
        ]
        pptx_bytes = service.generate_presentation(slides)

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0

    def test_generate_chart_slide(self):
        """Test generating presentation with chart slide."""
        service = PowerPointExportService()
        slides = [
            SlideConfig(
                title="Revenue Growth",
                slide_type="chart",
                content={
                    "type": "bar",
                    "categories": ["2024", "2025", "2026"],
                    "series": [
                        {"name": "Revenue", "values": [100, 120, 145]},
                    ]
                }
            )
        ]
        pptx_bytes = service.generate_presentation(slides)

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0

    def test_generate_comparison_slide(self):
        """Test generating presentation with comparison slide."""
        service = PowerPointExportService()
        slides = [
            SlideConfig(
                title="Scenario Comparison",
                slide_type="comparison",
                content=[
                    {
                        "title": "Base Case",
                        "items": ["IRR: 20%", "MOIC: 2.0x"],
                    },
                    {
                        "title": "Upside Case",
                        "items": ["IRR: 30%", "MOIC: 3.0x"],
                    }
                ]
            )
        ]
        pptx_bytes = service.generate_presentation(slides)

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0

    def test_generate_lbo_presentation(self):
        """Test generating LBO presentation."""
        service = PowerPointExportService()
        outputs = {
            "irr": 0.25,
            "moic": 2.5,
            "entry_ev_ebitda": 8.0,
            "exit_equity_value": 500000,
            "total_equity_invested": 200000,
            "exit_year": 5,
            "sources": {"Senior Debt": 300, "Equity": 200},
            "uses": {"Purchase Price": 500},
            "years": [1, 2, 3, 4, 5],
            "revenues": [100, 110, 121, 133, 146],
            "ebitda": [20, 24, 29, 35, 42],
        }

        pptx_bytes = service.generate_lbo_presentation(outputs)

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0

    def test_generate_scenario_comparison(self):
        """Test generating scenario comparison presentation."""
        service = PowerPointExportService()
        scenarios = {
            "Base Case": {"irr": 0.20, "moic": 2.0, "exit_equity_value": 400000},
            "Upside Case": {"irr": 0.30, "moic": 3.0, "exit_equity_value": 600000},
        }

        pptx_bytes = service.generate_scenario_comparison(scenarios)

        assert pptx_bytes is not None
        assert len(pptx_bytes) > 0


class TestTemplateManager:
    """Tests for template management."""

    def test_template_manager_initialization(self):
        """Test template manager initializes with defaults."""
        manager = TemplateManager()
        templates = manager.list_templates()

        assert len(templates) > 0

    def test_list_templates_by_type(self):
        """Test listing templates by type."""
        manager = TemplateManager()
        lbo_templates = manager.list_templates(template_type=TemplateType.LBO)

        assert len(lbo_templates) > 0
        assert all(t.template_type == TemplateType.LBO for t in lbo_templates)

    def test_list_templates_by_format(self):
        """Test listing templates by format."""
        manager = TemplateManager()
        pdf_templates = manager.list_templates(format=ExportFormat.PDF)

        assert len(pdf_templates) > 0
        assert all(t.format == ExportFormat.PDF for t in pdf_templates)

    def test_get_default_template(self):
        """Test getting default template."""
        manager = TemplateManager()
        template = manager.get_default_template(
            TemplateType.LBO,
            ExportFormat.PDF
        )

        assert template is not None
        assert template.is_default is True
        assert template.template_type == TemplateType.LBO

    def test_create_custom_template(self):
        """Test creating a custom template."""
        manager = TemplateManager()
        sections = [
            TemplateSection(
                name="summary",
                section_type="metrics",
                title="Summary",
                order=1,
            )
        ]

        template = manager.create_template(
            name="Custom LBO Template",
            template_type=TemplateType.LBO,
            format=ExportFormat.PDF,
            sections=sections,
            description="A custom template",
        )

        assert template is not None
        assert template.name == "Custom LBO Template"
        assert template.is_default is False

    def test_clone_template(self):
        """Test cloning a template."""
        manager = TemplateManager()
        templates = manager.list_templates(template_type=TemplateType.LBO)

        if templates:
            original = templates[0]
            cloned = manager.clone_template(original.id, "Cloned Template")

            assert cloned is not None
            assert cloned.name == "Cloned Template"
            assert cloned.id != original.id
            assert len(cloned.sections) == len(original.sections)

    def test_delete_custom_template(self):
        """Test deleting a custom template."""
        manager = TemplateManager()
        template = manager.create_template(
            name="To Delete",
            template_type=TemplateType.CUSTOM,
            format=ExportFormat.PDF,
            sections=[],
        )

        result = manager.delete_template(template.id)
        assert result is True

        deleted = manager.get_template(template.id)
        assert deleted is None

    def test_cannot_delete_default_template(self):
        """Test that default templates cannot be deleted."""
        manager = TemplateManager()
        default = manager.get_default_template(TemplateType.LBO, ExportFormat.PDF)

        if default:
            result = manager.delete_template(default.id)
            assert result is False

            still_exists = manager.get_template(default.id)
            assert still_exists is not None

    def test_export_import_template(self):
        """Test exporting and importing templates."""
        manager = TemplateManager()
        template = manager.create_template(
            name="Export Test",
            template_type=TemplateType.CUSTOM,
            format=ExportFormat.PDF,
            sections=[
                TemplateSection(name="test", section_type="text", title="Test")
            ],
        )

        exported = manager.export_template(template.id)
        assert exported is not None
        assert exported["name"] == "Export Test"

        # Import into new manager
        new_manager = TemplateManager()
        imported = new_manager.import_template(exported)

        assert imported is not None
        assert imported.name == "Export Test"
        assert len(imported.sections) == 1
