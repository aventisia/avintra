# Chat/completion orchestration for the LLM Providers v2 feature.
from __future__ import annotations

import os
import time

from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.core.credit_manager import CreditManagerService
from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User
from app.utils.file_converter_utils import file_to_base64

from .kb_integration import augment_with_kb_context
from .litellm_service import litellm_service
from .provider_registry import (
    get_credit_service_type,
    should_post_usage,
    validate_model,
    validate_provider,
)
from .schemas import LLMGenerationChunk, LLMGenerationRequest, LLMGenerationResponse
from .streaming_job_manager import v2_job_manager


def _file_input_filename(file_input: str, default: str = "file") -> str:
    """Extract a readable filename from a URL / path / base64 data URI."""
    if file_input.startswith("data:"):
        return default
    return os.path.basename(file_input.split("?")[0]) or default


def _attach_files(messages: list[dict], files: list[str]) -> list[dict]:
    """Attach file attachments to a user message as vision/file content blocks.

    Mirrors the legacy OpenAI provider: images become `image_url` blocks; all
    other files become `input_file` blocks. Invalid files are skipped.
    """
    # Find the first user message to host the attachments.
    target_index = 0
    for idx, msg in enumerate(messages):
        if msg.get("role") == "user":
            target_index = idx
            break
    else:
        # No user message: create one so files have a place to attach.
        messages.append({"role": "user", "content": []})
        target_index = len(messages) - 1

    # Normalize the target content to a list of blocks.
    content = messages[target_index].get("content")
    if isinstance(content, str):
        messages[target_index]["content"] = [{"type": "text", "text": content}]
    elif not isinstance(content, list):
        messages[target_index]["content"] = []

    for file_data in files:
        base64_uri = file_to_base64(file_data)
        if not base64_uri:
            continue  # skip invalid files

        if base64_uri.startswith("data:image/"):
            messages[target_index]["content"].append(
                {"type": "image_url", "image_url": {"url": base64_uri}}
            )
        else:
            messages[target_index]["content"].append(
                {
                    "type": "input_file",
                    "filename": _file_input_filename(file_data, default="file"),
                    "file_data": base64_uri,
                }
            )

    return messages


def _messages_from_request(req: LLMGenerationRequest) -> list[dict]:
    if isinstance(req.input, str):
        messages = [{"role": "user", "content": req.input}]
    else:
        messages = [{"role": m.role, "content": m.content} for m in req.input]

    if req.files:
        messages = _attach_files(messages, req.files)
    return messages


def _build_response_format(req: LLMGenerationRequest) -> dict | None:
    if req.is_json_output:
        if req.json_schema:
            schema = req.json_schema
            if isinstance(schema, str):
                import json

                try:
                    schema = json.loads(schema)
                except Exception:
                    schema = {"type": "json_object"}
            return {"type": "json_schema", "json_schema": {"name": "response", "schema": schema}}
        return {"type": "json_object"}
    return None


def _check_credits(req: LLMGenerationRequest, user: User) -> None:
    if req.is_byok_enabled and req.credential_id:
        return
    credit_mgr = CreditManagerService()
    if not credit_mgr.has_sufficient_credits(req.provider, user.access_token):
        raise HTTPException(status_code=400, detail="Insufficient credits.")


def _post_credit_usage(req: LLMGenerationRequest, resp: LLMGenerationResponse, user: User) -> None:
    # Only post usage for platform (non-BYOK) requests.
    if not should_post_usage(req.is_byok_enabled, req.credential_id):
        return
    try:
        credit_mgr = CreditManagerService()
        payload = []
        if (resp.input_tokens or 0) > 0:
            service = get_credit_service_type(req.provider, req.model, "input")
            if service:
                payload.append(_entry(req, service, resp.input_tokens))
        if (resp.output_tokens or 0) > 0:
            service = get_credit_service_type(req.provider, req.model, "output")
            if service:
                payload.append(_entry(req, service, resp.output_tokens))
        if payload:
            credit_mgr.post_credit_usage(req.provider, payload, user.access_token)
    except Exception as e:
        logger.warning(f"[LLM-V2] Failed to post credit usage: {e}")


def _entry(req: LLMGenerationRequest, service_type: str, units: int) -> dict:
    return {
        "ServiceType": service_type,
        "ConsumedUnit": max(units, 0),
        "RefType": req.ref_type,
        "RefId": req.ref_id,
        "RefName": req.ref_name,
        "Action": req.action or "AgentExecution",
        "TriggeredByAgent": req.agent_name,
    }


class GenerationService:
    def __init__(self) -> None:
        self._litellm = litellm_service

    async def generate(self, req: LLMGenerationRequest, user: User) -> LLMGenerationResponse:
        validate_provider(req.provider, req.is_byok_enabled, req.credential_id)
        validate_model(req.provider, req.model, req.is_byok_enabled, req.credential_id)
        # _check_credits(req, user)
        await augment_with_kb_context(req, user)

        messages = _messages_from_request(req)
        response_format = _build_response_format(req)
        start = time.perf_counter()
        try:
            result = await self._litellm.chat_completion(
                req,
                messages=messages,
                response_format=response_format,
                user=user,
            )
        except HTTPException:
            raise
        except Exception as e:
            log_exception(logger, e, f"[LLM-V2] generation error: ")
            raise HTTPException(status_code=502, detail=str(e))

        output = self._extract_output(result)
        usage = getattr(result, "usage", None) or {}
        response = LLMGenerationResponse(
            provider=req.provider,
            model=req.model,
            output=output,
            status="completed",
            finish_reason=self._extract_finish_reason(result),
            max_output_tokens=req.max_output_tokens,
            temperature=req.temperature or 1.0,
            top_p=req.top_p or 1.0,
            stream=False,
            time_taken=round(time.perf_counter() - start, 2),
            input_tokens=usage.get("prompt_tokens", 0),
            output_tokens=usage.get("completion_tokens", 0),
            is_json_output=req.is_json_output,
            is_byok_enabled=req.is_byok_enabled,
            credential_id=req.credential_id,
            conversation_id=req.conversation_id,
            is_temp_chat=req.is_temp_chat,
        )
        _post_credit_usage(req, response, user)
        return response

    async def start_streaming(self, req: LLMGenerationRequest, user: User):
        """Register a streaming job and return (job_id, async_stream_generator).

        The stream generator yields `LLMGenerationChunk` model_dump_json strings,
        one per non-empty content delta, stopping early if the job is cancelled.
        """
        validate_provider(req.provider, req.is_byok_enabled, req.credential_id)
        validate_model(req.provider, req.model, req.is_byok_enabled, req.credential_id)
        # _check_credits(req, user)
        await augment_with_kb_context(req, user)

        messages = _messages_from_request(req)
        response_format = _build_response_format(req)

        async def event_stream():
            try:
                # chat_completion is an async method: await it to obtain the
                # stream's async generator before iterating.
                stream = await self._litellm.chat_completion(
                    req,
                    messages=messages,
                    response_format=response_format,
                    user=user,
                )
                async for chunk in stream:
                    delta = getattr(chunk, "choices", None)
                    text = ""
                    if delta and delta[0].delta:
                        text = delta[0].delta.content or ""
                    if text:
                        chunk_dto = LLMGenerationChunk(
                            provider=req.provider,
                            model=req.model,
                            output=text,
                            conversation_id=req.conversation_id,
                        )
                        yield chunk_dto.model_dump_json()
            except Exception as e:
                log_exception(logger, e, "[LLM-V2] stream error: ")
            finally:
                v2_job_manager.cleanup(job_id)

        job_id = v2_job_manager.register(event_stream)
        return job_id, event_stream()

    @staticmethod
    def _extract_output(result) -> str | dict | list:
        choices = getattr(result, "choices", None)
        if choices and getattr(choices[0], "message", None):
            content = choices[0].message.content
            if content is not None:
                return content
            # Structured / tool outputs may live in tool_calls
            tool_calls = getattr(choices[0].message, "tool_calls", None)
            if tool_calls:
                return [{"id": tc.id, "function": getattr(tc.function, "arguments", None)} for tc in tool_calls]
        return ""

    @staticmethod
    def _extract_finish_reason(result) -> str | None:
        choices = getattr(result, "choices", None)
        if choices and getattr(choices[0], "finish_reason", None):
            return choices[0].finish_reason
        return None


generation_service = GenerationService()
