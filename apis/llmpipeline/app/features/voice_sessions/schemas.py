"""Request, response, and dispatch-metadata contracts for LiveKit voice sessions."""

from __future__ import annotations

from typing import Literal
from uuid import UUID

from pydantic import BaseModel

DISPATCH_METADATA_VERSION = 1
VOICE_SESSION_MODES = ("test", "live")

VoiceSessionMode = Literal["test", "live"]


class VoiceSessionError(Exception):
    """The session request cannot be served; ``status_code`` is the HTTP status."""

    def __init__(self, message: str, status_code: int = 503):
        super().__init__(message)
        self.status_code = status_code


class VoiceSessionRequest(BaseModel):
    """Authorized request for one caller-bound LiveKit session."""

    flow_version_id: UUID
    flow_id: UUID
    conversation_id: UUID
    mode: VoiceSessionMode


class VoiceSessionResponse(BaseModel):
    """The room, caller token, and binding identifiers for one session."""

    room_name: str
    server_url: str
    client_token: str
    expires_in: int
    conversation_id: str
    agent_name: str
    mode: str
