"""Streaming STT selection and metering for #373 (S5).

The provider is never called: the factory's credential resolution and the
usage recorder's posting helpers are patched. These cover the model switch,
the batch fallback, the missing-key rejection, and streaming-seconds billing
that must not count the batch path.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_voice_streaming_stt.py -q
"""

from __future__ import annotations

import asyncio

import pytest
from livekit.agents import metrics, stt
from livekit.plugins import elevenlabs

from app.features.litellm.core.credentials import CredentialResolution
from voice_agent import stt_adapter, usage
from voice_agent.contracts import ERROR_CODE_CREDENTIALS_UNAVAILABLE
from voice_agent.metadata import VoiceJobClaims
from voice_agent.stt_adapter import (
    STREAMING_STT_MODEL,
    STTConfigurationError,
    build_stt,
    build_stt_request,
    build_user,
    uses_streaming_stt,
)
from voice_agent.usage import StreamingSTTUsageRecorder
from .voice_test_helpers import FLOW_ID, voice_claims


def _claims() -> VoiceJobClaims:
    return voice_claims(mode="live")


def _settings(model: str = STREAMING_STT_MODEL, **stt_overrides) -> dict:
    stt_settings = {
        "provider": "elevenlabs",
        "model": model,
        "credentialName": "caller-stt-key",
        "isByokEnabled": True,
    }
    stt_settings.update(stt_overrides)
    return {
        "agentName": "Support Agent",
        "stt": stt_settings,
        "ttsVoice": {"language": "en-US"},
    }


def _patch_credentials(monkeypatch, resolved: dict) -> None:
    monkeypatch.setattr(
        stt_adapter,
        "resolve_credentials",
        lambda *args, **_kwargs: CredentialResolution(
            kwargs=resolved,
            uses_platform_credentials=not args[1],
            credential_name=args[2],
        ),
    )


def test_realtime_scribe_model_builds_the_streaming_elevenlabs_adapter(monkeypatch):
    _patch_credentials(
        monkeypatch,
        {"api_key": "eleven-key", "api_base": "https://api.elevenlabs.io/v1"},
    )
    request = build_stt_request(_claims(), _settings())

    assert uses_streaming_stt(request) is True

    adapter = build_stt(
        request=request,
        user=build_user(_claims()),
        vad=object(),
    )

    assert isinstance(adapter, elevenlabs.STT)
    assert adapter.model == STREAMING_STT_MODEL
    # IMPORTANT NOTE: elevenlabs.STT exposes no public accessor for these values.
    options = getattr(adapter, "_opts", None)
    assert options is not None
    assert getattr(options, "api_key", None) == "eleven-key"
    assert getattr(options, "base_url", None) == "https://api.elevenlabs.io/v1"
    assert getattr(options, "language_code", None) == "en-US"


def test_every_other_model_keeps_the_batch_stream_adapter():
    settings = _settings(model="scribe_v2", isByokEnabled=False, credentialName=None)
    request = build_stt_request(_claims(), settings)

    assert uses_streaming_stt(request) is False

    adapter = build_stt(
        request=request,
        user=build_user(_claims()),
        vad=object(),
    )

    assert isinstance(adapter, stt.StreamAdapter)


def test_the_streaming_model_is_only_selected_for_elevenlabs():
    request = build_stt_request(_claims(), _settings()).model_copy(
        update={"provider": "openai"}
    )

    assert uses_streaming_stt(request) is False


@pytest.mark.parametrize(
    "credentials",
    [
        {"api_key": ""},
        {},
    ],
)
def test_a_missing_streaming_key_is_a_credential_configuration_error(
    monkeypatch, credentials
):
    _patch_credentials(monkeypatch, credentials)
    request = build_stt_request(_claims(), _settings())

    with pytest.raises(STTConfigurationError) as raised:
        build_stt(request=request, user=build_user(_claims()), vad=object())

    assert raised.value.code == ERROR_CODE_CREDENTIALS_UNAVAILABLE


def test_a_failed_credential_lookup_is_a_credential_configuration_error(monkeypatch):
    def fail(*_args, **_kwargs):
        raise RuntimeError("vault is down")

    monkeypatch.setattr(stt_adapter, "resolve_credentials", fail)
    request = build_stt_request(_claims(), _settings())

    with pytest.raises(STTConfigurationError) as raised:
        build_stt(request=request, user=build_user(_claims()), vad=object())

    assert raised.value.code == ERROR_CODE_CREDENTIALS_UNAVAILABLE


def _stt_metrics(*, streamed: bool, audio_duration: float) -> metrics.STTMetrics:
    return metrics.STTMetrics(
        label="elevenlabs",
        request_id="request-1",
        timestamp=1.0,
        duration=0.0,
        audio_duration=audio_duration,
        streamed=streamed,
    )


def test_streamed_seconds_are_posted_as_one_platform_credit_entry(monkeypatch):
    posted: list[tuple] = []
    monkeypatch.setattr(
        usage,
        "post_credit_usage",
        lambda *args: posted.append(args),
    )
    settings = _settings(isByokEnabled=False, credentialName=None)
    request = build_stt_request(_claims(), settings)
    recorder = StreamingSTTUsageRecorder(_claims(), request)

    recorder.on_metrics_collected(_stt_metrics(streamed=True, audio_duration=1.5))
    recorder.on_metrics_collected(_stt_metrics(streamed=True, audio_duration=2.25))
    recorder.on_metrics_collected(_stt_metrics(streamed=False, audio_duration=9.0))
    asyncio.run(recorder.flush())
    asyncio.run(recorder.flush())

    [call] = posted
    assert call[0] is request
    assert call[1] == "elevenlabs"
    assert call[2] == "service"
    assert call[3] == 3.75
    assert call[4] == "worker-token"
    assert call[5] == "space-1"


def test_byok_streamed_seconds_post_one_usage_entry(monkeypatch):
    posted: list[tuple] = []
    monkeypatch.setattr(
        usage,
        "post_byok_usage",
        lambda provider, entries, token: posted.append((provider, entries, token)),
    )
    request = build_stt_request(_claims(), _settings())
    recorder = StreamingSTTUsageRecorder(_claims(), request)

    recorder.on_metrics_collected(_stt_metrics(streamed=True, audio_duration=4.0))
    asyncio.run(recorder.flush())

    [call] = posted
    provider, entries, token = call
    assert provider == "elevenlabs"
    assert token == "worker-token"
    [entry] = entries
    assert entry["ServiceType"] == "ElevenLabsScribeV2Realtime"
    assert entry["ConsumedUnit"] == 4.0
    assert entry["UnitType"] == "Seconds"
    assert entry["CredentialName"] == "caller-stt-key"
    assert entry["RefId"] == str(FLOW_ID)


def test_a_posting_failure_does_not_escape_the_flush(monkeypatch):
    def fail(*_args, **_kwargs):
        raise RuntimeError("billing is down")

    monkeypatch.setattr(usage, "post_credit_usage", fail)
    settings = _settings(isByokEnabled=False, credentialName=None)
    recorder = StreamingSTTUsageRecorder(
        _claims(), build_stt_request(_claims(), settings)
    )

    recorder.on_metrics_collected(_stt_metrics(streamed=True, audio_duration=1.0))
    asyncio.run(recorder.flush())
