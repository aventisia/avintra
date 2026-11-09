"""Worker credential and dispatch-metadata binding tests for #373 (S4).

Every field of a dispatched job is duplicated between the metadata and the
signed worker credential, so these tests prove that a job replayed onto another
room, user, tenant, flow version, conversation, space, or environment is
rejected before the worker contacts a provider. The last group parses metadata
produced by the real session endpoint, which keeps the minting and verification
sides from drifting apart.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_worker_binding.py -q
"""
from __future__ import annotations

import json
import uuid

import jwt
import pytest

from app.core.config import settings
from app.features.auth.authenticated_user import User
from app.features.voice_sessions.schemas import (
    DISPATCH_METADATA_VERSION,
    VoiceSessionRequest,
)
from app.features.voice_sessions.service import build_dispatch_metadata
from app.features.voice_sessions.worker_token import (
    WORKER_TOKEN_SCOPE,
    WORKER_TOKEN_TTL_SECONDS,
    issue_worker_token,
    verify_worker_token,
)
from voice_agent.metadata import (
    VoiceSessionRejected,
    parse_job_metadata,
    validate_job,
)

ROOM_NAME = "voice-call-abc"
AGENT_NAME = "voice-agent"

# Metadata field and the worker-credential claim that must equal it.
BINDING_FIELDS = [
    ("room_name", "room_name"),
    ("flow_version_id", "flow_version_id"),
    ("flow_id", "flow_id"),
    ("tenant_id", "tntid"),
    ("user_id", "uid"),
    ("conversation_id", "conversation_id"),
    ("mode", "mode"),
    ("space_id", "space_id"),
    ("env_type", "env_type"),
]


@pytest.fixture
def user() -> User:
    return User(
        user_id=uuid.uuid4(),
        username="voice-tester",
        email="voice-tester@example.com",
        roles=["User"],
        tenant_id=uuid.uuid4(),
        space_id=str(uuid.uuid4()),
        env_type="dev",
    )


@pytest.fixture
def request_() -> VoiceSessionRequest:
    return VoiceSessionRequest(
        flow_version_id=uuid.uuid4(),
        flow_id=uuid.uuid4(),
        conversation_id=uuid.uuid4(),
        mode="test",
    )


def _token(user: User, request_: VoiceSessionRequest, **overrides) -> str:
    values = {
        "room_name": ROOM_NAME,
        "flow_version_id": request_.flow_version_id,
        "flow_id": request_.flow_id,
        "conversation_id": request_.conversation_id,
        "mode": request_.mode,
        **overrides,
    }
    return issue_worker_token(user, **values)


def _binding(user: User, request_: VoiceSessionRequest, **overrides) -> dict:
    payload = {
        "room_name": ROOM_NAME,
        "flow_version_id": str(request_.flow_version_id),
        "flow_id": str(request_.flow_id),
        "tenant_id": str(user.tenant_id),
        "user_id": str(user.user_id),
        "conversation_id": str(request_.conversation_id),
        "mode": request_.mode,
        "space_id": user.space_id or "",
        "env_type": user.env_type,
        **overrides,
    }
    return payload


def _metadata(binding: dict, worker_token: str, **overrides) -> str:
    return json.dumps(
        {
            "version": DISPATCH_METADATA_VERSION,
            **binding,
            "worker_token": worker_token,
            **overrides,
        }
    )


def _resigned(payload: dict, secret: str = settings.JWT_SECRET_KEY) -> str:
    return jwt.encode(payload, secret, algorithm="HS512")


# ---------------------------------------------------------------------------
# Worker credential shape
# ---------------------------------------------------------------------------


def test_worker_token_round_trips_only_the_session_binding(user, request_):
    payload = verify_worker_token(_token(user, request_))

    assert set(payload) == {
        "uid",
        "tntid",
        "uname",
        "email",
        "scope",
        "flow_version_id",
        "flow_id",
        "conversation_id",
        "room_name",
        "mode",
        "space_id",
        "env_type",
        "iss",
        "aud",
        "iat",
        "exp",
    }
    assert payload["scope"] == WORKER_TOKEN_SCOPE
    assert payload["uid"] == str(user.user_id)
    assert payload["tntid"] == str(user.tenant_id)
    assert payload["flow_version_id"] == str(request_.flow_version_id)
    assert payload["flow_id"] == str(request_.flow_id)
    assert payload["conversation_id"] == str(request_.conversation_id)
    assert payload["room_name"] == ROOM_NAME
    assert payload["mode"] == request_.mode
    assert payload["space_id"] == user.space_id
    assert payload["env_type"] == user.env_type


def test_worker_token_is_short_lived(user, request_):
    payload = verify_worker_token(_token(user, request_))

    assert payload["exp"] - payload["iat"] == WORKER_TOKEN_TTL_SECONDS
    assert WORKER_TOKEN_TTL_SECONDS <= 300


def test_worker_token_for_another_scope_is_rejected(user, request_):
    payload = verify_worker_token(_token(user, request_))
    payload["scope"] = "access"
    token = _resigned(payload)

    with pytest.raises(VoiceSessionRejected, match="invalid"):
        parse_job_metadata(_metadata(_binding(user, request_), token))


def test_worker_token_signed_with_another_key_is_rejected(user, request_):
    payload = verify_worker_token(_token(user, request_))
    token = _resigned(payload, secret="x" * 64)

    with pytest.raises(VoiceSessionRejected, match="invalid"):
        parse_job_metadata(_metadata(_binding(user, request_), token))


def test_expired_worker_token_is_rejected(user, request_):
    token = _token(user, request_, ttl_seconds=-1)

    with pytest.raises(VoiceSessionRejected, match="expired"):
        parse_job_metadata(_metadata(_binding(user, request_), token))


# ---------------------------------------------------------------------------
# Metadata must match the credential claim for claim
# ---------------------------------------------------------------------------


def _mismatched_value(field: str, current: str) -> str:
    if field == "room_name":
        return "another-room"
    if field == "mode":
        return "live" if current == "test" else "test"
    if field == "env_type":
        return "prod"
    return str(uuid.uuid4())


@pytest.mark.parametrize(("field", "claim"), BINDING_FIELDS)
def test_metadata_field_must_match_the_worker_credential(user, request_, field, claim):
    token = _token(user, request_)
    bound = _binding(user, request_)
    overrides = {field: _mismatched_value(field, bound[field])}

    with pytest.raises(VoiceSessionRejected, match=f"does not match '{claim}'"):
        parse_job_metadata(_metadata(bound, token, **overrides))


def test_matching_metadata_and_credential_are_accepted_for_both_modes(user, request_):
    for mode in ("test", "live"):
        live_request = request_.model_copy(update={"mode": mode})
        claims = parse_job_metadata(
            _metadata(_binding(user, live_request), _token(user, live_request))
        )
        assert claims.mode == mode


def test_absent_space_is_an_empty_claim(user, request_):
    user = user.model_copy(update={"space_id": None})
    claims = parse_job_metadata(
        _metadata(_binding(user, request_), _token(user, request_))
    )

    assert claims.space_id == ""


# ---------------------------------------------------------------------------
# Malformed dispatch metadata
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "field",
    [
        "room_name",
        "flow_version_id",
        "flow_id",
        "tenant_id",
        "user_id",
        "conversation_id",
        "mode",
        "env_type",
        "worker_token",
    ],
)
def test_metadata_missing_a_required_field_is_rejected(user, request_, field):
    payload = {
        "version": DISPATCH_METADATA_VERSION,
        **_binding(user, request_),
        "worker_token": _token(user, request_),
    }
    del payload[field]

    with pytest.raises(VoiceSessionRejected, match=f"missing '{field}'"):
        parse_job_metadata(json.dumps(payload))


@pytest.mark.parametrize(
    ("raw", "message"),
    [
        ("", "missing"),
        ("not-json", "not valid JSON"),
        ("[]", "not an object"),
        (json.dumps({"version": 999}), "version"),
        (json.dumps({"version": 999, "room_name": ROOM_NAME}), "version"),
    ],
)
def test_malformed_metadata_is_rejected(raw, message):
    with pytest.raises(VoiceSessionRejected, match=message):
        parse_job_metadata(raw)


@pytest.mark.parametrize("field", ["flow_version_id", "flow_id", "tenant_id", "user_id"])
def test_metadata_uuid_fields_must_be_uuids(user, request_, field):
    with pytest.raises(VoiceSessionRejected, match=f"invalid '{field}'"):
        parse_job_metadata(
            _metadata(_binding(user, request_), _token(user, request_), **{field: "not-a-uuid"})
        )


def test_metadata_with_an_unsupported_mode_is_rejected(user, request_):
    token = _token(user, request_)

    with pytest.raises(VoiceSessionRejected, match="mode"):
        parse_job_metadata(_metadata(_binding(user, request_), token, mode="realtime"))


# ---------------------------------------------------------------------------
# Job routing
# ---------------------------------------------------------------------------


def test_job_must_be_dispatched_to_the_configured_agent(user, request_):
    claims = parse_job_metadata(_metadata(_binding(user, request_), _token(user, request_)))

    validate_job(claims, agent_name=AGENT_NAME, expected_agent_name=AGENT_NAME, room_name=ROOM_NAME)

    with pytest.raises(VoiceSessionRejected, match="different agent"):
        validate_job(claims, agent_name="other-agent", expected_agent_name=AGENT_NAME, room_name=ROOM_NAME)


def test_job_must_arrive_in_the_room_named_by_its_credential(user, request_):
    claims = parse_job_metadata(_metadata(_binding(user, request_), _token(user, request_)))

    with pytest.raises(VoiceSessionRejected, match="dispatched room"):
        validate_job(claims, agent_name=AGENT_NAME, expected_agent_name=AGENT_NAME, room_name="another-room")


# ---------------------------------------------------------------------------
# The session endpoint and the worker must agree on the binding
# ---------------------------------------------------------------------------


def test_session_endpoint_metadata_is_accepted_by_the_worker(user, request_):
    metadata = build_dispatch_metadata(
        request_,
        user,
        ROOM_NAME,
        _token(user, request_),
    )

    claims = parse_job_metadata(metadata)

    assert claims.room_name == ROOM_NAME
    assert claims.tenant_id == user.tenant_id
    assert claims.user_id == user.user_id
    assert claims.flow_version_id == request_.flow_version_id
    assert claims.flow_id == request_.flow_id
    assert claims.conversation_id == str(request_.conversation_id)
    assert claims.mode == request_.mode
    assert claims.space_id == (user.space_id or "")
    assert claims.env_type == user.env_type


def test_session_endpoint_metadata_never_carries_the_caller_token_or_a_provider_key(user, request_):
    metadata = json.loads(build_dispatch_metadata(request_, user, ROOM_NAME, _token(user, request_)))

    assert "access_token" not in metadata
    assert "api_key" not in metadata
    assert set(metadata) == {
        "version",
        "room_name",
        "flow_version_id",
        "flow_id",
        "tenant_id",
        "user_id",
        "conversation_id",
        "mode",
        "space_id",
        "env_type",
        "worker_token",
    }
