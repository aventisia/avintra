"""Sentence-buffered LiteLLM TTS tests for #373 (S8).

The provider is mocked with base64 audio so these tests never reach a network.
They cover the request mapping, first-sentence flush, sentence order, the safe
buffer cap, empty text, provider failure, and cancellation.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_tts.py -q
"""

from __future__ import annotations

import asyncio
import base64
import io
import wave
from uuid import UUID, uuid4

from app.features.litellm.core.litellm_service import litellm_service
from app.features.litellm.core.schemas import TTSResponse
from app.features.litellm.tts import litellm_tts_provider
from voice_agent.metadata import VoiceJobClaims
from voice_agent.stt_adapter import build_user
from voice_agent.tts_adapter import (
    SAMPLE_RATE,
    LiteLLMTTS,
    SentenceBuffer,
    build_tts_request,
)

FLOW_VERSION_ID = UUID("44444444-4444-4444-4444-444444444444")
FLOW_ID = UUID("33333333-3333-3333-3333-333333333333")
TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")

AGENT_SETTINGS = {
    "agentName": "Support Agent",
    "tts": {
        "provider": "openai",
        "model": "tts-1",
        "credentialName": "caller-tts-key",
        "isByokEnabled": True,
    },
    "ttsVoice": {"language": "en-US", "voice": "alloy", "speed": 1.25},
    "pronunciations": [{"term": "API", "pronunciation": "A P I"}],
}

SENTENCE_SAMPLES = 2400


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


def _wav_bytes(samples: int = SENTENCE_SAMPLES) -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(b"\x00\x00" * samples)
    return buffer.getvalue()


def _response(request) -> TTSResponse:
    return TTSResponse(
        provider=request.provider,
        model=request.model,
        output=base64.b64encode(_wav_bytes()).decode("ascii"),
        status="completed",
    )


def _adapter(synthesize_speech, events=None) -> LiteLLMTTS:
    claims = _claims()
    return LiteLLMTTS(
        request=build_tts_request(claims, AGENT_SETTINGS),
        user=build_user(claims),
        synthesize_speech=synthesize_speech,
        events=events,
    )


# ---------------------------------------------------------------------------
# Request mapping
# ---------------------------------------------------------------------------


def test_tts_request_carries_voice_byok_pronunciations_and_credit_references():
    request = build_tts_request(_claims(), AGENT_SETTINGS)

    assert request.provider == "openai"
    assert request.model == "tts-1"
    assert request.voice_id == "alloy"
    assert request.language == "en-US"
    assert request.speed == 1.25
    assert request.credential_name == "caller-tts-key"
    assert request.is_byok_enabled is True
    assert [(entry.term, entry.pronunciation) for entry in request.pronunciations] == [
        ("API", "A P I")
    ]
    assert request.ref_type == "Agent"
    assert request.ref_id == str(FLOW_ID)
    assert request.ref_name == "Support Agent"
    assert request.action == "AgentExecution"
    assert request.agent_name == "Support Agent"
    assert request.input == ""


# ---------------------------------------------------------------------------
# Sentence buffering
# ---------------------------------------------------------------------------


def test_complete_sentences_flush_in_order_without_empty_entries():
    buffer = SentenceBuffer()

    assert buffer.push("Hello") == []
    assert buffer.push(" there. How") == ["Hello there."]
    assert buffer.push(" are you?  ") == ["How are you?"]
    assert buffer.push("   ") == []
    assert buffer.flush() == []


def test_unpunctuated_text_is_cut_at_the_safe_max_without_reordering_words():
    text = " ".join(["word"] * 200)
    buffer = SentenceBuffer(max_chars=50)

    chunks = buffer.push(text)
    chunks.extend(buffer.flush())

    assert len(chunks) > 1
    assert all(len(chunk) <= 50 for chunk in chunks)
    assert " ".join(chunks) == text


# ---------------------------------------------------------------------------
# Streaming synthesis
# ---------------------------------------------------------------------------


def test_first_sentence_is_synthesized_before_the_rest_of_the_answer():
    requests = []
    first_call = asyncio.Event()

    async def synthesize(request, user):
        requests.append(request)
        first_call.set()
        return _response(request)

    adapter = _adapter(synthesize)

    async def scenario():
        stream = adapter.stream()
        try:
            stream.push_text("Hello there. Second")
            await asyncio.wait_for(first_call.wait(), timeout=2)
            assert [request.input for request in requests] == ["Hello there."]

            stream.push_text(" sentence.")
            stream.end_input()
            events = [event async for event in stream]
        finally:
            await stream.aclose()
        return events

    events = asyncio.run(scenario())

    assert [request.input for request in requests] == ["Hello there.", "Second sentence."]
    assert sum(event.frame.samples_per_channel for event in events) == 2 * SENTENCE_SAMPLES
    assert {event.frame.sample_rate for event in events} == {SAMPLE_RATE}
    assert {event.frame.num_channels for event in events} == {1}

    request = requests[0]
    assert request.voice_id == "alloy"
    assert request.language == "en-US"
    assert request.speed == 1.25
    assert request.credential_name == "caller-tts-key"
    assert request.is_byok_enabled is True
    assert request.ref_id == str(FLOW_ID)
    assert request.ref_name == "Support Agent"


def test_pronunciations_are_forwarded_and_replaced_by_the_provider(monkeypatch):
    captured: dict = {}

    async def _transport(
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
        captured.update({"input": input, "voice": voice, "speed": speed})
        return _wav_bytes()

    monkeypatch.setattr(litellm_service, "synthesize", _transport)
    monkeypatch.setattr(litellm_tts_provider, "resolve_credential_name", lambda name, user: name)

    adapter = LiteLLMTTS(
        request=build_tts_request(_claims(), AGENT_SETTINGS),
        user=build_user(_claims()),
    )

    async def scenario():
        stream = adapter.stream()
        try:
            stream.push_text("Call the API. ")
            stream.end_input()
            return [event async for event in stream]
        finally:
            await stream.aclose()

    events = asyncio.run(scenario())

    assert captured == {"input": "Call the A P I.", "voice": "alloy", "speed": 1.25}
    assert sum(event.frame.samples_per_channel for event in events) == SENTENCE_SAMPLES


class _TimingEvents:
    def __init__(self) -> None:
        self.first_audio_calls = 0

    def tts_first_audio(self) -> None:
        self.first_audio_calls += 1


def test_first_audio_frame_is_reported_once_for_the_turn():
    async def synthesize(request, user):
        return _response(request)

    events = _TimingEvents()
    adapter = _adapter(synthesize, events=events)

    async def scenario():
        stream = adapter.stream()
        try:
            stream.push_text("Hello there. Second sentence. ")
            stream.end_input()
            return [event async for event in stream]
        finally:
            await stream.aclose()

    frames = asyncio.run(scenario())
    assert sum(event.frame.samples_per_channel for event in frames) == 2 * SENTENCE_SAMPLES
    assert events.first_audio_calls == 1


def test_empty_text_never_calls_the_provider_or_emits_audio():
    requests = []

    async def synthesize(request, user):
        requests.append(request)
        return _response(request)

    adapter = _adapter(synthesize)

    async def scenario():
        stream = adapter.stream()
        try:
            stream.push_text("   ")
            stream.end_input()
            return [event async for event in stream]
        finally:
            await stream.aclose()

    assert asyncio.run(scenario()) == []
    assert requests == []


def test_provider_failure_skips_that_sentence_and_keeps_the_turn():
    requests = []

    async def synthesize(request, user):
        requests.append(request.input)
        if request.input == "Fails.":
            raise RuntimeError("provider is down")
        return _response(request)

    timing_events = _TimingEvents()
    adapter = _adapter(synthesize, events=timing_events)

    async def scenario():
        stream = adapter.stream()
        try:
            stream.push_text("Fails. Works. ")
            stream.end_input()
            return [event async for event in stream]
        finally:
            await stream.aclose()

    events = asyncio.run(scenario())

    assert requests == ["Fails.", "Works."]
    assert sum(event.frame.samples_per_channel for event in events) == SENTENCE_SAMPLES
    assert timing_events.first_audio_calls == 1


def test_cancellation_cancels_the_in_flight_synthesis():
    started = asyncio.Event()
    cancelled = asyncio.Event()

    async def synthesize(request, user):
        started.set()
        try:
            await asyncio.Event().wait()
        except asyncio.CancelledError:
            cancelled.set()
            raise

    adapter = _adapter(synthesize)
    assert adapter.capabilities.streaming is True

    async def scenario() -> bool:
        stream = adapter.stream()
        try:
            stream.push_text("Hello there. ")
            await asyncio.wait_for(started.wait(), timeout=2)
        finally:
            await stream.aclose()
        return cancelled.is_set()

    assert asyncio.run(scenario()) is True
