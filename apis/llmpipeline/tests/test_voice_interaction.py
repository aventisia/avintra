"""Voice Agent interaction tests for #385.

The tests cover the two pure runtime seams added for Voice Agent interaction
features: pronunciation alias substitution before text-to-speech synthesis, and
transcript webhook composition/delivery failure handling. No network, provider
credentials, or live endpoints are used.

Run from ``apis/llmpipeline``:

    ./.venv/Scripts/python.exe -m pytest tests/test_voice_interaction.py -q
"""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

import httpx

from app.features.langgraph.services.transcript_webhook_service import (
    compose_transcript_payload,
    deliver_transcript_webhook,
    is_absolute_http_url,
)
from app.features.litellm.core.schemas import PronunciationEntry
from app.features.litellm.tts.litellm_tts_provider import apply_pronunciations


def _entry(term: str, pronunciation: str) -> PronunciationEntry:
    return PronunciationEntry(term=term, pronunciation=pronunciation)


def test_apply_pronunciations_empty_is_noop():
    assert apply_pronunciations("Hello there", []) == "Hello there"
    assert apply_pronunciations("Hello there", None) == "Hello there"


def test_apply_pronunciations_is_case_insensitive():
    result = apply_pronunciations(
        "Visit the api docs and the API reference",
        [_entry("api", "A P I")],
    )
    assert result == "Visit the A P I docs and the A P I reference"


def test_apply_pronunciations_applies_longest_term_first():
    result = apply_pronunciations(
        "The API gateway handles it",
        [_entry("API", "A P I"), _entry("API gateway", "A P I gateway")],
    )
    assert result == "The A P I gateway handles it"


def test_is_absolute_http_url_guards_scheme_and_host():
    assert is_absolute_http_url("https://example.com/hook") is True
    assert is_absolute_http_url("http://example.com/hook") is True
    assert is_absolute_http_url("/relative/path") is False
    assert is_absolute_http_url("ftp://example.com") is False
    assert is_absolute_http_url("") is False


def test_compose_transcript_payload_includes_transcript_and_agent():
    conversation = SimpleNamespace(
        id="11111111-1111-1111-1111-111111111111",
        flow_version_id="22222222-2222-2222-2222-222222222222",
    )
    messages = [
        SimpleNamespace(role="user", content="Hi"),
        SimpleNamespace(role="assistant", content="Hello"),
    ]

    payload = compose_transcript_payload(conversation, messages)

    assert payload["conversation_id"] == "11111111-1111-1111-1111-111111111111"
    assert payload["message_count"] == 2
    assert payload["is_temp_chat"] is False
    assert payload["agent"]["ref_type"] == "Agent"
    assert payload["agent"]["ref_id"] == "22222222-2222-2222-2222-222222222222"
    assert payload["transcript"] == [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello"},
    ]
    assert "ended_at" in payload


class _RaisingClient:
    def __init__(self, exc: Exception):
        self._exc = exc

    async def post(self, url, json=None):
        raise self._exc


class _StatusClient:
    def __init__(self, status_code: int):
        self._status_code = status_code

    async def post(self, url, json=None):
        return httpx.Response(self._status_code)


def test_deliver_transcript_webhook_returns_true_on_success():
    delivered = asyncio.run(
        deliver_transcript_webhook(
            "https://example.com/hook",
            {"conversation_id": "x"},
            client=_StatusClient(200),
        )
    )
    assert delivered is True


def test_deliver_transcript_webhook_warns_and_continues_on_transport_error():
    delivered = asyncio.run(
        deliver_transcript_webhook(
            "https://example.com/hook",
            {"conversation_id": "x"},
            client=_RaisingClient(httpx.ConnectError("unreachable")),
        )
    )
    assert delivered is False


def test_deliver_transcript_webhook_warns_and_continues_on_timeout():
    delivered = asyncio.run(
        deliver_transcript_webhook(
            "https://example.com/hook",
            {"conversation_id": "x"},
            client=_RaisingClient(httpx.TimeoutException("timed out")),
        )
    )
    assert delivered is False


def test_deliver_transcript_webhook_returns_false_on_non_success_status():
    delivered = asyncio.run(
        deliver_transcript_webhook(
            "https://example.com/hook",
            {"conversation_id": "x"},
            client=_StatusClient(500),
        )
    )
    assert delivered is False
