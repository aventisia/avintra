"""Prompt generation service tests: template choice, cleanup, and error mapping.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_prompt_generation_service.py -q
"""

from __future__ import annotations

import asyncio
from uuid import uuid4

import pytest
from fastapi import HTTPException

import app.features.litellm.text_generation.prompts.service as prompt_service
from app.features.auth.authenticated_user import User
from app.features.litellm.core.schemas import (
    LLMGenerationResponse,
    PromptGenerationRequest,
)
from app.features.litellm.text_generation.prompts.service import (
    PromptGenerationService,
    _clean_response,
    _template_file_name,
)

THINK_OPEN = "<think" + ">"
THINK_CLOSE = "</think" + ">"


class _FakeGeneration:
    def __init__(self, output: str = "", error: Exception | None = None) -> None:
        self._output = output
        self._error = error
        self.calls = 0

    async def generate(self, req, user):
        self.calls += 1
        if self._error is not None:
            raise self._error
        return LLMGenerationResponse(
            provider="openai", model="gpt-4o-mini", output=self._output
        )


def _user() -> User:
    return User(
        user_id=uuid4(),
        username="tester",
        roles=[],
        tenant_id=uuid4(),
        access_token="jwt",
    )


def _request(**overrides) -> PromptGenerationRequest:
    values = {
        "refType": "Agent",
        "promptTarget": "ChatAgentSystemPrompt",
        "refId": str(uuid4()),
        "refName": "Test prompt",
        "payload": "",
    }
    values.update(overrides)
    return PromptGenerationRequest(**values)


def _run_generate(fake, monkeypatch, request=None, community=False):
    monkeypatch.setattr(prompt_service, "is_community_deployment", lambda: community)
    monkeypatch.setattr(prompt_service, "generation_service", fake)
    return asyncio.run(
        PromptGenerationService().generate(request or _request(), _user())
    )


def test_template_choice_covers_agent_targets():
    assert (
        _template_file_name("ChatAgentSystemPrompt", "Agent", "")
        == "GenerateChatAgentPromptInstructions.txt"
    )
    assert (
        _template_file_name("chatagentsystemprompt", "Agent", "x")
        == "ImproveChatAgentPromptInstructions.txt"
    )
    assert (
        _template_file_name("VoiceAgentSystemPrompt", "Agent", "")
        == "GenerateVoiceAgentPromptInstructions.txt"
    )
    assert (
        _template_file_name("voiceagentsystemprompt", "Agent", "x")
        == "ImproveVoiceAgentPromptInstructions.txt"
    )


def test_template_choice_falls_back_to_ref_type():
    assert (
        _template_file_name("Template", "Agent", "x")
        == "GenerateAgentTemplateDescriptionPrompt.txt"
    )
    assert (
        _template_file_name("Template", "Platform", "x")
        == "ImprovedPromptInstructions.txt"
    )


def test_unknown_prompt_target_is_rejected_with_its_own_message():
    with pytest.raises(HTTPException) as exc:
        _template_file_name("ChatAgetSystemPrompt", "Agent", "x")
    assert exc.value.status_code == 400
    assert exc.value.detail == prompt_service.UNKNOWN_TARGET_MESSAGE


def test_unknown_ref_type_is_rejected_with_its_own_message():
    with pytest.raises(HTTPException) as exc:
        _template_file_name("Template", "UiBuilder", "x")
    assert exc.value.status_code == 400
    assert exc.value.detail == prompt_service.UNSUPPORTED_REF_TYPE_MESSAGE


def test_clean_response_strips_think_block():
    text = f"{THINK_OPEN}planning{THINK_CLOSE}  Hello"
    assert _clean_response(text) == "Hello"


def test_clean_response_keeps_close_before_open_untouched():
    text = f"CLOSED {THINK_CLOSE} then {THINK_OPEN}open"
    assert _clean_response(text) == text


def test_clean_response_strips_think_block_with_spaced_tag():
    text = "Before<think>planning</think >After"
    assert _clean_response(text) == "BeforeAfter"


def test_clean_response_strips_json_fence_pair():
    assert _clean_response('```json\n{"a": 1}\n```') == '{"a": 1}'


def test_clean_response_strips_plain_fence_pair():
    assert _clean_response("```\nHello\n```") == "Hello"


def test_clean_response_keeps_plain_text():
    assert _clean_response("  Hello  ") == "Hello"


def test_generate_returns_cleaned_prompt(monkeypatch):
    fake = _FakeGeneration(output="```\nHello\n```")
    result = _run_generate(fake, monkeypatch)
    assert result.data == "Hello"
    assert result.message == prompt_service.SUCCESS_MESSAGE
    assert fake.calls == 1


def test_generate_passes_provider_error_through(monkeypatch):
    fake = _FakeGeneration(error=HTTPException(status_code=502, detail="provider down"))
    with pytest.raises(HTTPException) as exc:
        _run_generate(fake, monkeypatch)
    assert exc.value.status_code == 502
    assert exc.value.detail == "provider down"


def test_generate_serializes_dict_answer(monkeypatch):
    fake = _FakeGeneration(output={"prompt": "Hello"})
    result = _run_generate(fake, monkeypatch)
    assert result.data == '{"prompt": "Hello"}'


def test_generate_rejects_non_text_answer(monkeypatch):
    fake = _FakeGeneration(output=42)
    with pytest.raises(HTTPException) as exc:
        _run_generate(fake, monkeypatch)
    assert exc.value.detail == prompt_service.EMPTY_RESPONSE_MESSAGE


def test_generate_remaps_insufficient_credits(monkeypatch):
    fake = _FakeGeneration(
        error=HTTPException(
            status_code=400, detail=prompt_service.INSUFFICIENT_CREDITS_DETAIL
        )
    )
    with pytest.raises(HTTPException) as exc:
        _run_generate(fake, monkeypatch)
    assert exc.value.status_code == 400
    assert exc.value.detail == prompt_service.INSUFFICIENT_CREDITS_MESSAGE


def test_generate_keeps_other_400s_untouched(monkeypatch):
    fake = _FakeGeneration(
        error=HTTPException(status_code=400, detail="Different credit failure")
    )
    with pytest.raises(HTTPException) as exc:
        _run_generate(fake, monkeypatch)
    assert exc.value.detail == "Different credit failure"


def test_generate_wraps_unexpected_error(monkeypatch):
    fake = _FakeGeneration(error=RuntimeError("boom"))
    with pytest.raises(HTTPException) as exc:
        _run_generate(fake, monkeypatch)
    assert exc.value.status_code == 400
    assert exc.value.detail == prompt_service.GENERATION_FAILED_MESSAGE


def test_generate_rejects_empty_answer(monkeypatch):
    fake = _FakeGeneration(output="   ")
    with pytest.raises(HTTPException) as exc:
        _run_generate(fake, monkeypatch)
    assert exc.value.detail == prompt_service.EMPTY_RESPONSE_MESSAGE


def test_generate_rejects_unknown_prompt_target(monkeypatch):
    fake = _FakeGeneration(output="Hello")
    with pytest.raises(HTTPException) as exc:
        _run_generate(
            fake, monkeypatch, request=_request(promptTarget="ChatAgetSystemPrompt")
        )
    assert exc.value.status_code == 400
    assert exc.value.detail == prompt_service.UNKNOWN_TARGET_MESSAGE
    assert fake.calls == 0


def test_generate_blocks_community_deployment(monkeypatch):
    fake = _FakeGeneration(output="Hello")
    with pytest.raises(HTTPException) as exc:
        _run_generate(fake, monkeypatch, community=True)
    assert exc.value.status_code == 403
    assert fake.calls == 0
