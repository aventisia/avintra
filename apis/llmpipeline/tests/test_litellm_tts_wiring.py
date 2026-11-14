"""LiteLLM TTS request/response wiring tests for #382.

The LiteLLM transport is stubbed: no network, no provider credentials, and no
vault call. The tests exercise the llmpipeline boundary the Studio voice-preview
control depends on: the canonical ``POST /v2/llm/tts/synthesize`` route, its
``credential_name`` trimming, the provider `synthesize` transport passthrough,
and the base64 ``TTSResponse`` contract.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_litellm_tts_wiring.py -q
"""
from __future__ import annotations

import asyncio
import base64
import uuid

import jwt
import pytest
from fastapi import FastAPI, HTTPException
from starlette.testclient import TestClient

from app.core.config import settings
from app.features.auth.authenticated_user import User
from app.features.litellm.core.litellm_service import litellm_service
from app.features.litellm.core.schemas import TTSRequest, TTSResponse
from app.features.litellm.tts import routes as tts_routes
from app.features.litellm.tts.litellm_tts_provider import LiteLLMTTSProvider

PATH = "/v2/llm/tts/synthesize"

# A minimal RIFF/WAVE payload; only its exact bytes are asserted, never decoded
# or played.
FIXED_AUDIO = b"RIFF$\x00\x00\x00WAVEfmt "


def _user() -> User:
    return User(
        user_id=uuid.uuid4(),
        username="tts-tester",
        email="tts-tester@example.com",
        roles=["User"],
        tenant_id=uuid.uuid4(),
    )


def _access_token() -> str:
    audience = f"https://{settings.APP_BASE_URL}"
    payload = {
        "uid": str(uuid.uuid4()),
        "uname": "tts-tester",
        "email": "tts-tester@example.com",
        "tntid": str(uuid.uuid4()),
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["User"],
        "aud": audience,
        "iss": audience,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS512")


def _byok_request(**overrides) -> TTSRequest:
    fields = {
        "provider": "openai",
        "model": "tts-1",
        "input": "Hello there",
        "voice_id": "alloy",
        "language": "en",
        "speed": 1.25,
        "credential_name": "preview-credential",
        "is_byok_enabled": True,
    }
    fields.update(overrides)
    return TTSRequest(**fields)


def test_synthesize_returns_base64_of_transport_bytes(monkeypatch):
    captured: dict = {}

    async def _synthesize(
        provider,
        model,
        *,
        input,
        voice,
        speed=1.0,
        is_byok=False,
        credential_name=None,
        user,
    ):
        captured.update(
            {
                "provider": provider,
                "model": model,
                "input": input,
                "voice": voice,
                "speed": speed,
                "is_byok": is_byok,
                "credential_name": credential_name,
                "user": user,
            }
        )
        return FIXED_AUDIO

    monkeypatch.setattr(litellm_service, "synthesize", _synthesize)

    user = _user()
    request = _byok_request()
    response = asyncio.run(LiteLLMTTSProvider().synthesize(request, user))

    assert response.output == base64.b64encode(FIXED_AUDIO).decode("utf-8")
    assert response.status == "completed"
    assert response.provider == "openai"
    assert response.model == "tts-1"
    assert response.credential_name == "preview-credential"
    assert response.is_byok_enabled is True
    assert response.token_count == len("Hello there")
    assert captured == {
        "provider": "openai",
        "model": "tts-1",
        "input": "Hello there",
        "voice": "alloy",
        "speed": 1.25,
        "is_byok": True,
        "credential_name": "preview-credential",
        "user": user,
    }


def test_googlegemini_alias_is_normalized_for_gemini_tts(monkeypatch):
    captured: dict = {}

    async def _synthesize(provider, model, **kwargs):
        captured.update({"provider": provider, "model": model})
        return FIXED_AUDIO

    monkeypatch.setattr(litellm_service, "synthesize", _synthesize)

    request = _byok_request(
        provider="googlegemini",
        model="gemini/gemini-3.8-flash-tts",
    )
    response = asyncio.run(LiteLLMTTSProvider().synthesize(request, _user()))

    assert response.provider == "gemini"
    assert captured == {
        "provider": "gemini",
        "model": "gemini/gemini-3.8-flash-tts",
    }


def test_gemini_voice_name_is_capitalized(monkeypatch):
    captured: dict = {}

    async def _synthesize(provider, model, **kwargs):
        captured.update(kwargs)
        return FIXED_AUDIO

    monkeypatch.setattr(litellm_service, "synthesize", _synthesize)

    request = _byok_request(
        provider="googlegemini",
        model="gemini/gemini-3.8-flash-tts",
        voice_id="journey",
    )
    asyncio.run(LiteLLMTTSProvider().synthesize(request, _user()))

    assert captured["voice"] == "Journey"


def test_gemini_voice_name_keeps_its_hyphenated_suffix(monkeypatch):
    captured: dict = {}

    async def _synthesize(provider, model, **kwargs):
        captured.update(kwargs)
        return FIXED_AUDIO

    monkeypatch.setattr(litellm_service, "synthesize", _synthesize)

    request = _byok_request(
        provider="googlegemini",
        model="gemini/gemini-3.8-flash-tts",
        voice_id="en-us-journey-f",
    )
    asyncio.run(LiteLLMTTSProvider().synthesize(request, _user()))

    assert captured["voice"] == "En-us-journey-f"


def test_provider_http_exception_propagates(monkeypatch):
    async def _synthesize(*args, **kwargs):
        raise HTTPException(status_code=400, detail="Unsupported model for preview.")

    monkeypatch.setattr(litellm_service, "synthesize", _synthesize)

    with pytest.raises(HTTPException) as error:
        asyncio.run(LiteLLMTTSProvider().synthesize(_byok_request(), _user()))

    assert error.value.status_code == 400
    assert error.value.detail == "Unsupported model for preview."


def test_route_trims_credential_name_and_returns_provider_output(monkeypatch):
    captured: dict = {}

    async def _synthesize(self, req, user):
        captured["credential_name"] = req.credential_name
        captured["user"] = user
        return TTSResponse(
            provider=req.provider,
            model=req.model,
            output="QUJD",
            status="completed",
            credential_name=req.credential_name,
            is_byok_enabled=req.is_byok_enabled,
        )

    monkeypatch.setattr(LiteLLMTTSProvider, "synthesize", _synthesize)

    app = FastAPI()
    app.include_router(tts_routes.router)

    with TestClient(app) as client:
        client.cookies.set("AccessToken", _access_token())
        response = client.post(
            PATH,
            json={
                "provider": "openai",
                "model": "tts-1",
                "input": "Hello there",
                "credential_name": "  padded  ",
                "is_byok_enabled": True,
            },
        )

    assert response.status_code == 200
    assert captured["credential_name"] == "padded"
    body = response.json()
    assert body["output"] == "QUJD"
    assert body["status"] == "completed"
    assert body["credential_name"] == "padded"
