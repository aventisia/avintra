"""Realtime voice WebSocket route."""
from __future__ import annotations

from fastapi import APIRouter, WebSocket

from .gateway_service import realtime_gateway_service

router = APIRouter()


@router.websocket("/v2/llm/realtime/session")
async def realtime_session(websocket: WebSocket):
    """Serves a cookie-authenticated realtime voice session over a WebSocket."""
    await realtime_gateway_service.handle(websocket)
