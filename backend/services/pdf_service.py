"""PDF export service for financial reports."""

import io
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Image,
    KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.graphics.shapes import Drawing, Line
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.widgets.markers import makeMarker


@dataclass
class ReportSection:
    """A section in the report."""
    title: str
    content: Any
    section_type: str = "text"  # text, table, chart, metrics


@dataclass
class ReportConfig:
    """Configuration for PDF report generation."""
    title: str = "Financial Report"
    subtitle: str = ""
    company_name: str = ""
    prepared_by: str = ""
    prepared_for: str = ""
    date: str = field(default_factory=lambda: datetime.now().strftime("%B %d, %Y"))
    page_size: str = "letter"  # letter or a4
    include_toc: bool = True
    include_page_numbers: bool = True
    logo_path: Optional[str] = None
    primary_color: Tuple[float, float, float] = (0.1, 0.2, 0.5)  # RGB
    accent_color: Tuple[float, float, float] = (0.2, 0.6, 0.3)


class PDFExportService:
    """Service for generating PDF reports from financial data."""

    def __init__(self, config: Optional[ReportConfig] = None):
        self.config = config or ReportConfig()
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Set up custom paragraph styles."""
        primary = colors.Color(*self.config.primary_color)

        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=12,
            textColor=primary,
            alignment=TA_CENTER,
        ))

        self.styles.add(ParagraphStyle(
            name='ReportSubtitle',
            parent=self.styles['Normal'],
            fontSize=14,
            spaceAfter=24,
            textColor=colors.gray,
            alignment=TA_CENTER,
        ))

        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=12,
            textColor=primary,
        ))

        self.styles.add(ParagraphStyle(
            name='SubsectionTitle',
            parent=self.styles['Heading3'],
            fontSize=12,
            spaceBefore=12,
            spaceAfter=8,
            textColor=primary,
        ))

        self.styles.add(ParagraphStyle(
            name='MetricLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.gray,
        ))

        self.styles.add(ParagraphStyle(
            name='MetricValue',
            parent=self.styles['Normal'],
            fontSize=14,
            fontName='Helvetica-Bold',
        ))

    def generate_report(
        self,
        sections: List[ReportSection],
        output_path: Optional[str] = None,
    ) -> bytes:
        """Generate a PDF report from sections.

        Args:
            sections: List of report sections
            output_path: Optional path to save the file

        Returns:
            PDF content as bytes
        """
        buffer = io.BytesIO()

        page_size = letter if self.config.page_size == "letter" else A4
        doc = SimpleDocTemplate(
            buffer,
            pagesize=page_size,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        story = []

        # Title page
        story.extend(self._build_title_page())
        story.append(PageBreak())

        # Table of contents (if enabled)
        if self.config.include_toc and len(sections) > 1:
            story.extend(self._build_toc(sections))
            story.append(PageBreak())

        # Content sections
        for section in sections:
            story.extend(self._build_section(section))
            story.append(Spacer(1, 0.25 * inch))

        # Build PDF
        doc.build(
            story,
            onFirstPage=self._add_page_number if self.config.include_page_numbers else None,
            onLaterPages=self._add_page_number if self.config.include_page_numbers else None,
        )

        pdf_content = buffer.getvalue()
        buffer.close()

        if output_path:
            with open(output_path, 'wb') as f:
                f.write(pdf_content)

        return pdf_content

    def _build_title_page(self) -> List:
        """Build the title page elements."""
        elements = []

        elements.append(Spacer(1, 2 * inch))

        # Logo if provided
        if self.config.logo_path:
            try:
                logo = Image(self.config.logo_path, width=2*inch, height=1*inch)
                elements.append(logo)
                elements.append(Spacer(1, 0.5 * inch))
            except Exception:
                pass

        # Title
        elements.append(Paragraph(self.config.title, self.styles['ReportTitle']))

        if self.config.subtitle:
            elements.append(Paragraph(self.config.subtitle, self.styles['ReportSubtitle']))

        elements.append(Spacer(1, 1 * inch))

        # Metadata
        meta_data = []
        if self.config.company_name:
            meta_data.append(["Company:", self.config.company_name])
        if self.config.prepared_for:
            meta_data.append(["Prepared For:", self.config.prepared_for])
        if self.config.prepared_by:
            meta_data.append(["Prepared By:", self.config.prepared_by])
        meta_data.append(["Date:", self.config.date])

        if meta_data:
            meta_table = Table(meta_data, colWidths=[1.5*inch, 3*inch])
            meta_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.gray),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(meta_table)

        return elements

    def _build_toc(self, sections: List[ReportSection]) -> List:
        """Build table of contents."""
        elements = []

        elements.append(Paragraph("Table of Contents", self.styles['SectionTitle']))
        elements.append(Spacer(1, 0.25 * inch))

        toc_data = []
        for i, section in enumerate(sections, 1):
            toc_data.append([f"{i}.", section.title, ""])

        if toc_data:
            toc_table = Table(toc_data, colWidths=[0.3*inch, 5*inch, 0.5*inch])
            toc_table.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(toc_table)

        return elements

    def _build_section(self, section: ReportSection) -> List:
        """Build a content section."""
        elements = []

        elements.append(Paragraph(section.title, self.styles['SectionTitle']))

        if section.section_type == "text":
            if isinstance(section.content, str):
                elements.append(Paragraph(section.content, self.styles['Normal']))
            elif isinstance(section.content, list):
                for para in section.content:
                    elements.append(Paragraph(para, self.styles['Normal']))
                    elements.append(Spacer(1, 0.1 * inch))

        elif section.section_type == "table":
            table = self._build_data_table(section.content)
            elements.append(table)

        elif section.section_type == "metrics":
            metrics_table = self._build_metrics_grid(section.content)
            elements.append(metrics_table)

        elif section.section_type == "chart":
            chart = self._build_chart(section.content)
            if chart:
                elements.append(chart)

        return elements

    def _build_data_table(self, data: Dict[str, Any]) -> Table:
        """Build a data table from dictionary."""
        headers = data.get("headers", [])
        rows = data.get("rows", [])

        table_data = [headers] + rows if headers else rows

        if not table_data:
            return Spacer(1, 0)

        # Calculate column widths
        num_cols = len(table_data[0]) if table_data else 0
        col_width = 6.5 * inch / num_cols if num_cols else 1 * inch

        table = Table(table_data, colWidths=[col_width] * num_cols)

        primary = colors.Color(*self.config.primary_color)

        style = [
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), primary),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),

            # Body styling
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 8),

            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),

            # Alternate row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.Color(0.95, 0.95, 0.95)]),
        ]

        # Right align numeric columns (assume columns 1+ are numeric if headers exist)
        if headers and len(headers) > 1:
            style.append(('ALIGN', (1, 0), (-1, -1), 'RIGHT'))

        table.setStyle(TableStyle(style))
        return table

    def _build_metrics_grid(self, metrics: Dict[str, Any]) -> Table:
        """Build a grid of key metrics."""
        items = list(metrics.items())

        # Create 2-column layout
        rows = []
        for i in range(0, len(items), 2):
            row = []
            for j in range(2):
                if i + j < len(items):
                    label, value = items[i + j]
                    cell_content = [
                        Paragraph(label, self.styles['MetricLabel']),
                        Paragraph(str(value), self.styles['MetricValue']),
                    ]
                    row.append(cell_content)
                else:
                    row.append("")
            rows.append(row)

        if not rows:
            return Spacer(1, 0)

        table = Table(rows, colWidths=[3.25*inch, 3.25*inch])
        table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ]))

        return table

    def _build_chart(self, chart_data: Dict[str, Any]) -> Optional[Drawing]:
        """Build a chart from data."""
        chart_type = chart_data.get("type", "line")

        if chart_type == "line":
            return self._build_line_chart(chart_data)
        elif chart_type == "bar":
            return self._build_bar_chart(chart_data)

        return None

    def _build_line_chart(self, data: Dict[str, Any]) -> Drawing:
        """Build a line chart."""
        drawing = Drawing(500, 200)

        lp = LinePlot()
        lp.x = 50
        lp.y = 30
        lp.height = 150
        lp.width = 400

        series_data = data.get("series", [])
        if series_data:
            lp.data = series_data

        lp.lines[0].strokeColor = colors.Color(*self.config.primary_color)
        lp.lines[0].symbol = makeMarker('Circle')

        if len(series_data) > 1:
            lp.lines[1].strokeColor = colors.Color(*self.config.accent_color)

        labels = data.get("labels", [])
        if labels:
            lp.xValueAxis.valueSteps = list(range(len(labels)))

        drawing.add(lp)
        return drawing

    def _build_bar_chart(self, data: Dict[str, Any]) -> Drawing:
        """Build a bar chart."""
        drawing = Drawing(500, 200)

        bc = VerticalBarChart()
        bc.x = 50
        bc.y = 30
        bc.height = 150
        bc.width = 400

        chart_data = data.get("data", [[]])
        bc.data = chart_data

        bc.bars[0].fillColor = colors.Color(*self.config.primary_color)

        labels = data.get("labels", [])
        if labels:
            bc.categoryAxis.categoryNames = labels

        drawing.add(bc)
        return drawing

    def _add_page_number(self, canvas, doc):
        """Add page number to each page."""
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.gray)
        canvas.drawRightString(
            doc.pagesize[0] - 0.75 * inch,
            0.5 * inch,
            text
        )
        canvas.restoreState()

    # ===== Specialized Report Generators =====

    def generate_lbo_report(self, lbo_outputs: Dict[str, Any], inputs: Dict[str, Any] = None) -> bytes:
        """Generate an LBO analysis report."""
        sections = []

        # Executive Summary
        sections.append(ReportSection(
            title="Executive Summary",
            section_type="metrics",
            content={
                "IRR": f"{lbo_outputs.get('irr', 0):.1%}",
                "MOIC": f"{lbo_outputs.get('moic', 0):.2f}x",
                "Entry EV/EBITDA": f"{lbo_outputs.get('entry_ev_ebitda', 0):.1f}x",
                "Exit Equity Value": f"${lbo_outputs.get('exit_equity_value', 0):,.0f}",
                "Total Equity Invested": f"${lbo_outputs.get('total_equity_invested', 0):,.0f}",
                "Equity Contribution": f"{lbo_outputs.get('equity_contribution_percent', 0):.1%}",
            }
        ))

        # Sources & Uses
        sources = lbo_outputs.get('sources', {})
        uses = lbo_outputs.get('uses', {})

        su_rows = []
        for name, value in sources.items():
            if value > 0:
                su_rows.append([name, f"${value:,.0f}", "", ""])
        for name, value in uses.items():
            if value > 0:
                if len(su_rows) > len([n for n, v in sources.items() if v > 0]):
                    su_rows.append(["", "", name, f"${value:,.0f}"])
                else:
                    idx = len([n for n, v in uses.items() if v > 0]) - 1
                    if idx < len(su_rows):
                        su_rows[idx][2] = name
                        su_rows[idx][3] = f"${value:,.0f}"

        sections.append(ReportSection(
            title="Sources & Uses",
            section_type="table",
            content={
                "headers": ["Sources", "Amount", "Uses", "Amount"],
                "rows": su_rows if su_rows else [["N/A", "", "N/A", ""]],
            }
        ))

        # Projections
        years = lbo_outputs.get('years', [])
        revenues = lbo_outputs.get('revenues', [])
        ebitda = lbo_outputs.get('ebitda', [])
        fcf = lbo_outputs.get('free_cash_flow', [])

        if years:
            proj_rows = []
            for i, year in enumerate(years):
                proj_rows.append([
                    f"Year {year}",
                    f"${revenues[i]:,.0f}" if i < len(revenues) else "",
                    f"${ebitda[i]:,.0f}" if i < len(ebitda) else "",
                    f"${fcf[i]:,.0f}" if i < len(fcf) else "",
                ])

            sections.append(ReportSection(
                title="Financial Projections",
                section_type="table",
                content={
                    "headers": ["Period", "Revenue", "EBITDA", "Free Cash Flow"],
                    "rows": proj_rows,
                }
            ))

        self.config.title = "LBO Analysis Report"
        return self.generate_report(sections)

    def generate_three_statement_report(self, outputs: Dict[str, Any]) -> bytes:
        """Generate a 3-statement model report."""
        sections = []

        inc = outputs.get('income_statement', {})
        bs = outputs.get('balance_sheet', {})
        metrics = outputs.get('metrics', {})
        years = outputs.get('years', [])

        # Key Metrics
        sections.append(ReportSection(
            title="Key Financial Metrics",
            section_type="metrics",
            content={
                "Revenue (Final Year)": f"${inc.get('revenue', [0])[-1]:,.0f}" if inc.get('revenue') else "N/A",
                "Net Income (Final Year)": f"${inc.get('net_income', [0])[-1]:,.0f}" if inc.get('net_income') else "N/A",
                "EBITDA Margin": f"{sum(inc.get('ebitda_margin', [0]))/len(inc.get('ebitda_margin', [1])):.1%}" if inc.get('ebitda_margin') else "N/A",
                "Free Cash Flow (Final)": f"${metrics.get('free_cash_flow', [0])[-1]:,.0f}" if metrics.get('free_cash_flow') else "N/A",
                "Average ROE": f"{sum(metrics.get('roe', [0]))/len(metrics.get('roe', [1])):.1%}" if metrics.get('roe') else "N/A",
                "Average ROIC": f"{sum(metrics.get('roic', [0]))/len(metrics.get('roic', [1])):.1%}" if metrics.get('roic') else "N/A",
            }
        ))

        # Income Statement
        if inc.get('revenue') and years:
            is_rows = []
            for i, year in enumerate(years):
                is_rows.append([
                    f"Year {year}",
                    f"${inc['revenue'][i]:,.0f}",
                    f"${inc.get('gross_profit', [0])[i]:,.0f}",
                    f"${inc.get('ebitda', [0])[i]:,.0f}",
                    f"${inc.get('net_income', [0])[i]:,.0f}",
                ])

            sections.append(ReportSection(
                title="Income Statement Summary",
                section_type="table",
                content={
                    "headers": ["Period", "Revenue", "Gross Profit", "EBITDA", "Net Income"],
                    "rows": is_rows,
                }
            ))

        # Balance Sheet
        if bs.get('total_assets') and years:
            bs_rows = []
            for i, year in enumerate(years):
                bs_rows.append([
                    f"Year {year}",
                    f"${bs['total_assets'][i]:,.0f}",
                    f"${bs.get('total_liabilities', [0])[i]:,.0f}",
                    f"${bs.get('total_equity', [0])[i]:,.0f}",
                ])

            sections.append(ReportSection(
                title="Balance Sheet Summary",
                section_type="table",
                content={
                    "headers": ["Period", "Total Assets", "Total Liabilities", "Total Equity"],
                    "rows": bs_rows,
                }
            ))

        self.config.title = "Financial Statements Report"
        return self.generate_report(sections)

    def generate_13week_report(self, outputs: Dict[str, Any]) -> bytes:
        """Generate a 13-week cash flow report."""
        sections = []

        weeks = outputs.get('weeks', [])
        dates = outputs.get('week_ending_dates', [])
        receipts = outputs.get('receipts', {})
        liq = outputs.get('liquidity', {})
        metrics = outputs.get('metrics', {})

        # Summary Metrics
        sections.append(ReportSection(
            title="Liquidity Summary",
            section_type="metrics",
            content={
                "Beginning Cash": f"${liq.get('beginning_cash', [0])[0]:,.0f}" if liq.get('beginning_cash') else "N/A",
                "Ending Cash (Week 13)": f"${liq.get('ending_cash', [0])[-1]:,.0f}" if liq.get('ending_cash') else "N/A",
                "Minimum Cash": f"${metrics.get('minimum_cash_amount', 0):,.0f} (Week {metrics.get('minimum_cash_week', 0)})",
                "Peak Revolver": f"${metrics.get('peak_revolver_usage', 0):,.0f}",
                "Total Receipts": f"${sum(receipts.get('total', [])):,.0f}" if receipts.get('total') else "N/A",
                "Cash Runway": f"{metrics.get('weeks_of_runway', 0):.1f} weeks",
            }
        ))

        # Weekly Detail
        if weeks and liq.get('ending_cash'):
            cf_rows = []
            total_receipts = receipts.get('total', [0] * 13)

            for i, week in enumerate(weeks):
                cf_rows.append([
                    f"Week {week}",
                    dates[i] if i < len(dates) else "",
                    f"${total_receipts[i]:,.0f}" if i < len(total_receipts) else "",
                    f"${liq['ending_cash'][i]:,.0f}",
                    f"${liq.get('available_liquidity', [0])[i]:,.0f}" if liq.get('available_liquidity') else "",
                ])

            sections.append(ReportSection(
                title="Weekly Cash Position",
                section_type="table",
                content={
                    "headers": ["Week", "Week Ending", "Receipts", "Ending Cash", "Available Liquidity"],
                    "rows": cf_rows,
                }
            ))

        self.config.title = "13-Week Cash Flow Report"
        return self.generate_report(sections)
