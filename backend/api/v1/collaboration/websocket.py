"""WebSocket endpoint for real-time collaboration."""

import json
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db.models.base import get_db
from services.websocket_manager import manager, MessageType, WebSocketMessage
from services.auth_service import AuthService

router = APIRouter()


async def get_user_from_token(token: str) -> Optional[dict]:
    """Validate token and return user info."""
    payload = AuthService.decode_token(token)
    if payload is None or payload.get("type") != "access":
        return None
    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email"),
        "role": payload.get("role"),
    }


@router.websocket("/ws/models/{model_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    model_id: str,
    token: str = Query(...),
):
    """WebSocket endpoint for real-time model collaboration."""

    # Authenticate user
    user_info = await get_user_from_token(token)
    if not user_info:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    user_id = user_info["user_id"]
    user_email = user_info["email"]
    user_role = user_info["role"]

    # For now, use email prefix as name (in production, fetch from DB)
    user_name = user_email.split("@")[0] if user_email else "Anonymous"

    # Connect
    await manager.connect(
        websocket=websocket,
        model_id=model_id,
        user_id=user_id,
        user_name=user_name,
        user_email=user_email,
        role=user_role,
    )

    try:
        while True:
            # Receive message
            data = await websocket.receive_text()

            try:
                message = json.loads(data)
                msg_type = message.get("type")
                payload = message.get("payload", {})

                # Handle different message types
                if msg_type == MessageType.PING.value:
                    # Respond with pong
                    await manager.send_personal(
                        websocket,
                        WebSocketMessage(
                            type=MessageType.PONG,
                            payload={},
                            user_id=user_id,
                            model_id=model_id,
                        ),
                    )

                elif msg_type == MessageType.CURSOR.value:
                    # Update presence with cursor position
                    presence = manager.update_presence(
                        model_id=model_id,
                        user_id=user_id,
                        current_cell=payload.get("cell"),
                        cursor_position=payload.get("position"),
                    )

                    # Broadcast cursor update to others
                    if presence:
                        await manager.broadcast_to_model(
                            model_id=model_id,
                            message=WebSocketMessage(
                                type=MessageType.CURSOR,
                                payload={
                                    "user_id": user_id,
                                    "user_name": user_name,
                                    "cell": payload.get("cell"),
                                    "position": payload.get("position"),
                                },
                                user_id=user_id,
                                model_id=model_id,
                            ),
                            exclude_user=user_id,
                        )

                elif msg_type == MessageType.CELL_LOCK.value:
                    # Try to acquire cell lock
                    cell = payload.get("cell")
                    if cell:
                        success = manager.try_lock_cell(model_id, cell, user_id)

                        if success:
                            # Broadcast lock to all users
                            await manager.broadcast_to_model(
                                model_id=model_id,
                                message=WebSocketMessage(
                                    type=MessageType.CELL_LOCK,
                                    payload={
                                        "cell": cell,
                                        "user_id": user_id,
                                        "user_name": user_name,
                                    },
                                    user_id=user_id,
                                    model_id=model_id,
                                ),
                            )
                        else:
                            # Send error to user
                            await manager.send_personal(
                                websocket,
                                WebSocketMessage(
                                    type=MessageType.ERROR,
                                    payload={
                                        "message": f"Cell {cell} is locked by another user",
                                        "code": "CELL_LOCKED",
                                    },
                                    user_id=user_id,
                                    model_id=model_id,
                                ),
                            )

                elif msg_type == MessageType.CELL_UNLOCK.value:
                    # Release cell lock
                    cell = payload.get("cell")
                    if cell:
                        success = manager.unlock_cell(model_id, cell, user_id)
                        if success:
                            # Broadcast unlock to all users
                            await manager.broadcast_to_model(
                                model_id=model_id,
                                message=WebSocketMessage(
                                    type=MessageType.CELL_UNLOCK,
                                    payload={"cell": cell},
                                    user_id=user_id,
                                    model_id=model_id,
                                ),
                            )

                elif msg_type == MessageType.CELL_UPDATE.value:
                    # Broadcast cell update to others
                    await manager.broadcast_to_model(
                        model_id=model_id,
                        message=WebSocketMessage(
                            type=MessageType.CELL_UPDATE,
                            payload={
                                "cells": payload.get("cells", []),
                                "user_id": user_id,
                                "user_name": user_name,
                            },
                            user_id=user_id,
                            model_id=model_id,
                        ),
                        exclude_user=user_id,
                    )

                elif msg_type == MessageType.COMMENT_ADD.value:
                    # Broadcast new comment
                    await manager.broadcast_to_model(
                        model_id=model_id,
                        message=WebSocketMessage(
                            type=MessageType.COMMENT_ADD,
                            payload=payload,
                            user_id=user_id,
                            model_id=model_id,
                        ),
                    )

                elif msg_type == MessageType.COMMENT_UPDATE.value:
                    # Broadcast comment update
                    await manager.broadcast_to_model(
                        model_id=model_id,
                        message=WebSocketMessage(
                            type=MessageType.COMMENT_UPDATE,
                            payload=payload,
                            user_id=user_id,
                            model_id=model_id,
                        ),
                    )

                elif msg_type == MessageType.COMMENT_DELETE.value:
                    # Broadcast comment deletion
                    await manager.broadcast_to_model(
                        model_id=model_id,
                        message=WebSocketMessage(
                            type=MessageType.COMMENT_DELETE,
                            payload=payload,
                            user_id=user_id,
                            model_id=model_id,
                        ),
                    )

            except json.JSONDecodeError:
                await manager.send_personal(
                    websocket,
                    WebSocketMessage(
                        type=MessageType.ERROR,
                        payload={"message": "Invalid JSON"},
                        user_id=user_id,
                        model_id=model_id,
                    ),
                )

    except WebSocketDisconnect:
        await manager.disconnect(model_id, user_id)
