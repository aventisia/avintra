"""Meter one voice call's provider usage and its response latency.

Realtime providers report ``RealtimeModelMetrics`` per response: audio tokens
are accumulated for BYOK consumption and the last response's time-to-first-token
and duration are kept for the assistant message they belong to. A streaming
speech-to-text provider reports ``STTMetrics`` with the audio seconds it billed;
the batch STT posts its own usage inside the LiteLLM provider.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Any

from livekit.agents import metrics

from app.core.byok_usage_manager import ByokUsageManager
from app.core.logger import logger
from app.features.litellm.core.credit_utils import (
    build_byok_entry,
    post_byok_usage,
    post_credit_usage,
    should_record_byok,
)
from app.features.litellm.core.provider_registry import (
    get_credit_service_type,
    should_post_usage,
)
from app.features.litellm.core.schemas import STTRequest

from .events import milliseconds
from .metadata import VoiceJobClaims
from .realtime_adapters import normalize_realtime_provider


@dataclass
class _PendingUsage:
    input_audio_tokens: int = 0
    output_audio_tokens: int = 0
    session_seconds: float = 0.0


class RealtimeUsageRecorder:
    """Accumulate realtime provider usage and post it without breaking the call."""

    def __init__(self, claims: VoiceJobClaims, agent_settings: dict) -> None:
        realtime = agent_settings.get("realtime") or {}
        self._claims = claims
        self._agent_name = str(agent_settings.get("agentName") or "")
        self._provider = normalize_realtime_provider(realtime.get("provider"))
        self._model = str(realtime.get("model") or "")
        self._credential_name = realtime.get("credentialName") or None
        self._is_byok = bool(realtime.get("isByokEnabled"))
        self._pending = _PendingUsage()
        self._response_timing: dict[str, int] | None = None

    def on_metrics_collected(self, event: Any) -> None:
        collected = getattr(event, "metrics", event)
        if not isinstance(collected, metrics.RealtimeModelMetrics):
            return

        self._pending.input_audio_tokens += max(
            collected.input_token_details.audio_tokens, 0
        )
        self._pending.output_audio_tokens += max(
            collected.output_token_details.audio_tokens, 0
        )
        # IMPORTANT NOTE: session_duration is reported per response for
        # session-billed providers, so it accumulates like the usage collector.
        self._pending.session_seconds += max(collected.session_duration, 0.0)

        if collected.ttft >= 0 and collected.duration > 0:
            self._response_timing = {
                "ttft_ms": milliseconds(collected.ttft),
                "duration_ms": milliseconds(collected.duration),
            }

    def take_response_timing(self) -> dict[str, int] | None:
        """Return the latency of the response that just finished, once."""

        timing = self._response_timing
        self._response_timing = None
        return timing

    async def flush(self) -> None:
        """Post everything consumed since the last flush; never raise."""

        entries = self._take_entries()
        if not entries:
            return

        try:
            await asyncio.to_thread(
                ByokUsageManager().post_byok_usage,
                task=self._provider,
                request=entries,
                jwt=self._claims.worker_token,
            )
        except Exception:
            logger.exception(
                "[voice-agent] BYOK usage post failed conversation=%s",
                self._claims.conversation_id,
            )

    def _take_entries(self) -> list[dict]:
        if not should_record_byok(self._is_byok, self._credential_name):
            return []

        usage = self._pending
        self._pending = _PendingUsage()

        entries: list[dict] = []
        audio_tokens = usage.input_audio_tokens + usage.output_audio_tokens
        if audio_tokens:
            entries.append(self._entry(audio_tokens, "Tokens"))
        if usage.session_seconds:
            entries.append(self._entry(round(usage.session_seconds, 2), "Seconds"))
        return entries

    def _entry(self, consumed_units: float, unit_type: str) -> dict:
        # IMPORTANT NOTE: no realtime credit service exists yet, so BYOK rows use
        # AgentExecutionTime with the provider unit; add a realtime service type
        # when platform realtime rates are defined.
        return build_byok_entry(
            "AgentExecutionTime",
            self._provider,
            self._model,
            consumed_units,
            unit_type,
            self._credential_name,
            "Agent",
            str(self._claims.flow_id),
            self._agent_name,
            "AgentExecution",
            self._agent_name or None,
            self._claims.space_id or None,
        )


class StreamingSTTUsageRecorder:
    """Post the audio seconds a streaming STT provider billed for one call.

    Only ``streamed`` metrics are counted: the batch path is metered by the
    LiteLLM STT provider that actually ran the transcription.
    """

    def __init__(self, claims: VoiceJobClaims, request: STTRequest) -> None:
        self._claims = claims
        self._request = request
        self._audio_seconds = 0.0

    def on_metrics_collected(self, event: Any) -> None:
        collected = getattr(event, "metrics", event)
        if not isinstance(collected, metrics.STTMetrics) or not collected.streamed:
            return
        self._audio_seconds += max(collected.audio_duration, 0.0)

    async def flush(self) -> None:
        """Post everything billed since the last flush; never raise."""

        seconds = round(self._audio_seconds, 2)
        self._audio_seconds = 0.0
        if seconds <= 0:
            return

        try:
            await asyncio.to_thread(self._post, seconds)
        except Exception:
            logger.exception(
                "[voice-agent] streaming speech-to-text usage post failed conversation=%s",
                self._claims.conversation_id,
            )

    def _post(self, seconds: float) -> None:
        request = self._request
        space_id = self._claims.space_id or None

        if should_post_usage(request.is_byok_enabled, request.credential_name):
            post_credit_usage(
                request,
                request.provider,
                "service",
                seconds,
                self._claims.worker_token,
                space_id,
            )
            return

        if not should_record_byok(request.is_byok_enabled, request.credential_name):
            return

        service = get_credit_service_type(request.provider, request.model, "service")
        if not service:
            raise ValueError(f"Unsupported model for credit usage: {request.model}")

        entry = build_byok_entry(
            service,
            request.provider,
            request.model,
            seconds,
            "Seconds",
            request.credential_name,
            request.ref_type,
            request.ref_id,
            request.ref_name,
            request.action,
            request.agent_name,
            space_id,
        )
        post_byok_usage(request.provider, [entry], self._claims.worker_token)
