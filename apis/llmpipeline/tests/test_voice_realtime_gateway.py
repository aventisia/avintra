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

    def __init__(self, output_sample_rate: int = 24000) -> None:
        self.output_sample_rate = output_sample_rate
        self._inbox: asyncio.Queue[Optional[bytes]] = asyncio.Queue()
        self.commits = 0
        self.closed = False

    async def send_audio(self, pcm: bytes) -> None:
        await self._inbox.put(pcm)

    async def send_commit(self) -> None:
        self.commits += 1

    async def events(self):
        while True:
            pcm = await self._inbox.get()
            if pcm is None:
                return
            yield ProviderAudio(pcm=pcm, sample_rate=self.output_sample_rate)
            yield ProviderTranscript(text="echo", final=False)

    async def close(self) -> None:
        self.closed = True
        await self._inbox.put(None)


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

        websocket.send_json({"type": "session.stop"})
        assert websocket.receive_json() == {"type": "session.closed"}
        close = _receive_close(websocket)
        assert close.code == 1000


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
