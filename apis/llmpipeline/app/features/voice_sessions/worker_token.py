"""Short-lived worker credential minted for one dispatched voice session.

The token keeps the caller's platform identity so the worker can fetch the S2
settings from WorkspaceAPIs, and repeats the session binding from the dispatch
metadata so a credential replayed onto another job is rejected. It carries no
browser token or provider key.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt

from app.core.config import settings
from app.features.auth.authenticated_user import User

from .schemas import VoiceSessionError

WORKER_TOKEN_SCOPE = "voice-worker"
WORKER_TOKEN_TTL_SECONDS = 300


def issue_worker_token(
    user: User,
    *,
    room_name: str,
    flow_version_id: UUID | str,
    flow_id: UUID | str,
    conversation_id: UUID | str,
    mode: str,
    ttl_seconds: int = WORKER_TOKEN_TTL_SECONDS,
) -> str:
    """Mints the worker's short-lived settings credential for one caller and session."""

    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "uid": str(user.user_id),
            "tntid": str(user.tenant_id),
            "uname": user.username,
            "email": user.email,
            "scope": WORKER_TOKEN_SCOPE,
            "flow_version_id": str(flow_version_id),
            "flow_id": str(flow_id),
            "conversation_id": str(conversation_id),
            "room_name": room_name,
            "mode": mode,
            "space_id": user.space_id or "",
            "env_type": user.env_type,
            "iss": _audience(),
            "aud": _audience(),
            "iat": now,
            "exp": now + timedelta(seconds=ttl_seconds),
        },
        settings.JWT_SECRET_KEY,
        algorithm="HS512",
    )


def verify_worker_token(token: str) -> dict:
    """Decodes a worker credential, raising ``jwt.InvalidTokenError`` unless it is ours."""

    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=["HS512"],
        audience=_audience(),
        issuer=_audience(),
    )
    if payload.get("scope") != WORKER_TOKEN_SCOPE:
        raise jwt.InvalidTokenError("Worker credential scope is invalid.")
    return payload


def _audience() -> str:
    if not settings.APP_BASE_URL.strip() or not settings.JWT_SECRET_KEY.strip():
        raise VoiceSessionError("Voice sessions are not configured.")
    return f"https://{settings.APP_BASE_URL.strip()}"
