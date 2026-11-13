# Chat/completion orchestration for the LLM Providers v2 feature.
from __future__ import annotations

import time

from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.core.logger import log_exception, logger
from app.features.auth.authenticated_user import User
from app.utils.errors import friendly_error
from app.utils.file_converter_utils import (
    data_uri_mime,
    file_input_filename,
    file_to_base64,
)

from .kb_integration import augment_with_kb_context
from ..core.credit_utils import (
    agent_has_fixed_credits,
    build_byok_entry,
    build_credit_entry,
    check_sufficient_credits,
    post_byok_usage,
    post_platform_credit_usage,
    should_record_byok,
)
from ..core.litellm_service import litellm_service
from ..core.provider_registry import (
    get_credit_service_type,
    normalize_provider,
    should_post_usage,
    validate_model,
    validate_provider,
)
from ..core.schemas import LLMGenerationChunk, LLMGenerationRequest, LLMGenerationResponse
from ..core.streaming_job_manager import v2_job_manager


def _attach_files(messages: list[dict], files: list[str]) -> list[dict]:
    """Attach file attachments to a user message as vision/file content blocks.

    Images become `image_url` blocks; all other files become `file` blocks in
    the shape LiteLLM's chat-completions providers expect
    (`{"type": "file", "file": {"file_data", "filename", "format"}}`). Invalid
    files raise a clear 400 naming the offending entry so the caller can fix
    their request.
    """
    # Attachments belong on a user-role message only. Target the most recent
    # user message so files never land on system/assistant/other roles or on an
    # older user message.
    target_index = -1
    for idx, msg in enumerate(messages):
        if msg.get("role") == "user":
            target_index = idx

    if target_index == -1:
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
        try:
            base64_uri = file_to_base64(file_data)
        except HTTPException as exc:
            # Surface which file failed so the caller can correct it.
            raise HTTPException(
                status_code=exc.status_code,
                detail=f"Invalid file '{file_data}': {exc.detail}",
            ) from exc

        if not base64_uri:
            # Defensive: file_to_base64 always returns a data URI or raises, but
            # if it ever returns a falsy value treat it as an invalid entry.
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file '{file_data}': file could not be read.",
            )

        if base64_uri.startswith("data:image/"):
            messages[target_index]["content"].append(
                {"type": "image_url", "image_url": {"url": base64_uri}}
            )
        else:
            # LiteLLM chat-completions `file` content block. `format` carries
            # the MIME type so providers (e.g. Gemini) can classify the file.
            messages[target_index]["content"].append(
                {
                    "type": "file",
                    "file": {
                        "file_data": base64_uri,
                        "filename": file_input_filename(file_data, default="file"),
                        "format": data_uri_mime(base64_uri),
                    },
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

    # OpenAI requires the word "json" to appear in the messages when using
    # `response_format` of type `json_object` (i.e. JSON output without a
    # schema). If the caller did not already ask for JSON, add a system
    # instruction so the request is not rejected by the provider. Merge into an
    # existing system message to avoid duplicate system messages.
    if req.is_json_output and not req.json_schema and not _messages_mention_json(messages):
        _ensure_json_instruction(messages)

    return messages


def _ensure_json_instruction(messages: list[dict]) -> None:
    """Add a JSON-output instruction to the messages in place.

    Appends to the first system message if one exists, otherwise prepends a new
    system message. Keeps a single system message so providers that reject
    multiple system messages are not tripped up.
    """
    instruction = "Return your response in valid JSON format."
    for msg in messages:
        if msg.get("role") == "system":
            content = msg.get("content")
            if isinstance(content, str):
                msg["content"] = f"{content}\n{instruction}"
            elif isinstance(content, list):
                content.append({"type": "text", "text": instruction})
            else:
                msg["content"] = instruction
            return
    messages.insert(0, {"role": "system", "content": instruction})


def _messages_mention_json(messages: list[dict]) -> bool:
    """True if any message content already contains the word 'json'."""
    for msg in messages:
        content = msg.get("content")
        if isinstance(content, str) and "json" in content.lower():
            return True
        if isinstance(content, list):
            for block in content:
                if isinstance(block, dict) and "json" in str(block.get("text", "")).lower():
                    return True
    return False


def _build_response_format(req: LLMGenerationRequest) -> dict | None:
    if req.is_json_output:
        if req.json_schema:
            schema = req.json_schema
            if isinstance(schema, str):
                import json

                try:
                    schema = json.loads(schema)
                except Exception:
                    raise HTTPException(
                        status_code=400,
                        detail="The provided json_schema is not valid JSON.",
                    )
            return {"type": "json_schema", "json_schema": {"name": "response", "schema": schema}}
        return {"type": "json_object"}
    return None


def _map_finish_reason_to_status(finish_reason: str | None) -> str:
    """Map a provider finish reason to a user-facing response status.

    Finish reasons are OpenAI/LiteLLM stream terminators. We translate them into
    the statuses the `LLMGenerationResponse` contract exposes:

      - 'stop'            -> completed   (natural end of generation)
      - 'tool_calls' / 'function_call' -> completed (provider returned tool calls)
      - 'length'          -> incomplete (output was truncated by max-token limit)
      - 'content_filter'  -> failed     (output was blocked by the content filter)
      - None / any other  -> completed  (treated as a successful response)
    """
    if finish_reason == "length":
        return "incomplete"
    if finish_reason == "content_filter":
        return "failed"
    return "completed"


def _post_credit_usage(req: LLMGenerationRequest, resp: LLMGenerationResponse, user: User) -> None:
    # Only post usage for platform (non-BYOK) requests.
    if not should_post_usage(req.is_byok_enabled, req.credential_name):
        return
    # Skip token-based deduction when the agent has a fixed-credits override set
    # by the Super Admin (the WorkspaceAPIs job-close path already bills the fixed
    # amount, so posting token usage here would double-charge).
    if agent_has_fixed_credits(req.ref_id, user.access_token):
        logger.debug(f"[LLM-V2] Skipping platform credit usage for agent {req.ref_id} (fixed credits).")
        return
    try:
        entries = []
        if (resp.input_tokens or 0) > 0:
            service = get_credit_service_type(req.provider, req.model, "input")
            if service:
                entries.append(build_credit_entry(service, resp.input_tokens, req.ref_type, req.ref_id, req.ref_name, req.action, triggered_by_agent=req.ref_name, space_id=user.space_id))
        if (resp.output_tokens or 0) > 0:
            service = get_credit_service_type(req.provider, req.model, "output")
            if service:
                entries.append(build_credit_entry(service, resp.output_tokens, req.ref_type, req.ref_id, req.ref_name, req.action, triggered_by_agent=req.ref_name, space_id=user.space_id))
        post_platform_credit_usage(req.provider, entries, user.access_token)
    except Exception as e:
        logger.warning(f"[LLM-V2] Failed to post credit usage: {e}")


def _post_byok_usage(req: LLMGenerationRequest, resp: LLMGenerationResponse, user: User) -> None:
    # Only post usage for BYOK requests (caller's own key).
    if not should_record_byok(req.is_byok_enabled, req.credential_name):
        return
    try:
        entries = []
        if (resp.input_tokens or 0) > 0:
            service = get_credit_service_type(req.provider, req.model, "input")
            if service:
                entries.append(build_byok_entry(
                    service, req.provider, req.model, resp.input_tokens, "Tokens",
                    req.credential_name,
                    req.ref_type, req.ref_id, req.ref_name, req.action, triggered_by_agent=req.ref_name, space_id=user.space_id,
                ))
        if (resp.output_tokens or 0) > 0:
            service = get_credit_service_type(req.provider, req.model, "output")
            if service:
                entries.append(build_byok_entry(
                    service, req.provider, req.model, resp.output_tokens, "Tokens",
                    req.credential_name,
                    req.ref_type, req.ref_id, req.ref_name, req.action, triggered_by_agent=req.ref_name, space_id=user.space_id,
                ))
        post_byok_usage(req.provider, entries, user.access_token)
    except Exception as e:
        logger.warning(f"[LLM-V2] Failed to post BYOK usage: {e}")


class GenerationService:
    def __init__(self) -> None:
        self._litellm = litellm_service

    async def generate(self, req: LLMGenerationRequest, user: User) -> LLMGenerationResponse:
        # Normalize legacy provider aliases (e.g. "googlegemini" -> "gemini")
        # so the v2 route accepts the same names the legacy provider used.
        req.provider = normalize_provider(req.provider)
        validate_provider(req.provider, req.is_byok_enabled, req.credential_name)
        validate_model(req.provider, req.model, req.is_byok_enabled, req.credential_name)
        check_sufficient_credits(req.is_byok_enabled, req.credential_name, req.provider, user.access_token)
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
            raise HTTPException(
                status_code=502,
                detail=(
                    f"The request could not be processed by provider "
                    f"'{req.provider}' for model '{req.model}'. {friendly_error(e)}"
                ),
            )

        output = self._extract_output(result)
        usage = getattr(result, "usage", None) or {}
        finish_reason = self._extract_finish_reason(result)
        response = LLMGenerationResponse(
            provider=req.provider,
            model=req.model,
            output=output,
            status=_map_finish_reason_to_status(finish_reason),
            finish_reason=finish_reason,
            max_output_tokens=req.max_output_tokens,
            temperature=req.temperature or 1.0,
            top_p=req.top_p or 1.0,
            stream=False,
            time_taken=round(time.perf_counter() - start, 2),
            input_tokens=usage.get("prompt_tokens", 0),
            output_tokens=usage.get("completion_tokens", 0),
            is_json_output=req.is_json_output,
            is_byok_enabled=req.is_byok_enabled,
            credential_name=req.credential_name,
            conversation_id=req.conversation_id,
            is_temp_chat=req.is_temp_chat,
        )
        _post_credit_usage(req, response, user)
        _post_byok_usage(req, response, user)
        return response

    async def start_streaming(self, req: LLMGenerationRequest, user: User):
        """Register a streaming job and return (job_id, async_stream_generator).

        The stream generator yields `LLMGenerationChunk` model_dump_json strings,
        one per non-empty content delta, stopping early if the job is cancelled.
        When the stream finishes, a final `LLMGenerationResponse` is emitted and
        credit usage is posted (only for platform, non-BYOK requests).
        """
        # Normalize legacy provider aliases (e.g. "googlegemini" -> "gemini")
        # so the v2 route accepts the same names the legacy provider used.
        req.provider = normalize_provider(req.provider)
        validate_provider(req.provider, req.is_byok_enabled, req.credential_name)
        validate_model(req.provider, req.model, req.is_byok_enabled, req.credential_name)
        check_sufficient_credits(req.is_byok_enabled, req.credential_name, req.provider, user.access_token)
        await augment_with_kb_context(req, user)

        messages = _messages_from_request(req)
        response_format = _build_response_format(req)

        async def event_stream():
            # Accumulate the streamed text so a final response can be returned
            # and billed once the provider finishes streaming.
            streamed_text: list[str] = []
            finish_reason: str | None = None
            # Token usage is only present on the final stream chunk; capture it
            # so the response carries accurate input/output token counts.
            input_tokens = 0
            output_tokens = 0
            start = time.perf_counter()
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
                        finish_reason = getattr(delta[0], "finish_reason", None) or finish_reason
                    # Providers emit a final chunk carrying a `usage` object
                    # (prompt_tokens / completion_tokens). Capture it when present.
                    usage = getattr(chunk, "usage", None)
                    if usage:
                        input_tokens = usage.get("prompt_tokens", 0) or 0
                        output_tokens = usage.get("completion_tokens", 0) or 0
                    if text:
                        streamed_text.append(text)
                        chunk_dto = LLMGenerationChunk(
                            provider=req.provider,
                            model=req.model,
                            output=text,
                            conversation_id=req.conversation_id,
                        )
                        yield chunk_dto.model_dump_json()
            except HTTPException as exc:
                # Emit a clear, final error frame so the client is not silently
                # truncated mid-stream.
                log_exception(logger, exc, "[LLM-V2] stream error: ")
                yield self._error_chunk(req, str(exc.detail)).model_dump_json()
                return
            except Exception as e:
                log_exception(logger, e, "[LLM-V2] stream error: ")
                yield self._error_chunk(req, friendly_error(e)).model_dump_json()
                return
            finally:
                v2_job_manager.cleanup(job_id)

            # The stream completed: assemble the final response from the
            # accumulated deltas and emit it so the client knows streaming ended.
            response = LLMGenerationResponse(
                provider=req.provider,
                model=req.model,
                output="".join(streamed_text),
                status=_map_finish_reason_to_status(finish_reason),
                finish_reason=finish_reason,
                stream=True,
                time_taken=round(time.perf_counter() - start, 2),
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                is_json_output=req.is_json_output,
                is_byok_enabled=req.is_byok_enabled,
                credential_name=req.credential_name,
                conversation_id=req.conversation_id,
                is_temp_chat=req.is_temp_chat,
            )
            yield response.model_dump_json()

            # Post credit usage only for platform (non-BYOK) requests.
            if should_post_usage(req.is_byok_enabled, req.credential_name):
                _post_credit_usage(req, response, user)
            # Post BYOK usage for caller's own key requests.
            _post_byok_usage(req, response, user)

        job_id = v2_job_manager.register(event_stream)
        return job_id, event_stream()

    @staticmethod
    def _error_chunk(req: LLMGenerationRequest, error: str) -> LLMGenerationChunk:
        """Build a final streaming chunk carrying a human-readable error."""
        return LLMGenerationChunk(
            provider=req.provider,
            model=req.model,
            output="",
            conversation_id=req.conversation_id,
            done=True,
            error=error,
        )

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
