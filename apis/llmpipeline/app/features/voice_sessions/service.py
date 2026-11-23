"""Creates the LiveKit room, dispatches the worker, and mints the caller token."""

from __future__ import annotations

import json
import time
from datetime import timedelta
from uuid import uuid4

from livekit.api import (
    AccessToken,
    CreateAgentDispatchRequest,
    CreateRoomRequest,
    DeleteRoomRequest,
    LiveKitAPI,
    VideoGrants,
)
from sqlalchemy import func, select

from app.core.config import livekit_http_url, livekit_ws_url, settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.core.space_utils import normalize_space_id
from app.features.auth.authenticated_user import User
from app.features.langgraph.checkpoint.models import Conversation

from .schemas import (
    DISPATCH_METADATA_VERSION,
    VoiceSessionError,
    VoiceSessionRequest,
    VoiceSessionResponse,
)
from .worker_token import issue_worker_token

CLIENT_TOKEN_TTL_SECONDS = 3600
ROOM_EMPTY_TIMEOUT_SECONDS = 120
ROOM_DEPARTURE_TIMEOUT_SECONDS = 20


def livekit_config() -> tuple[str, str, str, str]:
    """Returns the server API URL, client WebSocket URL, and API credentials."""

    http_url = livekit_http_url()
    ws_url = livekit_ws_url()
    api_key = settings.LIVEKIT_API_KEY.strip()
    api_secret = settings.LIVEKIT_API_SECRET.strip()
    if not http_url or not ws_url or not api_key or not api_secret:
        raise VoiceSessionError("Voice sessions are not configured.")
    return http_url, ws_url, api_key, api_secret


def build_dispatch_metadata(
    request: VoiceSessionRequest,
    user: User,
    room_name: str,
    worker_token: str,
) -> str:
    """Serializes the validated binding the worker must accept before any provider call."""

    return json.dumps(
        {
            "version": DISPATCH_METADATA_VERSION,
            "room_name": room_name,
            "flow_version_id": str(request.flow_version_id),
            "flow_id": str(request.flow_id),
            "tenant_id": str(user.tenant_id),
            "user_id": str(user.user_id),
            "conversation_id": str(request.conversation_id),
            "mode": request.mode,
            "space_id": user.space_id or "",
            "env_type": user.env_type,
            "worker_token": worker_token,
        },
        separators=(",", ":"),
    )


async def verify_voice_conversation(request: VoiceSessionRequest, user: User) -> None:
    """Reject a conversation the caller does not own, or one that is not an active voice thread."""

    # IMPORTANT NOTE: a conversation is space-scoped like the WorkspaceAPIs cap count,
    # so a room dispatched for space B cannot run a conversation filed under space A.
    space_id = normalize_space_id(user.space_id)
    space_scope = (
        Conversation.space_id.is_(None)
        if space_id is None
        else Conversation.space_id == space_id
    )
    async with get_db_session_context(settings.POSTGRESQL_WORKSPACE_DB_NAME) as db:
        found = await db.scalar(
            select(Conversation.id).where(
                Conversation.id == request.conversation_id,
                Conversation.tenant_id == user.tenant_id,
                Conversation.user_id == user.user_id,
                Conversation.flow_version_id == request.flow_version_id,
                func.lower(Conversation.status) == "active",
                func.lower(Conversation.channel) == "voice",
                space_scope,
            )
        )

    # IMPORTANT NOTE: missing and foreign conversations share one 404 so the
    # endpoint cannot be used to probe conversation ids.
    if found is None:
        raise VoiceSessionError("Voice session conversation was not found.", 404)


async def create_session(request: VoiceSessionRequest, user: User) -> VoiceSessionResponse:
    """Creates one room, dispatches the bound worker, and returns the caller's join token."""

    started_at = time.perf_counter()
    http_url, ws_url, api_key, api_secret = livekit_config()
    await verify_voice_conversation(request, user)
    room_name = f"voice-{request.conversation_id}-{uuid4().hex[:8]}"
    metadata = build_dispatch_metadata(
        request,
        user,
        room_name,
        issue_worker_token(
            user,
            room_name=room_name,
            flow_version_id=request.flow_version_id,
            flow_id=request.flow_id,
            conversation_id=request.conversation_id,
            mode=request.mode,
        ),
    )

    async with LiveKitAPI(url=http_url, api_key=api_key, api_secret=api_secret) as livekit:
        room_started_at = time.perf_counter()
        await livekit.room.create_room(
            CreateRoomRequest(
                name=room_name,
                empty_timeout=ROOM_EMPTY_TIMEOUT_SECONDS,
                departure_timeout=ROOM_DEPARTURE_TIMEOUT_SECONDS,
            )
        )
        room_ms = round((time.perf_counter() - room_started_at) * 1000)
        dispatch_started_at = time.perf_counter()
        try:
            await livekit.agent_dispatch.create_dispatch(
                CreateAgentDispatchRequest(
                    agent_name=settings.LIVEKIT_AGENT_NAME,
                    room=room_name,
                    metadata=metadata,
                )
            )
        except Exception:
            try:
                await livekit.room.delete_room(DeleteRoomRequest(room=room_name))
            except Exception:
                logger.warning(
                    "[voice-session] room cleanup failed room=%s",
                    room_name,
                    exc_info=True,
                )
            raise
        dispatch_ms = round((time.perf_counter() - dispatch_started_at) * 1000)

    token_started_at = time.perf_counter()
    client_token = (
        AccessToken(api_key, api_secret)
        .with_identity(f"user-{user.user_id}")
        .with_name(user.username)
        .with_ttl(timedelta(seconds=CLIENT_TOKEN_TTL_SECONDS))
        .with_grants(
            VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .to_jwt()
    )
    logger.info(
        "[voice-timing] session ready room=%s room_ms=%d dispatch_ms=%d token_ms=%d total_ms=%d",
        room_name,
        room_ms,
        dispatch_ms,
        round((time.perf_counter() - token_started_at) * 1000),
        round((time.perf_counter() - started_at) * 1000),
    )

    return VoiceSessionResponse(
        room_name=room_name,
        server_url=ws_url,
        client_token=client_token,
        expires_in=CLIENT_TOKEN_TTL_SECONDS,
        conversation_id=str(request.conversation_id),
        agent_name=settings.LIVEKIT_AGENT_NAME,
        mode=request.mode,
    )
