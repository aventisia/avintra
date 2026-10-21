"""Realtime voice gateway contract and failure-path tests for #382.

The provider peer is mocked: no live credentials or network calls are used. The
tests exercise the browser-facing gateway contract (frame envelope, round trip,
close codes, error mapping) for the six allowlisted providers.

Run from ``apis/llmpipeline`` (``ENV`` defaults to ``local``):

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_realtime_gateway.py -q
"""
from __future__ import annotations

import asyncio
import base64
import uuid
from typing import Optional

import jwt
import pytest
from fastapi import FastAPI, HTTPException
from starlette.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.core.config import settings
from app.features.litellm.core.credentials import CredentialResolution
from app.features.realtime_voice import gateway_service as gateway_service_module
from app.features.realtime_voice import router as realtime_router
from app.features.realtime_voice.gateway_service import RealtimeGatewayService
from app.features.realtime_voice.provider_transport import (
    ProviderAudio,
    ProviderTranscript,
    RealtimeProviderError,
)

PATH = "/v2/llm/realtime/session"

# Provider models that exist in LiteLLM's per-provider catalog for the realtime mode.
REALTIME_MODELS = {
    "openai": "gpt-realtime",
    "azure": "gpt-realtime",
    "gemini": "gemini-2.5-flash-native-audio-latest",
    "vertex_ai": "gemini-live-2.5-flash-native-audio",
    "xai": "grok-voice-2.0",
    "bedrock": "amazon.nova-2-sonic-v1:0",
}

# A minimal silent PCM16 mono frame (two samples).
PCM_FRAME = b"\x00\x00" * 2


def _access_token() -> str:
    audience = f"https://{settings.APP_BASE_URL}"
    payload = {
        "uid": str(uuid.uuid4()),
        "uname": "realtime-tester",
        "email": "realtime-tester@example.com",
        "tntid": str(uuid.uuid4()),
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["User"],
        "aud": audience,
        "iss": audience,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS512")


class FakeProviderSession:
    """Echoes canonical input audio back as provider audio plus a transcript."""

    def __init__(
        self,
        output_sample_rate: int = 24000,
        scripted_events: Optional[list] = None,
    ) -> None:
        self.output_sample_rate = output_sample_rate
        self._inbox: asyncio.Queue[Optional[bytes]] = asyncio.Queue()
        self._scripted_events = list(scripted_events or [])
        self.transcription_models: list[str] = []
        self.commits = 0
        self.closed = False

    async def send_audio(self, pcm: bytes) -> None:
        await self._inbox.put(pcm)

    async def send_commit(self) -> None:
        self.commits += 1

    async def send_transcription_config(self, model: str) -> None:
        self.transcription_models.append(model)

    async def events(self):
        for event in self._scripted_events:
            yield event
        while True:
            pcm = await self._inbox.get()
            if pcm is None:
                return
            yield ProviderAudio(pcm=pcm, sample_rate=self.output_sample_rate)
            yield ProviderTranscript(text="echo", final=False)

    async def close(self) -> None:
        self.closed = True
        await self._inbox.put(None)


class FailingTranscriptionProviderSession(FakeProviderSession):
    """Rejects transcription enablement to exercise the audio-only fallback."""

    async def send_transcription_config(self, model: str) -> None:
        raise RuntimeError("transcription rejected")


def _build_app() -> FastAPI:
    app = FastAPI()
    app.include_router(realtime_router.router)
    return app


@pytest.fixture
def service(monkeypatch) -> RealtimeGatewayService:
    """A gateway wired to a fake provider peer, tenant gate, and credential resolver."""

    async def _allowed(provider: str, model: str, user) -> bool:
        return True

    async def _connect(**kwargs) -> FakeProviderSession:
        return FakeProviderSession()

    monkeypatch.setattr(
        gateway_service_module,
        "resolve_credentials",
        lambda provider, is_byok, credential_name, user: CredentialResolution(
            kwargs={"api_key": "test-key"}, uses_platform_credentials=False
        ),
    )

    instance = RealtimeGatewayService(connector=_connect, tenant_gate=_allowed)
    monkeypatch.setattr(realtime_router, "realtime_gateway_service", instance)
    return instance


@pytest.fixture
def client():
    with TestClient(_build_app()) as test_client:
        yield test_client


def _connect(client: TestClient, token: Optional[str] = None, query: str = ""):
    if token is None:
        client.cookies.clear()
    else:
        client.cookies.set("AccessToken", token)
    return client.websocket_connect(f"{PATH}{query}")


def _receive_close(websocket) -> WebSocketDisconnect:
    with pytest.raises(WebSocketDisconnect) as error:
        for _ in range(5):
            websocket.receive_json()
    return error.value


EXPECTED_TRANSCRIPTION_MODELS = {
    "openai": "whisper-1",
    "azure": "whisper-1",
    "gemini": "default",
    "vertex_ai": "default",
}


def _script_provider(
    service: RealtimeGatewayService,
    scripted_events: Optional[list] = None,
    session: Optional[FakeProviderSession] = None,
) -> FakeProviderSession:
    fake = session or FakeProviderSession(scripted_events=scripted_events)

    async def _connect(**kwargs) -> FakeProviderSession:
        return fake

    service._connector = _connect
    return fake


def _start_session(websocket, provider: str, model: Optional[str] = None) -> dict:
    websocket.send_json(
        {
            "type": "session.start",
            "provider": provider,
            "model": model or REALTIME_MODELS[provider],
            "credential_name": "tenant-realtime-key",
            "voice": "alloy",
            "language": "en",
        }
    )
    ready = websocket.receive_json()
    assert ready["type"] == "session.ready"
    return ready


def _stop_session(websocket) -> None:
    websocket.send_json({"type": "session.stop"})
    assert websocket.receive_json() == {"type": "session.closed"}
    assert _receive_close(websocket).code == 1000


# ---------------------------------------------------------------------------
# Accept path — round trip for every allowlisted provider
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("provider", sorted(REALTIME_MODELS))
def test_round_trip_for_allowlisted_provider(client, service, provider):
    with _connect(client, _access_token(), "?space_id=&env_type=dev") as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": provider,
                "model": REALTIME_MODELS[provider],
                "credential_name": "tenant-realtime-key",
                "voice": "alloy",
                "language": "en",
            }
        )

        ready = websocket.receive_json()
        assert ready["type"] == "session.ready"
        assert ready["provider"] == provider
        assert ready["model"] == REALTIME_MODELS[provider]
        assert ready["output_sample_rate"] == 24000

        websocket.send_json(
            {
                "type": "input_audio_chunk",
                "audio_base64": base64.b64encode(PCM_FRAME).decode("ascii"),
                "sample_rate": 16000,
                "commit": True,
            }
        )

        audio = websocket.receive_json()
        assert audio["type"] == "output_audio_chunk"
        assert base64.b64decode(audio["audio_base64"]) == PCM_FRAME
        assert audio["sample_rate"] == 24000

        transcript = websocket.receive_json()
        assert transcript["type"] == "transcript.delta"
        assert transcript["text"] == "echo"
        assert transcript["final"] is False
        assert transcript["role"] == "assistant"

        _stop_session(websocket)


# ---------------------------------------------------------------------------
# Input transcription enablement and transcript normalization
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("provider", sorted(REALTIME_MODELS))
def test_input_transcription_enablement_follows_provider_table(client, service, provider):
    fake = _script_provider(service)

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, provider)

        expected = EXPECTED_TRANSCRIPTION_MODELS.get(provider)
        if expected is None:
            assert fake.transcription_models == []
        else:
            assert fake.transcription_models == [expected]

        _stop_session(websocket)


def test_transcription_enablement_failure_keeps_the_session_audio_only(client, service):
    fake = _script_provider(service, session=FailingTranscriptionProviderSession())

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, "openai")

        websocket.send_json(
            {
                "type": "input_audio_chunk",
                "audio_base64": base64.b64encode(PCM_FRAME).decode("ascii"),
                "commit": True,
            }
        )
        audio = websocket.receive_json()
        assert audio["type"] == "output_audio_chunk"
        assert base64.b64decode(audio["audio_base64"]) == PCM_FRAME
        assert fake.commits == 1

        transcript = websocket.receive_json()
        assert transcript["type"] == "transcript.delta"
        assert transcript["role"] == "assistant"

        _stop_session(websocket)


def test_user_and_assistant_transcripts_are_role_tagged(client, service):
    _script_provider(
        service,
        [
            ProviderTranscript(text="hi", final=False, role="user"),
            ProviderTranscript(text="hello", final=False),
        ],
    )

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, "openai")

        user = websocket.receive_json()
        assert user == {"type": "transcript.delta", "text": "hi", "final": False, "role": "user"}

        assistant = websocket.receive_json()
        assert assistant == {
            "type": "transcript.delta",
            "text": "hello",
            "final": False,
            "role": "assistant",
        }

        _stop_session(websocket)


def test_incremental_deltas_pass_through_as_fragments(client, service):
    _script_provider(service, [ProviderTranscript(text="hel"), ProviderTranscript(text="lo")])

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, "openai")

        assert websocket.receive_json()["text"] == "hel"
        assert websocket.receive_json()["text"] == "lo"

        _stop_session(websocket)


def test_cumulative_deltas_reduce_to_suffixes(client, service):
    _script_provider(
        service,
        [
            ProviderTranscript(text="hel"),
            ProviderTranscript(text="hello"),
            ProviderTranscript(text="hello world"),
        ],
    )

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, "openai")

        assert websocket.receive_json()["text"] == "hel"
        assert websocket.receive_json()["text"] == "lo"
        assert websocket.receive_json()["text"] == " world"

        _stop_session(websocket)


def test_identical_resend_and_empty_deltas_are_suppressed(client, service):
    _script_provider(
        service,
        [
            ProviderTranscript(text="echo"),
            ProviderTranscript(text="echo"),
            ProviderTranscript(text=""),
            ProviderTranscript(text="next"),
        ],
    )

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, "openai")

        assert websocket.receive_json()["text"] == "echo"
        assert websocket.receive_json()["text"] == "next"

        _stop_session(websocket)


def test_final_transcript_is_authoritative_and_clears_that_role(client, service):
    _script_provider(
        service,
        [
            ProviderTranscript(text="hi", final=False, role="user"),
            ProviderTranscript(text="hi there", final=True, role="user"),
            ProviderTranscript(text="hi there again", final=False, role="user"),
            ProviderTranscript(text="done", final=True),
        ],
    )

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, "openai")

        assert websocket.receive_json() == {
            "type": "transcript.delta",
            "text": "hi",
            "final": False,
            "role": "user",
        }
        assert websocket.receive_json() == {
            "type": "transcript.delta",
            "text": "hi there",
            "final": True,
            "role": "user",
        }
        assert websocket.receive_json() == {
            "type": "transcript.delta",
            "text": "hi there again",
            "final": False,
            "role": "user",
        }
        assert websocket.receive_json() == {
            "type": "transcript.delta",
            "text": "done",
            "final": True,
            "role": "assistant",
        }

        _stop_session(websocket)


def test_role_normalization_is_independent_per_speaker(client, service):
    _script_provider(
        service,
        [
            ProviderTranscript(text="a", final=False, role="user"),
            ProviderTranscript(text="b", final=False, role="assistant"),
            ProviderTranscript(text="ab", final=False, role="user"),
            ProviderTranscript(text="bc", final=False, role="assistant"),
        ],
    )

    with _connect(client, _access_token()) as websocket:
        _start_session(websocket, "openai")

        assert websocket.receive_json()["text"] == "a"
        assert websocket.receive_json()["text"] == "b"
        assert websocket.receive_json()["text"] == "b"
        assert websocket.receive_json()["text"] == "c"

        _stop_session(websocket)


def test_map_provider_event_translates_user_and_assistant_transcripts():
    from app.features.realtime_voice.provider_transport import _map_provider_event

    assert _map_provider_event(
        {"type": "conversation.item.input_audio_transcription.delta", "delta": "hel"}
    ) == ProviderTranscript(text="hel", final=False, role="user")
    assert _map_provider_event(
        {"type": "conversation.item.input_audio_transcription.completed", "transcript": "hello"}
    ) == ProviderTranscript(text="hello", final=True, role="user")
    assert _map_provider_event({"type": "response.output_audio_transcript.delta", "delta": "hi"}) == (
        ProviderTranscript(text="hi", final=False, role="assistant")
    )
    assert _map_provider_event({"type": "response.output_audio_transcript.done", "transcript": "hi"}) == (
        ProviderTranscript(text="hi", final=True, role="assistant")
    )
    assert _map_provider_event({"type": "conversation.item.created"}) is None


# ---------------------------------------------------------------------------
# Studio-stored provider spellings (F1 regression)
# ---------------------------------------------------------------------------


def _assert_studio_alias_round_trip(client, service, stored_provider, expected_provider, model):
    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": stored_provider,
                "model": model,
                "credential_name": "tenant-realtime-key",
                "voice": "alloy",
                "language": "en",
            }
        )

        ready = websocket.receive_json()
        assert ready["type"] == "session.ready"
        assert ready["provider"] == expected_provider
        assert ready["model"] == model
        assert ready["output_sample_rate"] == 24000

        websocket.send_json(
            {
                "type": "input_audio_chunk",
                "audio_base64": base64.b64encode(PCM_FRAME).decode("ascii"),
                "sample_rate": 16000,
                "commit": True,
            }
        )

        audio = websocket.receive_json()
        assert audio["type"] == "output_audio_chunk"
        assert base64.b64decode(audio["audio_base64"]) == PCM_FRAME

        transcript = websocket.receive_json()
        assert transcript["type"] == "transcript.delta"

        websocket.send_json({"type": "session.stop"})
        assert websocket.receive_json() == {"type": "session.closed"}
        assert _receive_close(websocket).code == 1000


def test_googlegemini_alias_accepted_as_gemini(client, service):
    _assert_studio_alias_round_trip(
        client, service, "googlegemini", "gemini", REALTIME_MODELS["gemini"]
    )


def test_amazon_nova_alias_accepted_as_bedrock(client, service):
    _assert_studio_alias_round_trip(
        client, service, "amazon_nova", "bedrock", REALTIME_MODELS["bedrock"]
    )


def test_ultravox_alias_never_accepted(client, service):
    from app.features.litellm.core.provider_registry import normalize_provider
    from app.features.realtime_voice.schemas import REALTIME_PROVIDERS

    assert normalize_provider("ultravox") == "ultravox"
    assert normalize_provider("ultravox") not in REALTIME_PROVIDERS

    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "ultravox",
                "model": REALTIME_MODELS["gemini"],
                "credential_name": "tenant-realtime-key",
            }
        )
        error = websocket.receive_json()
        assert error["type"] == "error"
        assert error["code"] == "unsupported_provider"
        assert error["retryable"] is False
        assert _receive_close(websocket).code == 4400


# ---------------------------------------------------------------------------
# Reject paths — blocking close codes, never retried
# ---------------------------------------------------------------------------


def test_missing_cookie_is_rejected_with_4401(client, service):
    with pytest.raises(WebSocketDisconnect) as error:
        with _connect(client, None):
            pass
    assert error.value.code == 4401


def test_ultravox_provider_is_rejected_with_4400(client, service):
    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "ultravox",
                "model": "ultravox-v1",
                "credential_name": "tenant-realtime-key",
            }
        )
        error = websocket.receive_json()
        assert error["type"] == "error"
        assert error["code"] == "unsupported_provider"
        assert error["retryable"] is False
        assert _receive_close(websocket).code == 4400


def test_empty_model_is_rejected_with_4400(client, service):
    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "openai",
                "model": "",
                "credential_name": "tenant-realtime-key",
            }
        )
        error = websocket.receive_json()
        assert error["code"] == "invalid_config"
        assert error["retryable"] is False
        assert _receive_close(websocket).code == 4400


def test_non_byok_session_is_rejected_with_4400(client, service):
    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "openai",
                "model": "gpt-realtime",
                "credential_name": "",
            }
        )
        error = websocket.receive_json()
        assert error["code"] == "invalid_config"
        assert error["retryable"] is False
        assert _receive_close(websocket).code == 4400


def test_unknown_first_frame_is_rejected_with_4400(client, service):
    with _connect(client, _access_token()) as websocket:
        websocket.send_json({"type": "session.stop"})
        error = websocket.receive_json()
        assert error["code"] == "invalid_frame"
        assert _receive_close(websocket).code == 4400


def test_tenant_disabled_model_is_rejected_with_4403(client, service, monkeypatch):
    async def _denied(provider: str, model: str, user) -> bool:
        return False

    monkeypatch.setattr(service, "_tenant_gate", _denied)

    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "openai",
                "model": "gpt-realtime",
                "credential_name": "tenant-realtime-key",
            }
        )
        error = websocket.receive_json()
        assert error["code"] == "model_not_enabled"
        assert error["retryable"] is False
        assert _receive_close(websocket).code == 4403


def test_unresolvable_credential_is_rejected_with_4403(client, service, monkeypatch):
    def _raise(provider, is_byok, credential_name, user):
        raise HTTPException(status_code=400, detail="No valid credentials found.")

    monkeypatch.setattr(gateway_service_module, "resolve_credentials", _raise)

    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "openai",
                "model": "gpt-realtime",
                "credential_name": "missing-key",
            }
        )
        error = websocket.receive_json()
        assert error["code"] == "credentials_unavailable"
        assert error["retryable"] is False
        assert _receive_close(websocket).code == 4403


# ---------------------------------------------------------------------------
# Upstream failures and malformed frames
# ---------------------------------------------------------------------------


def test_upstream_failure_is_retryable_and_closes_1011(client, service, monkeypatch):
    async def _failing(**kwargs):
        raise RealtimeProviderError("provider unavailable", retryable=True)

    monkeypatch.setattr(service, "_connector", _failing)

    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "openai",
                "model": "gpt-realtime",
                "credential_name": "tenant-realtime-key",
            }
        )
        error = websocket.receive_json()
        assert error["type"] == "error"
        assert error["code"] == "upstream_error"
        assert error["retryable"] is True
        assert _receive_close(websocket).code == 1011


def test_unknown_frame_after_ready_errors_without_silent_drop(client, service):
    with _connect(client, _access_token()) as websocket:
        websocket.send_json(
            {
                "type": "session.start",
                "provider": "openai",
                "model": "gpt-realtime",
                "credential_name": "tenant-realtime-key",
            }
        )
        assert websocket.receive_json()["type"] == "session.ready"

        websocket.send_json({"type": "not-a-real-frame"})
        error = websocket.receive_json()
        assert error["type"] == "error"
        assert error["code"] == "invalid_frame"
        assert error["retryable"] is False

        websocket.send_json(
            {
                "type": "input_audio_chunk",
                "audio_base64": base64.b64encode(PCM_FRAME).decode("ascii"),
                "commit": False,
            }
        )
        assert websocket.receive_json()["type"] == "output_audio_chunk"
        assert websocket.receive_json()["type"] == "transcript.delta"

        _stop_session(websocket)


# ---------------------------------------------------------------------------
# Route registration
# ---------------------------------------------------------------------------


def test_realtime_ws_route_is_registered_on_the_app():
    from app.main import app

    websocket_paths = {route.path for route in app.routes if route.__class__.__name__ == "APIWebSocketRoute"}
    assert PATH in websocket_paths


def test_provider_allowlist_matches_the_executable_matrix():
    from app.features.realtime_voice.schemas import REALTIME_PROVIDERS

    assert set(REALTIME_PROVIDERS) == {"openai", "azure", "gemini", "vertex_ai", "xai", "bedrock"}
    assert "ultravox" not in REALTIME_PROVIDERS


# ---------------------------------------------------------------------------
# Capability catalog HTTP checks (LiteLLM v2 admin routes)
# ---------------------------------------------------------------------------


def test_realtime_providers_endpoint_lists_the_six():
    from app.main import app

    with TestClient(app) as api:
        api.cookies.set("AccessToken", _access_token())
        response = api.get("/v2/llm/providers", params={"capability": "realtime"})

    assert response.status_code == 200
    names = {provider["name"] for provider in response.json()["providers"]}
    for provider in REALTIME_MODELS:
        assert provider in names


@pytest.mark.parametrize("provider", sorted(REALTIME_MODELS))
def test_realtime_models_endpoint_lists_provider_models(provider):
    from app.main import app

    with TestClient(app) as api:
        api.cookies.set("AccessToken", _access_token())
        response = api.get(
            "/v2/llm/models", params={"provider": provider, "capability": "realtime"}
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == provider
    assert payload["count"] > 0
    assert all(model["capability"] == "realtime" for model in payload["models"])
