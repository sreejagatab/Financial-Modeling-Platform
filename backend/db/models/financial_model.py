"""Financial model database models."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, generate_uuid


class ModelType(str, Enum):
    """Types of financial models."""

    THREE_STATEMENT = "three_statement"
    OPERATING_MODEL = "operating_model"
    CASH_FLOW_13_WEEK = "cash_flow_13_week"
    LBO = "lbo"
    MERGER = "merger"
    DCF = "dcf"
    TRADING_COMPS = "trading_comps"
    PRECEDENT_TXNS = "precedent_txns"
    SALE_LEASEBACK = "sale_leaseback"
    REIT_CONVERSION = "reit_conversion"
    NAV = "nav"
    CUSTOM = "custom"


class SheetPurpose(str, Enum):
    """Purpose classification for sheets."""

    INPUT = "input"
    CALCULATION = "calculation"
    OUTPUT = "output"
    DASHBOARD = "dashboard"


class CellType(str, Enum):
    """Types of cells in a model."""

    INPUT = "input"  # Hard-coded input (blue font convention)
    FORMULA = "formula"  # Contains a formula
    OUTPUT = "output"  # Key output metric
    LABEL = "label"  # Text label/header


class DataType(str, Enum):
    """Data types for cell values."""

    NUMBER = "number"
    TEXT = "text"
    DATE = "date"
    BOOLEAN = "boolean"
    PERCENTAGE = "percentage"
    CURRENCY = "currency"


class FinancialModel(Base, TimestampMixin):
    """Main financial model entity."""

    __tablename__ = "financial_models"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model_type: Mapped[ModelType] = mapped_column(String(50), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1)

    # Ownership
    owner_id: Mapped[str] = mapped_column(String(36), nullable=False)

    # Branching/scenarios
    branch_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    parent_model_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("financial_models.id"), nullable=True
    )

    # Settings and metadata
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)

    # Status
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    is_template: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    sheets: Mapped[list["Sheet"]] = relationship(
        "Sheet", back_populates="model", cascade="all, delete-orphan"
    )
    scenarios: Mapped[list["Scenario"]] = relationship(
        "Scenario", back_populates="model", cascade="all, delete-orphan"
    )
    versions: Mapped[list["ModelVersion"]] = relationship(
        "ModelVersion", back_populates="model", cascade="all, delete-orphan"
    )


class Sheet(Base, TimestampMixin):
    """Worksheet within a financial model."""

    __tablename__ = "sheets"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("financial_models.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[SheetPurpose] = mapped_column(String(50), nullable=False)
    index: Mapped[int] = mapped_column(Integer, default=0)

    # Visibility and protection
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    is_protected: Mapped[bool] = mapped_column(Boolean, default=False)

    # Sheet metadata
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)

    # Relationships
    model: Mapped["FinancialModel"] = relationship(
        "FinancialModel", back_populates="sheets"
    )
    cells: Mapped[list["Cell"]] = relationship(
        "Cell", back_populates="sheet", cascade="all, delete-orphan"
    )


class Cell(Base):
    """Cell definition within a sheet."""

    __tablename__ = "cells"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    sheet_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sheets.id"), nullable=False
    )

    # Address (A1 notation)
    address: Mapped[str] = mapped_column(String(20), nullable=False)
    row: Mapped[int] = mapped_column(Integer, nullable=False)
    column: Mapped[int] = mapped_column(Integer, nullable=False)

    # Cell classification
    cell_type: Mapped[CellType] = mapped_column(String(20), default=CellType.INPUT)
    data_type: Mapped[DataType] = mapped_column(String(20), default=DataType.NUMBER)

    # Named range reference
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Semantic tags (e.g., "assumption", "driver", "output")
    tags: Mapped[list] = mapped_column(JSON, default=list)

    # Relationships
    sheet: Mapped["Sheet"] = relationship("Sheet", back_populates="cells")
    values: Mapped[list["CellValue"]] = relationship(
        "CellValue", back_populates="cell", cascade="all, delete-orphan"
    )


class CellValue(Base):
    """Versioned cell value with formula support."""

    __tablename__ = "cell_values"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    cell_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("cells.id"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, default=1)

    # Values
    raw_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    formula: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    formula_ast: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    calculated_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Dependencies (list of cell addresses this cell depends on)
    dependencies: Mapped[list] = mapped_column(JSON, default=list)

    # Formatting
    format: Mapped[dict] = mapped_column(JSON, default=dict)

    # Audit
    changed_by: Mapped[str] = mapped_column(String(36), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    cell: Mapped["Cell"] = relationship("Cell", back_populates="values")


class Scenario(Base, TimestampMixin):
    """Scenario/branch for a financial model."""

    __tablename__ = "scenarios"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("financial_models.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Scenario type (base, bull, bear, management, custom)
    scenario_type: Mapped[str] = mapped_column(String(50), default="custom")

    # Base commit this scenario branches from
    base_version_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Assumption overrides (cell_id -> value)
    assumptions_override: Mapped[dict] = mapped_column(JSON, default=dict)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    model: Mapped["FinancialModel"] = relationship(
        "FinancialModel", back_populates="scenarios"
    )


class ModelVersion(Base):
    """Version/commit for a financial model (git-like)."""

    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("financial_models.id"), nullable=False
    )

    # Version info
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    parent_version_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Commit info
    message: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[str] = mapped_column(String(36), nullable=False)
    committed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Snapshot reference (S3 path)
    snapshot_ref: Mapped[str] = mapped_column(String(500), nullable=False)

    # Change summary
    changes_summary: Mapped[dict] = mapped_column(JSON, default=dict)

    # Relationships
    model: Mapped["FinancialModel"] = relationship(
        "FinancialModel", back_populates="versions"
    )


class NamedRange(Base, TimestampMixin):
    """Named range definition across a model."""

    __tablename__ = "named_ranges"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("financial_models.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Scope (workbook-level or sheet-level)
    scope: Mapped[str] = mapped_column(String(20), default="workbook")
    scope_sheet_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Reference (e.g., "Sheet1!$A$1:$B$10")
    refers_to: Mapped[str] = mapped_column(String(500), nullable=False)

    # Semantic type (assumption, driver, output, etc.)
    semantic_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
