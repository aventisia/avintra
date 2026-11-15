"""Creates the LiveKit room, dispatches the worker, and mints the caller token."""

from __future__ import annotations

import json
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

from app.core.config import livekit_http_url, livekit_ws_url, settings
from app.core.logger import logger
from app.features.auth.authenticated_user import User

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


async def create_session(request: VoiceSessionRequest, user: User) -> VoiceSessionResponse:
    """Creates one room, dispatches the bound worker, and returns the caller's join token."""

    http_url, ws_url, api_key, api_secret = livekit_config()
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
        await livekit.room.create_room(
            CreateRoomRequest(
                name=room_name,
                empty_timeout=ROOM_EMPTY_TIMEOUT_SECONDS,
                departure_timeout=ROOM_DEPARTURE_TIMEOUT_SECONDS,
            )
        )
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

    return VoiceSessionResponse(
        room_name=room_name,
        server_url=ws_url,
        client_token=client_token,
        expires_in=CLIENT_TOKEN_TTL_SECONDS,
        conversation_id=str(request.conversation_id),
        agent_name=settings.LIVEKIT_AGENT_NAME,
        mode=request.mode,
    )
