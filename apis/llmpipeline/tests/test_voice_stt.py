"""Server VAD + whole-utterance STT tests for #373 (S6).

The LiteLLM provider is mocked so these tests never reach a provider. They
cover the request mapping (provider, model, language, BYOK, credit refs), the
WAV encoding of one whole utterance, silence, empty output, provider failure,
and cancellation.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_stt.py -q
"""

from __future__ import annotations

import asyncio
import base64
import io
import wave
from uuid import UUID, uuid4

import pytest
from livekit import rtc

from app.features.litellm.core.schemas import STTResponse
from voice_agent.metadata import VoiceJobClaims
from voice_agent.stt_adapter import LiteLLMSTT, build_stt_request, build_user

FLOW_VERSION_ID = UUID("44444444-4444-4444-4444-444444444444")
FLOW_ID = UUID("33333333-3333-3333-3333-333333333333")
TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")

AGENT_SETTINGS = {
    "agentName": "Support Agent",
    "stt": {
        "provider": "elevenlabs",
        "model": "scribe_v1",
        "credentialName": "caller-stt-key",
        "isByokEnabled": True,
    },
    "ttsVoice": {"language": "en-US"},
}


def _claims() -> VoiceJobClaims:
    return VoiceJobClaims(
        room_name="voice-room",
        flow_version_id=FLOW_VERSION_ID,
        flow_id=FLOW_ID,
        tenant_id=TENANT_ID,
        user_id=USER_ID,
        conversation_id=str(uuid4()),
        mode="test",
        space_id="space-1",
        env_type="dev",
        worker_token="worker-token",
        username="voice-tester",
        email="voice-tester@example.com",
    )


def _frame(samples_per_channel: int = 1600) -> rtc.AudioFrame:
    return rtc.AudioFrame.create(
        sample_rate=16000,
        num_channels=1,
        samples_per_channel=samples_per_channel,
    )


def _recording_provider(output: str = "hello there"):
    calls: list = []

    async def transcribe(request, user):
        calls.append((request, user))
        return STTResponse(
            provider=request.provider,
            model=request.model,
            output=output,
        )

    return calls, transcribe


# ---------------------------------------------------------------------------
# Request and user mapping
# ---------------------------------------------------------------------------


def test_stt_request_carries_settings_byok_and_credit_references():
    request = build_stt_request(_claims(), AGENT_SETTINGS)

    assert request.provider == "elevenlabs"
    assert request.model == "scribe_v1"
    assert request.language == "en-US"
    assert request.credential_name == "caller-stt-key"
    assert request.is_byok_enabled is True
    assert request.ref_type == "Agent"
    assert request.ref_id == str(FLOW_ID)
    assert request.ref_name == "Support Agent"
    assert request.action == "AgentExecution"
    assert request.agent_name == "Support Agent"
    assert request.input == ""


def test_user_carries_the_worker_identity_and_credential():
    claims = _claims()
    user = build_user(claims)

    assert user.user_id == USER_ID
    assert user.tenant_id == TENANT_ID
    assert user.username == "voice-tester"
    assert user.email == "voice-tester@example.com"
    assert user.space_id == "space-1"
    assert user.env_type == "dev"
    assert user.access_token == "worker-token"
    assert user.roles == []


# ---------------------------------------------------------------------------
# One final transcript per whole utterance
# ---------------------------------------------------------------------------


def test_speech_is_transcribed_as_one_final_event_with_one_wav_utterance():
    calls, transcribe = _recording_provider("  hello there  ")
    adapter = LiteLLMSTT(
        request=build_stt_request(_claims(), AGENT_SETTINGS),
        user=build_user(_claims()),
        transcribe=transcribe,
    )

    assert adapter.capabilities.streaming is False

    event = asyncio.run(adapter.recognize([_frame()]))

    assert event.type.value == "final_transcript"
    assert [alternative.text for alternative in event.alternatives] == ["hello there"]
    assert len(calls) == 1

    request, user = calls[0]
    assert request.credential_name == "caller-stt-key"
    assert request.is_byok_enabled is True
    assert request.ref_id == str(FLOW_ID)
    assert user.access_token == "worker-token"

    header, encoded = request.input.split(",", 1)
    assert header == "data:audio/wav;base64"
    with wave.open(io.BytesIO(base64.b64decode(encoded)), "rb") as wav:
        assert wav.getnchannels() == 1
        assert wav.getsampwidth() == 2
        assert wav.getframerate() == 16000
        assert wav.getnframes() == 1600


class _TimingEvents:
    def __init__(self) -> None:
        self.durations: list[int] = []

    def stt_final(self, duration_ms: int) -> None:
        self.durations.append(duration_ms)


def test_final_utterance_records_the_stt_duration_before_the_turn_starts():
    calls, transcribe = _recording_provider("hello there")
    events = _TimingEvents()
    adapter = LiteLLMSTT(
        request=build_stt_request(_claims(), AGENT_SETTINGS),
        user=build_user(_claims()),
        transcribe=transcribe,
        events=events,
    )

    event = asyncio.run(adapter.recognize([_frame()]))

    assert event.alternatives[0].text == "hello there"
    assert len(events.durations) == 1
    assert events.durations[0] >= 0


def test_empty_vad_buffer_does_not_call_the_provider_or_emit_a_transcript():
    calls, transcribe = _recording_provider()
    adapter = LiteLLMSTT(
        request=build_stt_request(_claims(), AGENT_SETTINGS),
        user=build_user(_claims()),
        transcribe=transcribe,
    )

    event = asyncio.run(adapter.recognize([]))

    assert event.type.value == "final_transcript"
    assert event.alternatives == []
    assert calls == []


def test_empty_provider_output_emits_no_transcript_or_timing():
    calls, transcribe = _recording_provider(output="   ")
    events = _TimingEvents()
    adapter = LiteLLMSTT(
        request=build_stt_request(_claims(), AGENT_SETTINGS),
        user=build_user(_claims()),
        transcribe=transcribe,
        events=events,
    )

    event = asyncio.run(adapter.recognize([_frame()]))

    assert event.alternatives == []
    assert len(calls) == 1
    assert events.durations == []


# ---------------------------------------------------------------------------
# Failure and cancellation
# ---------------------------------------------------------------------------


def test_provider_failure_keeps_the_session_alive_without_a_transcript():
    async def failing(request, user):
        raise RuntimeError("provider is down")

    adapter = LiteLLMSTT(
        request=build_stt_request(_claims(), AGENT_SETTINGS),
        user=build_user(_claims()),
        transcribe=failing,
    )

    event = asyncio.run(adapter.recognize([_frame()]))

    assert event.type.value == "final_transcript"
    assert event.alternatives == []


def test_cancellation_propagates():
    async def cancelled(request, user):
        raise asyncio.CancelledError

    adapter = LiteLLMSTT(
        request=build_stt_request(_claims(), AGENT_SETTINGS),
        user=build_user(_claims()),
        transcribe=cancelled,
    )

    with pytest.raises(asyncio.CancelledError):
        asyncio.run(adapter.recognize([_frame()]))
