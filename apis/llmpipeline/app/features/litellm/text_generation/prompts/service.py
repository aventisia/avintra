from __future__ import annotations

import json
from pathlib import Path

from fastapi import HTTPException

from app.core.config import is_community_deployment
from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User
from app.features.litellm.core.schemas import (
    LLMGenerationRequest,
    PromptGenerationRequest,
    PromptGenerationResponse,
)
from app.features.litellm.text_generation.generation_service import generation_service

PROVIDER = "openai"
MODEL = "gpt-4o-mini"
CREDIT_ACTION = "TemplateDescriptionGeneration"

PAYLOAD_PLACEHOLDER = "{{PAYLOAD_CONTENT}}"
TEMPLATE_DIR = Path(__file__).parent

CHAT_AGENT_TARGET = "ChatAgentSystemPrompt"
VOICE_AGENT_TARGET = "VoiceAgentSystemPrompt"
TEMPLATE_TARGET = "Template"

TEMPLATE_BY_REF_TYPE = {
    "agent": "GenerateAgentTemplateDescriptionPrompt.txt",
    "platform": "ImprovedPromptInstructions.txt",
}

COMMUNITY_DENIED_MESSAGE = "Prompt generation is not available in the Community edition."
INSUFFICIENT_CREDITS_MESSAGE = "Unable to generate documentation due to insufficient credits."
TEMPLATE_UNAVAILABLE_MESSAGE = "Failed to read prompt template. Please contact support."
UNKNOWN_TARGET_MESSAGE = "Unsupported prompt target."
UNSUPPORTED_REF_TYPE_MESSAGE = "Unsupported reference type for the Template prompt target."
EMPTY_RESPONSE_MESSAGE = "LLM response was empty. Please try again later."
GENERATION_FAILED_MESSAGE = "Failed to generate documentation. Please try again later."
SUCCESS_MESSAGE = "Documentation and instructions generated successfully."

# IMPORTANT NOTE: matches the detail raised by credit_utils.check_sufficient_credits;
# change both together.
INSUFFICIENT_CREDITS_DETAIL = "Insufficient credits."


def _template_file_name(prompt_target: str, ref_type: str, payload: str) -> str:
    target = prompt_target.strip().lower()
    is_improve = bool(payload.strip())
    if target == CHAT_AGENT_TARGET.lower():
        return (
            "ImproveChatAgentPromptInstructions.txt"
            if is_improve
            else "GenerateChatAgentPromptInstructions.txt"
        )
    if target == VOICE_AGENT_TARGET.lower():
        return (
            "ImproveVoiceAgentPromptInstructions.txt"
            if is_improve
            else "GenerateVoiceAgentPromptInstructions.txt"
        )
    if target != TEMPLATE_TARGET.lower():
        raise HTTPException(status_code=400, detail=UNKNOWN_TARGET_MESSAGE)
    template_name = TEMPLATE_BY_REF_TYPE.get(ref_type.strip().lower())
    if not template_name:
        raise HTTPException(status_code=400, detail=UNSUPPORTED_REF_TYPE_MESSAGE)
    return template_name


def _strip_think_block(text: str) -> str:
    opening = text.find("<think")
    closing = text.find("</think")
    if opening == -1 or closing == -1 or closing < opening:
        return text
    end = text.find(">", closing)
    if end == -1:
        return text
    return text[:opening] + text[end + 1 :]


def _strip_code_fences(text: str) -> str:
    json_fence = text.find("```json")
    if json_fence != -1:
        text = text[:json_fence] + text[json_fence + 7 :]
    else:
        fence = text.find("```")
        if fence != -1:
            text = text[:fence] + text[fence + 3 :]
    fence = text.find("```")
    if fence != -1:
        text = text[:fence] + text[fence + 3 :]
    return text


def _clean_response(text: str) -> str:
    return _strip_code_fences(_strip_think_block(text)).strip()


def _output_text(output: object) -> str:
    if isinstance(output, str):
        return output
    if isinstance(output, (dict, list)):
        return json.dumps(output)
    return ""


class PromptGenerationService:
    async def generate(
        self, req: PromptGenerationRequest, user: User
    ) -> PromptGenerationResponse:
        if is_community_deployment():
            raise HTTPException(status_code=403, detail=COMMUNITY_DENIED_MESSAGE)

        prompt = self._build_prompt(req)

        try:
            generation = await generation_service.generate(
                self._generation_request(req, prompt), user
            )
        except HTTPException as error:
            detail = str(error.detail).strip()
            if error.status_code != 400 or detail != INSUFFICIENT_CREDITS_DETAIL:
                raise
            raise HTTPException(
                status_code=400, detail=INSUFFICIENT_CREDITS_MESSAGE
            ) from error
        except Exception as error:
            log_exception(logger, error, "[prompts] Prompt generation failed: ")
            raise HTTPException(
                status_code=400, detail=GENERATION_FAILED_MESSAGE
            ) from error

        prompt_text = _clean_response(_output_text(generation.output))
        if not prompt_text:
            raise HTTPException(status_code=400, detail=EMPTY_RESPONSE_MESSAGE)

        return PromptGenerationResponse(data=prompt_text, message=SUCCESS_MESSAGE)

    @staticmethod
    def _build_prompt(req: PromptGenerationRequest) -> str:
        template_name = _template_file_name(req.prompt_target, req.ref_type, req.payload)
        try:
            template = (TEMPLATE_DIR / template_name).read_text(encoding="utf-8")
        except OSError as error:
            raise HTTPException(
                status_code=400, detail=TEMPLATE_UNAVAILABLE_MESSAGE
            ) from error
        return template.replace(PAYLOAD_PLACEHOLDER, req.payload)

    @staticmethod
    def _generation_request(
        req: PromptGenerationRequest, prompt: str
    ) -> LLMGenerationRequest:
        return LLMGenerationRequest(
            provider=PROVIDER,
            model=MODEL,
            input=prompt,
            ref_type=req.ref_type,
            ref_id=req.ref_id,
            ref_name=req.ref_name,
            action=CREDIT_ACTION,
        )


prompt_generation_service = PromptGenerationService()
