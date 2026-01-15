"""Database models for collaboration features."""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, generate_uuid


class Comment(Base, TimestampMixin):
    """Comment on a model, sheet, or cell."""

    __tablename__ = "comments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    sheet_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    cell_address: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    # Author
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Content
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Threading
    parent_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("comments.id"), nullable=True
    )
    replies: Mapped[List["Comment"]] = relationship(
        "Comment",
        backref="parent",
        remote_side=[id],
        cascade="all, delete-orphan",
        single_parent=True,
    )

    # Resolution
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolved_by: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Mentions (list of user_ids)
    mentions: Mapped[list] = mapped_column(JSON, default=list)


class Annotation(Base, TimestampMixin):
    """Annotation on a cell (flags, highlights, notes)."""

    __tablename__ = "annotations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    sheet_id: Mapped[str] = mapped_column(String(36), nullable=False)
    cell_address: Mapped[str] = mapped_column(String(20), nullable=False)

    # Author
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)

    # Annotation type (flag, highlight, note, warning, etc.)
    annotation_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # Content/description
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Additional metadata (color, icon, etc.)
    extra_data: Mapped[dict] = mapped_column("metadata", JSON, default=dict)


class CellEdit(Base):
    """Record of a cell edit for history and conflict resolution."""

    __tablename__ = "cell_edits"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    sheet_id: Mapped[str] = mapped_column(String(36), nullable=False)
    cell_address: Mapped[str] = mapped_column(String(20), nullable=False)

    # User who made the edit
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)

    # Before/after values
    old_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_value: Mapped[str] = mapped_column(Text, nullable=False)
    old_formula: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_formula: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # For conflict resolution
    sequence_number: Mapped[int] = mapped_column(Integer, default=0)
    is_conflict: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class ActiveSession(Base):
    """Track active user sessions for a model."""

    __tablename__ = "active_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    model_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Session info
    session_id: Mapped[str] = mapped_column(String(100), nullable=False)
    connected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_activity: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Current focus
    current_sheet_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    current_cell: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    cursor_position: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
