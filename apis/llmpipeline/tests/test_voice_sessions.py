"""LiveKit session bootstrap and worker binding contract tests."""

from __future__ import annotations

import asyncio
import json
from types import SimpleNamespace
from unittest.mock import patch
from uuid import UUID

import jwt
import pytest

from app.core.config import settings
from app.features.auth.authenticated_user import User
from app.features.voice_sessions import service as session_service
from app.features.voice_sessions.schemas import VoiceSessionRequest
from app.features.voice_sessions.worker_token import (
    WORKER_TOKEN_SCOPE,
    issue_worker_token,
    verify_worker_token,
)
from voice_agent.metadata import VoiceSessionRejected, parse_job_metadata, validate_job

TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
OTHER_TENANT_ID = UUID("99999999-9999-9999-9999-999999999999")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")
FLOW_ID = UUID("33333333-3333-3333-3333-333333333333")
FLOW_VERSION_ID = UUID("44444444-4444-4444-4444-444444444444")
CONVERSATION_ID = UUID("55555555-5555-5555-5555-555555555555")
OTHER_CONVERSATION_ID = UUID("66666666-6666-6666-6666-666666666666")
AGENT_NAME = "avintra-voice-agent"
ROOM_NAME = f"voice-{CONVERSATION_ID}"


def _user(space_id: str | None = "space-1") -> User:
    return User(
        user_id=USER_ID,
        username="tester",
        email="tester@example.com",
        roles=[],
        tenant_id=TENANT_ID,
        space_id=space_id,
        env_type="dev",
    )


def _request(mode: str = "live") -> VoiceSessionRequest:
    return VoiceSessionRequest(
        flow_version_id=FLOW_VERSION_ID,
        flow_id=FLOW_ID,
        conversation_id=CONVERSATION_ID,
        mode=mode,
    )


def _worker_token(ttl_seconds: int = 300, **overrides) -> str:
    binding = {
        "room_name": ROOM_NAME,
        "flow_version_id": FLOW_VERSION_ID,
        "flow_id": FLOW_ID,
        "conversation_id": CONVERSATION_ID,
        "mode": "live",
    }
    binding.update(overrides)
    return issue_worker_token(_user(), ttl_seconds=ttl_seconds, **binding)


def _metadata(**overrides) -> str:
    payload = {
        "version": 1,
        "room_name": ROOM_NAME,
        "flow_version_id": str(FLOW_VERSION_ID),
        "flow_id": str(FLOW_ID),
        "tenant_id": str(TENANT_ID),
        "user_id": str(USER_ID),
        "conversation_id": str(CONVERSATION_ID),
        "mode": "live",
        "space_id": "space-1",
        "env_type": "dev",
        "worker_token": _worker_token(),
    }
    payload.update(overrides)
    return json.dumps(payload)


def test_worker_token_round_trip():
    payload = verify_worker_token(_worker_token())

    assert payload["uid"] == str(USER_ID)
    assert payload["tntid"] == str(TENANT_ID)
    assert payload["scope"] == WORKER_TOKEN_SCOPE


def test_worker_token_rejects_foreign_scope():
    token = jwt.encode(
        {
            "uid": str(USER_ID),
            "tntid": str(TENANT_ID),
            "scope": "not-a-worker",
            "iss": f"https://{settings.APP_BASE_URL}",
            "aud": f"https://{settings.APP_BASE_URL}",
        },
        settings.JWT_SECRET_KEY,
        algorithm="HS512",
    )

    with pytest.raises(jwt.InvalidTokenError):
        verify_worker_token(token)


def test_expired_worker_token_is_rejected_before_provider_calls():
    expired = _worker_token(ttl_seconds=-1)

    with pytest.raises(VoiceSessionRejected):
        parse_job_metadata(_metadata(worker_token=expired))


def test_job_metadata_binds_the_caller():
    claims = parse_job_metadata(_metadata())
    validate_job(
        claims,
        agent_name=AGENT_NAME,
        expected_agent_name=AGENT_NAME,
        room_name=ROOM_NAME,
    )

    assert claims.flow_version_id == FLOW_VERSION_ID
    assert claims.flow_id == FLOW_ID
    assert claims.tenant_id == TENANT_ID
    assert claims.user_id == USER_ID
    assert claims.conversation_id == str(CONVERSATION_ID)
    assert claims.mode == "live"
    assert claims.space_id == "space-1"
    assert claims.env_type == "dev"


def test_job_metadata_rejects_another_tenant():
    with pytest.raises(VoiceSessionRejected):
        parse_job_metadata(_metadata(tenant_id=str(OTHER_TENANT_ID)))


def test_job_metadata_rejects_another_room():
    claims = parse_job_metadata(_metadata())

    with pytest.raises(VoiceSessionRejected):
        validate_job(
            claims,
            agent_name=AGENT_NAME,
            expected_agent_name=AGENT_NAME,
            room_name="voice-another-conversation",
        )


def test_job_metadata_rejects_a_replayed_worker_token():
    with pytest.raises(VoiceSessionRejected):
        parse_job_metadata(_metadata(conversation_id=str(OTHER_CONVERSATION_ID)))


def test_job_metadata_rejects_unknown_mode():
    with pytest.raises(VoiceSessionRejected):
        parse_job_metadata(_metadata(mode="recording"))


def test_missing_livekit_config_fails_closed(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_HTTP_URL", "")

    with pytest.raises(session_service.VoiceSessionError):
        asyncio.run(session_service.create_session(_request(), _user()))


def test_missing_worker_token_config_fails_closed(monkeypatch):
    monkeypatch.setattr(settings, "APP_BASE_URL", "")

    with pytest.raises(session_service.VoiceSessionError):
        _worker_token()


class _FakeRoomService:
    def __init__(self) -> None:
        self.created = []
        self.deleted = []

    async def create_room(self, request):
        self.created.append(request)
        return SimpleNamespace(name=request.name)

    async def delete_room(self, request):
        self.deleted.append(request.room)
        return SimpleNamespace()


class _FakeDispatchService:
    def __init__(self) -> None:
        self.dispatched = []

    async def create_dispatch(self, request):
        self.dispatched.append(request)
        return SimpleNamespace(id="dispatch-1")


class _FailingDispatchService:
    async def create_dispatch(self, request):
        raise RuntimeError("dispatch failed")


class _FakeLiveKitAPI:
    last_instance: "_FakeLiveKitAPI | None" = None

    def __init__(self, **kwargs) -> None:
        self.kwargs = kwargs
        self.room = _FakeRoomService()
        self.agent_dispatch = _FakeDispatchService()
        _FakeLiveKitAPI.last_instance = self

    async def __aenter__(self) -> "_FakeLiveKitAPI":
        return self

    async def __aexit__(self, *_exc) -> bool:
        return False


def test_create_session_dispatches_the_bound_worker(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_HTTP_URL", "http://livekit.test")
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://livekit.test")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "test-key")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "test-secret")
    monkeypatch.setattr(settings, "LIVEKIT_AGENT_NAME", AGENT_NAME)

    async def run():
        with patch.object(session_service, "LiveKitAPI", _FakeLiveKitAPI):
            return await session_service.create_session(_request(), _user())

    response = asyncio.run(run())
    fake = _FakeLiveKitAPI.last_instance

    assert fake is not None
    assert fake.kwargs["url"] == "http://livekit.test"
    room_name = fake.room.created[0].name
    assert room_name.startswith(f"voice-{CONVERSATION_ID}-")
    assert fake.room.deleted == []

    dispatch = fake.agent_dispatch.dispatched[0]
    assert dispatch.agent_name == AGENT_NAME
    assert dispatch.room == room_name

    claims = parse_job_metadata(dispatch.metadata)
    assert claims.conversation_id == str(CONVERSATION_ID)
    assert claims.user_id == USER_ID
    assert claims.tenant_id == TENANT_ID

    assert response.room_name == room_name
    assert response.server_url == "ws://livekit.test"
    assert response.conversation_id == str(CONVERSATION_ID)
    assert response.agent_name == AGENT_NAME
    assert response.expires_in == session_service.CLIENT_TOKEN_TTL_SECONDS

    token = jwt.decode(
        response.client_token,
        "test-secret",
        algorithms=["HS256"],
        options={"verify_aud": False},
    )
    video = token["video"]
    assert token["sub"] == f"user-{USER_ID}"
    assert video["roomJoin"] is True
    assert video["room"] == room_name
    assert video["canPublish"] is True
    assert video["canSubscribe"] is True
    assert video["canPublishData"] is True
    assert "roomCreate" not in video
    assert "roomAdmin" not in video


def test_create_session_deletes_the_room_when_dispatch_fails(monkeypatch):
    monkeypatch.setattr(settings, "LIVEKIT_HTTP_URL", "http://livekit.test")
    monkeypatch.setattr(settings, "LIVEKIT_WS_URL", "ws://livekit.test")
    monkeypatch.setattr(settings, "LIVEKIT_API_KEY", "test-key")
    monkeypatch.setattr(settings, "LIVEKIT_API_SECRET", "test-secret")
    monkeypatch.setattr(settings, "LIVEKIT_AGENT_NAME", AGENT_NAME)

    class _FailingLiveKitAPI(_FakeLiveKitAPI):
        def __init__(self, **kwargs) -> None:
            super().__init__(**kwargs)
            self.agent_dispatch = _FailingDispatchService()

    async def run():
        with patch.object(session_service, "LiveKitAPI", _FailingLiveKitAPI):
            await session_service.create_session(_request(), _user())

    with pytest.raises(RuntimeError):
        asyncio.run(run())

    fake = _FailingLiveKitAPI.last_instance
    assert fake is not None
    assert fake.room.deleted == [fake.room.created[0].name]
