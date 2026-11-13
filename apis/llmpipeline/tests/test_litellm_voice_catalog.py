"""Voice catalog tests for the LiteLLM TTS and realtime paths.

No external provider is called: ElevenLabs HTTP is stubbed and the remaining
catalogs are provider-defined constants.

Run from ``apis/llmpipeline``:

    ./venv/Scripts/python.exe -m pytest tests/test_litellm_voice_catalog.py -q
"""
from __future__ import annotations

import asyncio
import uuid

import jwt
from fastapi import FastAPI
from starlette.testclient import TestClient

from app.core.config import settings
from app.features.auth.authenticated_user import User
from app.features.litellm.core.credentials import CredentialResolution
from app.features.litellm.voice_catalog import routes, service
from app.features.litellm.voice_catalog.schemas import LanguageInfo, VoiceInfo
from app.features.litellm.voice_catalog.service import voice_catalog_service

VOICES_PATH = "/v2/llm/voices"
LANGUAGES_PATH = "/v2/llm/languages"


def _user() -> User:
    return User(
        user_id=uuid.uuid4(),
        username="voice-catalog-tester",
        email="voice-catalog-tester@example.com",
        roles=["User"],
        tenant_id=uuid.uuid4(),
    )


def _access_token() -> str:
    audience = f"https://{settings.APP_BASE_URL}"
    payload = {
        "uid": str(uuid.uuid4()),
        "uname": "voice-catalog-tester",
        "email": "voice-catalog-tester@example.com",
        "tntid": str(uuid.uuid4()),
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": ["User"],
        "aud": audience,
        "iss": audience,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS512")


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(routes.router)
    client = TestClient(app)
    client.cookies.set("AccessToken", _access_token())
    return client


def _stub_elevenlabs_credentials(monkeypatch) -> None:
    monkeypatch.setattr(
        service,
        "resolve_credentials",
        lambda *args, **kwargs: CredentialResolution(
            kwargs={
                "api_key": "elevenlabs-test-key",
                "api_base": "https://elevenlabs.test/v1",
            },
            uses_platform_credentials=False,
        ),
    )


def test_openai_tts_voices_use_the_standard_schema():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "openai", "model": "tts-1", "capability": "tts"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "openai"
    assert body["model"] == "tts-1"
    assert body["capability"] == "tts"
    assert body["count"] == len(body["voices"])
    assert body["voices"][0] == {"id": "alloy", "name": "Alloy", "sample": None}


def test_realtime_capability_is_inferred_from_a_known_model():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "openai", "model": "gpt-realtime"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["capability"] == "realtime"
    voice_ids = {voice["id"] for voice in body["voices"]}
    assert "alloy" in voice_ids
    assert "fable" not in voice_ids


def test_realtime_capability_is_inferred_from_the_model_name():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "openai", "model": "gpt-4o-realtime-preview"},
    )

    assert response.status_code == 200
    assert response.json()["capability"] == "realtime"


def test_gemini_realtime_accepts_a_chat_model_id():
    response = _client().get(
        VOICES_PATH,
        params={
            "provider": "googlegemini",
            "model": "gemini-2.5-flash",
            "capability": "realtime",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "gemini"
    assert body["capability"] == "realtime"


def test_gemini_alias_is_normalized_for_tts_voices():
    response = _client().get(
        VOICES_PATH,
        params={
            "provider": "googlegemini",
            "model": "gemini-2.5-flash-preview-tts",
            "capability": "tts",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "gemini"
    assert "puck" in {voice["id"] for voice in body["voices"]}


def test_elevenlabs_voices_use_the_provider_preview_url(monkeypatch):
    _stub_elevenlabs_credentials(monkeypatch)
    captured: dict = {}

    async def _fetch(path, api_base, api_key):
        captured.update({"path": path, "api_base": api_base, "api_key": api_key})
        return {
            "voices": [
                {
                    "voice_id": "voice-1",
                    "name": "Rachel",
                    "preview_url": "https://cdn.example/rachel.mp3",
                }
            ]
        }

    monkeypatch.setattr(service, "_fetch_elevenlabs", _fetch)

    response = _client().get(
        VOICES_PATH,
        params={"provider": "elevenlabs", "model": "eleven_multilingual_v2"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["voices"] == [
        {
            "id": "voice-1",
            "name": "Rachel",
            "sample": "https://cdn.example/rachel.mp3",
        }
    ]
    assert captured["path"] == "/voices?page_size=100"


def test_elevenlabs_byok_credential_is_trimmed_and_used(monkeypatch):
    captured: dict = {}

    def _resolve(provider, is_byok, credential_name, user):
        captured.update(
            {
                "provider": provider,
                "is_byok": is_byok,
                "credential_name": credential_name,
            }
        )
        return CredentialResolution(
            kwargs={"api_key": "byok-key", "api_base": "https://byok.test/v1"},
            uses_platform_credentials=False,
        )

    async def _fetch(path, api_base, api_key):
        captured.update({"path": path, "api_base": api_base, "api_key": api_key})
        return {"voices": [{"voice_id": "v1", "name": "Voice"}]}

    monkeypatch.setattr(service, "resolve_credentials", _resolve)
    monkeypatch.setattr(service, "_fetch_elevenlabs", _fetch)

    response = _client().get(
        VOICES_PATH,
        params={
            "provider": "elevenlabs",
            "model": "eleven_multilingual_v2",
            "credential_name": "  byok-credential  ",
        },
    )

    assert response.status_code == 200
    assert captured == {
        "provider": "elevenlabs",
        "is_byok": True,
        "credential_name": "byok-credential",
        "path": "/voices?page_size=100",
        "api_base": "https://byok.test/v1",
        "api_key": "byok-key",
    }


def test_elevenlabs_voices_follow_pagination(monkeypatch):
    _stub_elevenlabs_credentials(monkeypatch)
    paths: list[str] = []

    async def _fetch(path, api_base, api_key):
        paths.append(path)
        if len(paths) == 1:
            return {
                "voices": [{"voice_id": "voice-1", "name": "Rachel"}],
                "has_more": True,
                "next_page_token": "page-2",
            }
        return {
            "voices": [{"voice_id": "voice-2", "name": "Adam"}],
            "has_more": False,
        }

    monkeypatch.setattr(service, "_fetch_elevenlabs", _fetch)

    response = _client().get(
        VOICES_PATH,
        params={"provider": "elevenlabs", "model": "eleven_multilingual_v2"},
    )

    assert response.status_code == 200
    assert [voice["id"] for voice in response.json()["voices"]] == ["voice-1", "voice-2"]
    assert paths == ["/voices?page_size=100", "/voices?page_size=100&next_page_token=page-2"]


def test_elevenlabs_failure_falls_back_to_the_static_catalog(monkeypatch):
    _stub_elevenlabs_credentials(monkeypatch)

    async def _fetch(*args, **kwargs):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(service, "_fetch_elevenlabs", _fetch)

    response = _client().get(
        VOICES_PATH,
        params={"provider": "elevenlabs", "model": "eleven_multilingual_v2"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["count"] == len(body["voices"])
    assert body["count"] > 0
    assert body["voices"][0]["sample"] is None


def test_elevenlabs_partial_page_failure_keeps_the_live_voices(monkeypatch):
    _stub_elevenlabs_credentials(monkeypatch)

    async def _fetch(path, api_base, api_key):
        if "next_page_token" in path:
            raise RuntimeError("provider unavailable")
        return {
            "voices": [{"voice_id": "voice-1", "name": "Rachel"}],
            "has_more": True,
            "next_page_token": "page-2",
        }

    monkeypatch.setattr(service, "_fetch_elevenlabs", _fetch)

    response = _client().get(
        VOICES_PATH,
        params={"provider": "elevenlabs", "model": "eleven_multilingual_v2"},
    )

    assert response.status_code == 200
    assert response.json()["voices"] == [
        {"id": "voice-1", "name": "Rachel", "sample": None},
    ]


def test_elevenlabs_v3_fallback_covers_the_full_language_library(monkeypatch):
    _stub_elevenlabs_credentials(monkeypatch)

    async def _fetch(*args, **kwargs):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(service, "_fetch_elevenlabs", _fetch)

    for model in ("eleven_v3", "ELEVEN_V3"):
        response = _client().get(
            LANGUAGES_PATH,
            params={"provider": "elevenlabs", "model": model},
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["languages"]) >= 70
        assert {"id": "zu", "name": "Zulu"} in body["languages"]


def test_elevenlabs_languages_come_from_the_selected_model(monkeypatch):
    _stub_elevenlabs_credentials(monkeypatch)
    captured: dict = {}

    async def _fetch(path, api_base, api_key):
        captured["path"] = path
        return [
            {
                "model_id": "eleven_other",
                "languages": [{"language_id": "de", "name": "German"}],
            },
            {
                "model_id": "eleven_multilingual_v2",
                "languages": [
                    {"language_id": "en", "name": "English"},
                    {"language_id": "hi", "name": "Hindi"},
                ],
            },
        ]

    monkeypatch.setattr(service, "_fetch_elevenlabs", _fetch)

    response = _client().get(
        LANGUAGES_PATH,
        params={"provider": "elevenlabs", "model": "eleven_multilingual_v2"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["languages"] == [
        {"id": "en", "name": "English"},
        {"id": "hi", "name": "Hindi"},
    ]
    assert captured["path"] == "/models"


def test_openai_realtime_languages_are_english_only():
    response = _client().get(
        LANGUAGES_PATH,
        params={"provider": "openai", "model": "gpt-realtime", "capability": "realtime"},
    )

    assert response.status_code == 200
    assert response.json()["languages"] == [{"id": "en", "name": "English"}]


def test_azure_uses_the_openai_voice_catalog():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "azure", "model": "tts-1", "capability": "tts"},
    )

    assert response.status_code == 200
    assert "alloy" in {voice["id"] for voice in response.json()["voices"]}


def test_unsupported_provider_is_rejected():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "anthropic", "model": "claude-4.5-sonnet-20250929"},
    )

    assert response.status_code == 400
    assert "Unsupported voice provider" in response.json()["detail"]


def test_model_capability_mismatch_is_rejected():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "openai", "model": "gpt-4o", "capability": "tts"},
    )

    assert response.status_code == 400
    assert "not a tts model" in response.json()["detail"]


def test_stt_model_is_rejected_for_tts_voices():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "elevenlabs", "model": "scribe_v2", "capability": "tts"},
    )

    assert response.status_code == 400
    assert "not a tts model" in response.json()["detail"]


def test_unsupported_capability_is_rejected():
    response = _client().get(
        VOICES_PATH,
        params={"provider": "openai", "model": "tts-1", "capability": "embedding"},
    )

    assert response.status_code == 400


def test_languages_use_the_standard_schema():
    response = _client().get(
        LANGUAGES_PATH,
        params={"provider": "gemini", "model": "gemini-2.5-flash-preview-tts"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["count"] == len(body["languages"])
    assert {"id": "en", "name": "English"} in body["languages"]


def test_service_returns_provider_name_and_model_for_languages():
    result = asyncio.run(
        voice_catalog_service.list_languages(
            "googlegemini",
            "gemini-2.5-flash-preview-tts",
            "tts",
            None,
            _user(),
        )
    )

    assert result.provider == "gemini"
    assert result.model == "gemini-2.5-flash-preview-tts"
    assert result.capability == "tts"
    assert isinstance(result.languages[0], LanguageInfo)
    assert isinstance(
        asyncio.run(
            voice_catalog_service.list_voices(
                "openai",
                "tts-1",
                "tts",
                None,
                _user(),
            )
        ).voices[0],
        VoiceInfo,
    )
