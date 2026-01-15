"""Comments and annotations REST API."""

from typing import Optional, List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.dependencies import CurrentUser, DbSession
from services.collaboration_service import CollaborationService

router = APIRouter(prefix="/collaboration", tags=["Collaboration"])


# ===== Request/Response Models =====

class CommentCreate(BaseModel):
    """Create comment request."""

    model_id: str
    content: str
    sheet_id: Optional[str] = None
    cell_address: Optional[str] = None
    parent_id: Optional[str] = None


class CommentUpdate(BaseModel):
    """Update comment request."""

    content: Optional[str] = None
    is_resolved: Optional[bool] = None


class CommentResponse(BaseModel):
    """Comment response."""

    id: str
    model_id: str
    sheet_id: Optional[str]
    cell_address: Optional[str]
    user_id: str
    user_name: str
    content: str
    parent_id: Optional[str]
    is_resolved: bool
    resolved_at: Optional[str]
    created_at: str
    updated_at: str
    replies: List["CommentResponse"] = []

    class Config:
        from_attributes = True


class AnnotationCreate(BaseModel):
    """Create annotation request."""

    model_id: str
    sheet_id: str
    cell_address: str
    annotation_type: str  # flag, highlight, note, warning
    content: str
    extra_data: Optional[dict] = None


class AnnotationResponse(BaseModel):
    """Annotation response."""

    id: str
    model_id: str
    sheet_id: str
    cell_address: str
    user_id: str
    annotation_type: str
    content: str
    extra_data: dict
    created_at: str

    class Config:
        from_attributes = True


# ===== Comments Endpoints =====

@router.post("/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    request: CommentCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a new comment."""
    comment = await CollaborationService.create_comment(
        db=db,
        model_id=request.model_id,
        user_id=current_user.id,
        user_name=current_user.name,
        content=request.content,
        sheet_id=request.sheet_id,
        cell_address=request.cell_address,
        parent_id=request.parent_id,
    )
    await db.commit()

    return CommentResponse(
        id=comment.id,
        model_id=comment.model_id,
        sheet_id=comment.sheet_id,
        cell_address=comment.cell_address,
        user_id=comment.user_id,
        user_name=comment.user_name,
        content=comment.content,
        parent_id=comment.parent_id,
        is_resolved=comment.is_resolved,
        resolved_at=comment.resolved_at.isoformat() if comment.resolved_at else None,
        created_at=comment.created_at.isoformat() if comment.created_at else "",
        updated_at=comment.updated_at.isoformat() if comment.updated_at else "",
        replies=[],
    )


@router.get("/comments", response_model=List[CommentResponse])
async def get_comments(
    model_id: str,
    db: DbSession,
    current_user: CurrentUser,
    sheet_id: Optional[str] = None,
    cell_address: Optional[str] = None,
    include_resolved: bool = False,
):
    """Get comments for a model."""
    comments = await CollaborationService.get_comments(
        db=db,
        model_id=model_id,
        sheet_id=sheet_id,
        cell_address=cell_address,
        include_resolved=include_resolved,
    )

    def comment_to_response(comment) -> CommentResponse:
        return CommentResponse(
            id=comment.id,
            model_id=comment.model_id,
            sheet_id=comment.sheet_id,
            cell_address=comment.cell_address,
            user_id=comment.user_id,
            user_name=comment.user_name,
            content=comment.content,
            parent_id=comment.parent_id,
            is_resolved=comment.is_resolved,
            resolved_at=comment.resolved_at.isoformat() if comment.resolved_at else None,
            created_at=comment.created_at.isoformat() if comment.created_at else "",
            updated_at=comment.updated_at.isoformat() if comment.updated_at else "",
            replies=[comment_to_response(r) for r in (comment.replies or [])],
        )

    return [comment_to_response(c) for c in comments]


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    request: CommentUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update a comment."""
    comment = await CollaborationService.get_comment(db, comment_id)

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )

    # Only author or admin can update
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this comment",
        )

    comment = await CollaborationService.update_comment(
        db=db,
        comment=comment,
        content=request.content,
        is_resolved=request.is_resolved,
    )
    await db.commit()

    return CommentResponse(
        id=comment.id,
        model_id=comment.model_id,
        sheet_id=comment.sheet_id,
        cell_address=comment.cell_address,
        user_id=comment.user_id,
        user_name=comment.user_name,
        content=comment.content,
        parent_id=comment.parent_id,
        is_resolved=comment.is_resolved,
        resolved_at=comment.resolved_at.isoformat() if comment.resolved_at else None,
        created_at=comment.created_at.isoformat() if comment.created_at else "",
        updated_at=comment.updated_at.isoformat() if comment.updated_at else "",
        replies=[],
    )


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete a comment."""
    comment = await CollaborationService.get_comment(db, comment_id)

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )

    # Only author or admin can delete
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment",
        )

    await CollaborationService.delete_comment(db, comment)
    await db.commit()

    return {"message": "Comment deleted successfully"}


# ===== Annotations Endpoints =====

@router.post("/annotations", response_model=AnnotationResponse, status_code=status.HTTP_201_CREATED)
async def create_annotation(
    request: AnnotationCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Create a new annotation."""
    annotation = await CollaborationService.create_annotation(
        db=db,
        model_id=request.model_id,
        sheet_id=request.sheet_id,
        cell_address=request.cell_address,
        user_id=current_user.id,
        annotation_type=request.annotation_type,
        content=request.content,
        extra_data=request.extra_data,
    )
    await db.commit()

    return AnnotationResponse(
        id=annotation.id,
        model_id=annotation.model_id,
        sheet_id=annotation.sheet_id,
        cell_address=annotation.cell_address,
        user_id=annotation.user_id,
        annotation_type=annotation.annotation_type,
        content=annotation.content,
        extra_data=annotation.extra_data,
        created_at=annotation.created_at.isoformat() if annotation.created_at else "",
    )


@router.get("/annotations", response_model=List[AnnotationResponse])
async def get_annotations(
    model_id: str,
    db: DbSession,
    current_user: CurrentUser,
    sheet_id: Optional[str] = None,
    annotation_type: Optional[str] = None,
):
    """Get annotations for a model."""
    annotations = await CollaborationService.get_annotations(
        db=db,
        model_id=model_id,
        sheet_id=sheet_id,
        annotation_type=annotation_type,
    )

    return [
        AnnotationResponse(
            id=a.id,
            model_id=a.model_id,
            sheet_id=a.sheet_id,
            cell_address=a.cell_address,
            user_id=a.user_id,
            annotation_type=a.annotation_type,
            content=a.content,
            extra_data=a.extra_data,
            created_at=a.created_at.isoformat() if a.created_at else "",
        )
        for a in annotations
    ]


@router.delete("/annotations/{annotation_id}")
async def delete_annotation(
    annotation_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete an annotation."""
    from sqlalchemy import select
    from db.models.collaboration import Annotation

    result = await db.execute(
        select(Annotation).where(Annotation.id == annotation_id)
    )
    annotation = result.scalar_one_or_none()

    if not annotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found",
        )

    # Only author or admin can delete
    if annotation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this annotation",
        )

    await CollaborationService.delete_annotation(db, annotation)
    await db.commit()

    return {"message": "Annotation deleted successfully"}


# ===== Presence Endpoint =====

@router.get("/presence/{model_id}")
async def get_presence(
    model_id: str,
    current_user: CurrentUser,
):
    """Get active users for a model."""
    from services.websocket_manager import manager

    users = manager.get_active_users(model_id)
    cell_locks = manager.get_cell_locks(model_id)

    return {
        "users": users,
        "cell_locks": cell_locks,
        "user_count": len(users),
    }
