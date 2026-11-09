"""Validation of the job-scoped dispatch metadata that binds one worker to one call.

Every field is duplicated between the metadata and the worker credential, so a
token replayed onto another job, tenant, user, or room is rejected before any
provider call.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, replace
from uuid import UUID

import jwt

from app.features.voice_sessions.schemas import DISPATCH_METADATA_VERSION, VOICE_SESSION_MODES
from app.features.voice_sessions.worker_token import verify_worker_token


class VoiceSessionRejected(Exception):
    """The dispatched job cannot be served; the worker exits without provider calls."""


@dataclass(frozen=True)
class VoiceJobClaims:
    """The validated binding carried by one LiveKit job."""

    room_name: str
    flow_version_id: UUID
    flow_id: UUID
    tenant_id: UUID
    user_id: UUID
    conversation_id: str
    mode: str
    space_id: str
    env_type: str
    worker_token: str
    username: str = ""
    email: str = ""


def parse_job_metadata(raw: str) -> VoiceJobClaims:
    """Parse and verify dispatch metadata, raising ``VoiceSessionRejected`` on any mismatch."""

    payload = _decode(raw)
    if payload.get("version") != DISPATCH_METADATA_VERSION:
        raise VoiceSessionRejected("Unsupported voice session metadata version.")

    claims = VoiceJobClaims(
        room_name=_text(payload, "room_name"),
        flow_version_id=_uuid(payload, "flow_version_id"),
        flow_id=_uuid(payload, "flow_id"),
        tenant_id=_uuid(payload, "tenant_id"),
        user_id=_uuid(payload, "user_id"),
        conversation_id=_text(payload, "conversation_id"),
        mode=_text(payload, "mode"),
        space_id=_optional_text(payload, "space_id"),
        env_type=_text(payload, "env_type"),
        worker_token=_text(payload, "worker_token"),
    )

    if claims.mode not in VOICE_SESSION_MODES:
        raise VoiceSessionRejected("Unsupported voice session mode.")

    credential = _verify_worker_token(claims)
    return replace(
        claims,
        username=str(credential.get("uname") or ""),
        email=str(credential.get("email") or ""),
    )


def validate_job(
    claims: VoiceJobClaims,
    *,
    agent_name: str,
    expected_agent_name: str,
    room_name: str,
) -> None:
    """Reject a job dispatched to the wrong agent or delivered to the wrong room."""

    if agent_name != expected_agent_name:
        raise VoiceSessionRejected("Job was dispatched to a different agent.")
    if claims.room_name != room_name:
        raise VoiceSessionRejected("Job metadata does not match the dispatched room.")


def _decode(raw: str) -> dict:
    if not raw:
        raise VoiceSessionRejected("Job metadata is missing.")

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as error:
        raise VoiceSessionRejected("Job metadata is not valid JSON.") from error

    if not isinstance(payload, dict):
        raise VoiceSessionRejected("Job metadata is not an object.")
    return payload


def _verify_worker_token(claims: VoiceJobClaims) -> dict:
    try:
        payload = verify_worker_token(claims.worker_token)
    except jwt.ExpiredSignatureError as error:
        raise VoiceSessionRejected("Worker credential expired.") from error
    except jwt.InvalidTokenError as error:
        raise VoiceSessionRejected("Worker credential is invalid.") from error

    expected = {
        "uid": str(claims.user_id),
        "tntid": str(claims.tenant_id),
        "flow_version_id": str(claims.flow_version_id),
        "flow_id": str(claims.flow_id),
        "conversation_id": claims.conversation_id,
        "room_name": claims.room_name,
        "mode": claims.mode,
        "space_id": claims.space_id,
        "env_type": claims.env_type,
    }

    for claim, value in expected.items():
        if payload.get(claim) != value:
            raise VoiceSessionRejected(f"Worker credential does not match '{claim}'.")

    return payload


def _text(payload: dict, key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise VoiceSessionRejected(f"Job metadata is missing '{key}'.")
    return value


def _optional_text(payload: dict, key: str) -> str:
    value = payload.get(key)
    return value if isinstance(value, str) else ""


def _uuid(payload: dict, key: str) -> UUID:
    try:
        return UUID(_text(payload, key))
    except ValueError as error:
        raise VoiceSessionRejected(f"Job metadata has an invalid '{key}'.") from error
