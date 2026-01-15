"""Collaboration service for comments, annotations, and real-time sync."""

from datetime import datetime, timezone
from typing import Optional, List
from uuid import uuid4

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.collaboration import Comment, Annotation, CellEdit


class CollaborationService:
    """Service for collaboration features."""

    # ===== Comments =====

    @staticmethod
    async def create_comment(
        db: AsyncSession,
        model_id: str,
        user_id: str,
        user_name: str,
        content: str,
        cell_address: Optional[str] = None,
        sheet_id: Optional[str] = None,
        parent_id: Optional[str] = None,
    ) -> Comment:
        """Create a new comment."""
        comment = Comment(
            id=str(uuid4()),
            model_id=model_id,
            sheet_id=sheet_id,
            cell_address=cell_address,
            user_id=user_id,
            user_name=user_name,
            content=content,
            parent_id=parent_id,
        )
        db.add(comment)
        await db.flush()
        await db.refresh(comment)
        return comment

    @staticmethod
    async def get_comments(
        db: AsyncSession,
        model_id: str,
        sheet_id: Optional[str] = None,
        cell_address: Optional[str] = None,
        include_resolved: bool = False,
    ) -> List[Comment]:
        """Get comments for a model, optionally filtered by sheet or cell."""
        conditions = [Comment.model_id == model_id]

        if sheet_id:
            conditions.append(Comment.sheet_id == sheet_id)
        if cell_address:
            conditions.append(Comment.cell_address == cell_address)
        if not include_resolved:
            conditions.append(Comment.is_resolved == False)

        # Only get top-level comments (replies are loaded via relationship)
        conditions.append(Comment.parent_id == None)

        result = await db.execute(
            select(Comment)
            .where(and_(*conditions))
            .order_by(Comment.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_comment(db: AsyncSession, comment_id: str) -> Optional[Comment]:
        """Get a comment by ID."""
        result = await db.execute(
            select(Comment).where(Comment.id == comment_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_comment(
        db: AsyncSession,
        comment: Comment,
        content: Optional[str] = None,
        is_resolved: Optional[bool] = None,
    ) -> Comment:
        """Update a comment."""
        if content is not None:
            comment.content = content
            comment.updated_at = datetime.now(timezone.utc)
        if is_resolved is not None:
            comment.is_resolved = is_resolved
            if is_resolved:
                comment.resolved_at = datetime.now(timezone.utc)

        await db.flush()
        await db.refresh(comment)
        return comment

    @staticmethod
    async def delete_comment(db: AsyncSession, comment: Comment) -> bool:
        """Delete a comment."""
        await db.delete(comment)
        await db.flush()
        return True

    # ===== Annotations =====

    @staticmethod
    async def create_annotation(
        db: AsyncSession,
        model_id: str,
        sheet_id: str,
        cell_address: str,
        user_id: str,
        annotation_type: str,
        content: str,
        extra_data: Optional[dict] = None,
    ) -> Annotation:
        """Create a new annotation."""
        annotation = Annotation(
            id=str(uuid4()),
            model_id=model_id,
            sheet_id=sheet_id,
            cell_address=cell_address,
            user_id=user_id,
            annotation_type=annotation_type,
            content=content,
            extra_data=extra_data or {},
        )
        db.add(annotation)
        await db.flush()
        await db.refresh(annotation)
        return annotation

    @staticmethod
    async def get_annotations(
        db: AsyncSession,
        model_id: str,
        sheet_id: Optional[str] = None,
        annotation_type: Optional[str] = None,
    ) -> List[Annotation]:
        """Get annotations for a model."""
        conditions = [Annotation.model_id == model_id]

        if sheet_id:
            conditions.append(Annotation.sheet_id == sheet_id)
        if annotation_type:
            conditions.append(Annotation.annotation_type == annotation_type)

        result = await db.execute(
            select(Annotation)
            .where(and_(*conditions))
            .order_by(Annotation.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def delete_annotation(db: AsyncSession, annotation: Annotation) -> bool:
        """Delete an annotation."""
        await db.delete(annotation)
        await db.flush()
        return True

    # ===== Cell Edit History =====

    @staticmethod
    async def record_cell_edit(
        db: AsyncSession,
        model_id: str,
        sheet_id: str,
        cell_address: str,
        user_id: str,
        old_value: Optional[str],
        new_value: str,
        old_formula: Optional[str] = None,
        new_formula: Optional[str] = None,
    ) -> CellEdit:
        """Record a cell edit for history/undo."""
        edit = CellEdit(
            id=str(uuid4()),
            model_id=model_id,
            sheet_id=sheet_id,
            cell_address=cell_address,
            user_id=user_id,
            old_value=old_value,
            new_value=new_value,
            old_formula=old_formula,
            new_formula=new_formula,
        )
        db.add(edit)
        await db.flush()
        await db.refresh(edit)
        return edit

    @staticmethod
    async def get_cell_history(
        db: AsyncSession,
        model_id: str,
        sheet_id: str,
        cell_address: str,
        limit: int = 50,
    ) -> List[CellEdit]:
        """Get edit history for a cell."""
        result = await db.execute(
            select(CellEdit)
            .where(and_(
                CellEdit.model_id == model_id,
                CellEdit.sheet_id == sheet_id,
                CellEdit.cell_address == cell_address,
            ))
            .order_by(CellEdit.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_recent_edits(
        db: AsyncSession,
        model_id: str,
        limit: int = 100,
    ) -> List[CellEdit]:
        """Get recent edits for a model."""
        result = await db.execute(
            select(CellEdit)
            .where(CellEdit.model_id == model_id)
            .order_by(CellEdit.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
