"""LiteLLM STT provider normalization tests.

The LiteLLM transport is stubbed: no network, no provider credentials, and no
vault call. Voice settings store the provider as ``googlegemini``; the provider
must reach LiteLLM as ``gemini``.

Run from ``apis/llmpipeline``:

    ./venv/Scripts/python.exe -m pytest tests/test_litellm_stt_wiring.py -q
"""
from __future__ import annotations

import asyncio
import base64
import io
import uuid
import wave

from app.features.auth.authenticated_user import User
from app.features.litellm.core.litellm_service import litellm_service
from app.features.litellm.core.schemas import STTRequest
from app.features.litellm.stt import litellm_stt_provider
from app.features.litellm.stt.litellm_stt_provider import LiteLLMSTTProvider

SAMPLE_RATE = 16000


def _user() -> User:
    return User(
        user_id=uuid.uuid4(),
        username="stt-tester",
        email="stt-tester@example.com",
        roles=["User"],
        tenant_id=uuid.uuid4(),
    )


def _wav_data_uri() -> str:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(b"\x00\x00" * SAMPLE_RATE)
    return "data:audio/wav;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


def test_wav_duration_is_read_without_ffmpeg(monkeypatch):
    def _fail(*args, **kwargs):
        raise AssertionError("WAV duration must not go through pydub")

    monkeypatch.setattr(litellm_stt_provider.AudioSegment, "from_file", _fail)

    assert litellm_stt_provider._audio_duration_seconds(_wav_data_uri()) == 1.0


def test_googlegemini_alias_is_normalized_for_gemini_stt(monkeypatch):
    captured: dict = {}

    class _Transcript:
        text = "hello there"

    async def _transcribe(provider, model, **kwargs):
        captured.update({"provider": provider, "model": model})
        return _Transcript()

    monkeypatch.setattr(litellm_service, "transcribe", _transcribe)
    monkeypatch.setattr(litellm_stt_provider, "file_to_base64", lambda _: _wav_data_uri())
    monkeypatch.setattr(litellm_stt_provider, "_audio_duration_seconds", lambda _: 1.0)
    monkeypatch.setattr(
        litellm_stt_provider,
        "resolve_credential_name",
        lambda name, user: name,
    )

    request = STTRequest(
        provider="googlegemini",
        model="gemini/gemini-3.5-transcribe",
        input="audio.wav",
        language="en",
        credential_name="gemini-key",
        is_byok_enabled=True,
    )
    response = asyncio.run(LiteLLMSTTProvider().transcribe(request, _user()))

    assert response.output == "hello there"
    assert response.provider == "gemini"
    assert captured == {
        "provider": "gemini",
        "model": "gemini/gemini-3.5-transcribe",
    }
