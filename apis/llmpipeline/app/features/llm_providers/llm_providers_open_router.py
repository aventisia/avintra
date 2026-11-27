import json
import time
from app.features.auth.authenticated_user import User
import httpx
from datetime import datetime, timezone
from fastapi import HTTPException
from app.core.config import settings
from app.core.logger import log_exception, logger
from app.core.vault_credential_manager import VaultCredentialManager
from app.core.credit_manager import CreditManagerService
from app.core.byok_usage_manager import ByokUsageManager
from app.features.litellm.core.credentials import is_byok, resolve_credential_name
from app.features.litellm.core.credit_utils import agent_has_fixed_credits
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response, extract_error_message, _file_input_filename
from app.features.llm_providers.llm_providers_schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    LLMChunkResponse,
    LLMRequest,
    LLMResponse,
)
from app.features.llm_providers.llm_job_manager import active_llm_jobs
from .llm_providers_base import BaseLLMProvider
from app.utils.file_converter_utils import file_to_base64

class OpenRouterProvider(BaseLLMProvider):
    """
    OpenRouter LLM provider using OpenAI-compatible API.
    Supports streaming, non-streaming, BYOK, and credit enforcement.
    """

    # Initialize OpenRouter provider
    def __init__(
        self,
        api_url: str = settings.OPENROUTER_API_URL,
        api_key: str = settings.OPENROUTER_API_KEY,
    ):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key

    # Handle non-streaming OpenRouter requests
    async def generate_llm_response(self, llm_request: LLMRequest, user: User):
        logger.debug(f"[NO STREAMING] Prompt sent to OpenRouter with model: {llm_request.model}")

        # Validate BYOK or credits
        self._handle_byok_and_credits(llm_request, user)

        # Initialize response data
        response_data = {}

        # Initialize default response
        default_response = self._create_initial_llm_response_with_defaults(llm_request)

        # Start timing
        start_time = time.perf_counter()

        # Build payload and headers
        payload, headers = self._create_request_payload_and_headers(llm_request)

        timeout = httpx.Timeout(600.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    json=payload,
                    headers=headers,
                )

                response.raise_for_status()
                response_data = response.json()
                
                # Log response data for debugging (pretty-printed for readability)
                logger.debug("OpenRouter response data:\n%s", json.dumps(response_data, indent=2))
                
                content = (
                    response_data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                
                # Handle is_json_output if requested
                if llm_request.is_json_output:
                    output = extract_json_from_llm_response(content)
                else:
                    output = content

                return self._create_final_llm_response(
                    llm_request,
                    default_response,
                    start_time,
                    output,
                    user.access_token,
                    response_data,
                    user.space_id,
                )

        except Exception as e:
            error_context = ""
            if "response_data" in locals() and isinstance(response_data, dict):
                error_context = response_data.get("error", "")

            log_exception(
                logger,
                e,
                "OpenRouter llm transactional request error: ",
                error_context,
            )

            default_response.status = "failed"
            default_response.finish_reason = "error"
            default_response.error = extract_error_message(e)
            default_response.created_on = datetime.now(timezone.utc)
            default_response.time_taken = round(time.perf_counter() - start_time, 2)

            return default_response
    # Handle streaming OpenRouter requests
    async def stream_llm_response(
        self, llm_request: LLMRequest, job_id: str, user: User
    ):
        logger.debug(f"[STREAMING] Prompt sent to OpenRouter with model: {llm_request.model}")

        # Validate BYOK or credits
        self._handle_byok_and_credits(llm_request, user)

        # Initialize chunk response
        chunk_response = LLMChunkResponse(
            provider=llm_request.provider,
            model=llm_request.model,
            output="",
        )

        buffer_output = ""
        default_response = self._create_initial_llm_response_with_defaults(llm_request)
        start_time = time.perf_counter()

        payload, headers = self._create_request_payload_and_headers(llm_request)
        payload["stream"] = True
        payload["stream_options"] = {"include_usage": True}

        usage_data = {}
        finish_reason = None

        timeout = httpx.Timeout(600.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.api_url}/chat/completions",
                    json=payload,
                    headers=headers,
                ) as response:
                    response.raise_for_status()

                    # Iterate over streaming response line-by-line (Server-Sent Events format)
                    async for line in response.aiter_lines():

                        # Stop streaming if job was cancelled externally
                        if job_id not in active_llm_jobs:
                            break

                        # Skip empty lines or non-data lines (SSE sends other metadata sometimes)
                        if not line or not line.startswith("data:"):
                            continue

                        # Remove "data:" prefix and clean whitespace
                        data = line.replace("data:", "").strip()

                        # OpenAI/OpenRouter sends "[DONE]" when stream ends
                        if data == "[DONE]":
                            break

                        # Parse JSON chunk from stream
                        chunk = json.loads(data)

                        if chunk.get("usage"):
                            usage_data = chunk["usage"]

                        # IMPORTANT NOTE: OpenRouter sends a trailing usage-only chunk with no
                        # `choices` once `stream_options.include_usage` is set, so it must be
                        # captured above and skipped here.
                        if not chunk.get("choices"):
                            continue

                        finish_reason = chunk["choices"][0].get("finish_reason") or finish_reason

                        # Extract token delta (same structure as OpenAI streaming)
                        delta = (
                            chunk.get("choices", [{}])[0]
                            .get("delta", {})
                            .get("content")
                        )

                        #  Skip if no actual content (e.g., role-only chunks)
                        if not delta:
                            continue

                        # Append token to full response buffer
                        buffer_output += delta

                        # Stream token immediately (OpenAI-style streaming)
                        chunk_response.output = delta

                        # Send chunk to client as JSON line (newline-delimited stream)
                        yield chunk_response.model_dump_json() + "\n"

                    #  AFTER STREAM COMPLETES

                    # Final output handling:
                    # - If JSON mode → parse full response
                    # - Else → keep as plain text
                    final_output = (
                        json.loads(buffer_output)
                        if llm_request.is_json_output
                        else buffer_output
                    )

                    usage_response = {
                        "usage": usage_data,
                        "choices": [{"finish_reason": finish_reason}],
                        "created": int(time.time())
                    }

                    # Build final structured response (includes metadata, timing, etc.)
                    final_response = self._create_final_llm_response(
                        llm_request,
                        default_response,
                        start_time,
                        final_output,
                        user.access_token,
                        usage_response,
                        user.space_id,
                    )

                    # Send final response (important for frontend completion state)
                    yield final_response.model_dump_json() + "\n"

        except HTTPException:
            raise
        except Exception as e:
            log_exception(logger, e, "OpenRouter streaming failed")
            
            default_response.status = "failed"
            default_response.finish_reason = "error"
            default_response.error = extract_error_message(e)
            default_response.created_on = datetime.now(timezone.utc)
            default_response.time_taken = round(time.perf_counter() - start_time, 2)
            yield default_response.model_dump_json() + "\n"


    # Helper: Build OpenRouter request payload and headers
    def _create_request_payload_and_headers(self, llm_request: LLMRequest):
         # Initialize the messages list as an empty list
        messages = []

        # Handling dynamic input for the 'messages' list
        if isinstance(llm_request.input, str):
            # If the input is a string, treat it as a user message
            messages.append({"role": "user", "content": llm_request.input})
        elif isinstance(llm_request.input, list):
            # If the input is a list of messages, iterate and extract role and content
            for msg in llm_request.input:
                if hasattr(msg, "role") and hasattr(msg, "content"):
                    # Assign role based on condition: if it's 'user', use 'user', else 'assistance'
                    role = "user" if msg.role == "user" else "assistance"
                    messages.append({"role": role, "content": msg.content})
        else:
            raise ValueError("Input must be a string or a list of messages.")

        # Add files if any are provided
        if llm_request.files:
            # Find the last user message
            user_message_index = None
            for idx in range(len(messages) - 1, -1, -1):
                if messages[idx]["role"] == "user":
                    user_message_index = idx
                    break

            # Create one if it doesn't exist
            if user_message_index is None:
                messages.append({"role": "user", "content": []})
                user_message_index = len(messages) - 1

            # Convert string content into content blocks
            content = messages[user_message_index].get("content")

            if isinstance(content, str):
                messages[user_message_index]["content"] = [
                    {
                        "type": "text",
                        "text": content,
                    }
                ]
            elif content is None:
                messages[user_message_index]["content"] = []

            for file_data in llm_request.files:
                data_uri = file_to_base64(file_data)
                if not data_uri:
                    continue

                filename = _file_input_filename(file_data, default="file")

                # Parse mime type
                mime_type = "application/octet-stream"
                if data_uri.startswith("data:"):
                    mime_type = data_uri.split(";")[0][5:]

                # Images
                if mime_type.startswith("image/"):
                    messages[user_message_index]["content"].append(
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": data_uri,
                            },
                        }
                    )

                # Audio
                elif mime_type.startswith("audio/"):
                    audio_format = mime_type.split("/")[-1]

                    # input_audio expects raw base64 without the data: prefix
                    base64_data = data_uri.split(",", 1)[1]

                    messages[user_message_index]["content"].append(
                        {
                            "type": "input_audio",
                            "input_audio": {
                                "data": base64_data,
                                "format": audio_format,
                            },
                        }
                    )

                # Everything else (PDF, DOCX, TXT, etc.)
                else:
                    messages[user_message_index]["content"].append(
                        {
                            "type": "file",
                            "file": {
                                "filename": filename,
                                "file_data": data_uri,  # data:<mime>;base64,...
                            },
                        }
                    )
                     
        # Building the payload with dynamic elements
        payload = {
            "model": llm_request.model,
            "messages": messages,
            "stream": llm_request.stream,
        }
        
        # If max_output_tokens is provided and greater than 0 (in python 0 is falsy), include it in the payload
        if llm_request.max_output_tokens:
            payload["max_tokens"] = llm_request.max_output_tokens

        # Initialize default response format
        payload["response_format"] = None

        # Include response format if JSON schema is defined
        if llm_request.json_schema:
            payload["response_format"] = {
                "type": "json_object",
                "json_schema": llm_request.json_schema
            }

        # Set response format based on is_json_output flag (only if no schema)
        elif llm_request.is_json_output:
            payload["response_format"] = {
                "type": "json_object"
            }

        # Default output type if no schema and not JSON output
        else:
            payload["output_type"] = "text"


        # Constructing the headers with the API key
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            # "HTTP-Referer": "https://your-app-domain.com",
            # "X-Title": "Aventisia Technologies Private Limited",
        }

        return payload, headers

    # Helper: Handle BYOK credentials or credit usage
    def _handle_byok_and_credits(self, llm_request: LLMRequest, user: User):
        if is_byok(llm_request.credential_name):
            vault_credential = VaultCredentialManager()
            credential = vault_credential.get_vault_credential_secret_by_name(
                llm_request.credential_name,
                user.access_token,
                env_type=user.env_type,
                tenant_id=str(user.tenant_id) if user.tenant_id else None,
                space_id=user.space_id,
            )

            if not credential:
                raise HTTPException(400, "Invalid BYOK credentials")

            credential_data = credential.get("data") or credential
            self.api_key = credential_data.get("ApiKey")

            if not self.api_key:
                raise HTTPException(400, "Invalid BYOK credentials")

        else:
            credit_mgr = CreditManagerService()
            if not credit_mgr.has_sufficient_credits("openrouter", user.access_token):
                raise HTTPException(400, "Insufficient credits")

    # Helper: Create default LLMResponse
    def _create_initial_llm_response_with_defaults(self, llm_request: LLMRequest) -> LLMResponse:
        return LLMResponse(
            provider=llm_request.provider,
            model=llm_request.model,
            output="",
            status=None,
            finish_reason=None,
            stream=llm_request.stream,
            max_output_tokens=llm_request.max_output_tokens,
            is_json_output=llm_request.is_json_output,
            credential_name=llm_request.credential_name,
            error=None,
        )

    # Helper: Create final LLMResponse with actual values and handle credit usage posting
    def _create_final_llm_response(self, llm_request: LLMRequest, default_llm_response_obj: LLMResponse, start_time: float, output: str, jwt: str, response_data, space_id: str = None) -> LLMResponse: 
        # Create a copy of the default llm_response_obj
        llm_response = default_llm_response_obj   

        # End Time. To Get total time taken for LLM response
        end_time = time.perf_counter()

        # Get token usage details and incomplete_details if available
        usage = response_data.get("usage", {})

        # Update llm_response with actual values
        llm_response.output = output
        llm_response.status = "success"  # Assuming success status for now, could be dynamic based on response_data
        llm_response.finish_reason = response_data.get("choices", [{}])[0].get("finish_reason", None) 
        llm_response.created_on = datetime.fromtimestamp(response_data.get("created", 0), tz=timezone.utc)
        llm_response.time_taken = round(end_time - start_time, 2)
        llm_response.input_tokens = usage.get("prompt_tokens", 0)
        llm_response.input_cached_tokens = usage.get("prompt_tokens_details", {}).get("cached_tokens", 0)
        llm_response.output_tokens = usage.get("completion_tokens", 0)
        llm_response.output_reasoning_tokens = usage.get("completion_tokens_details", {}).get("reasoning_tokens", 0)

        if not is_byok(llm_request.credential_name):
            # Skip token-based deduction when the agent has a fixed-credits override.
            if agent_has_fixed_credits(llm_request.ref_id, jwt):
                logger.debug(f"Skipping platform credit usage for agent {llm_request.ref_id} (fixed credits).")
                return llm_response

            # Prepare the credit usage data
            credit_usage_data = self._build_openrouter_credit_usage(llm_request, llm_response, space_id)

            if not credit_usage_data:
                logger.debug(f"No credit usage to post for request ID {llm_request.ref_id}.")
                return llm_response

            # Initialize the CreditManagerService
            credit_manager = CreditManagerService()

            # Post the credit usage data
            try:
                credit_manager.post_credit_usage(task="openrouter", request=credit_usage_data, jwt=jwt)
                logger.debug(f"Successfully posted credit usage data for request ID {llm_request.ref_id}.")
            except Exception as e:
                logger.error(f"Failed to post credit usage data for request ID {llm_request.ref_id}. Error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to post credit usage: {str(e)}")

        else:
            try:
                byok_usage_data = self._build_openrouter_byok_usage(llm_request, llm_response, space_id, jwt)

                # Initialize the ByokUsageManager
                byok_manager = ByokUsageManager()

                # Post the BYOK usage data
                byok_manager.post_byok_usage(task="openrouter", request=byok_usage_data, jwt=jwt)
                logger.debug(f"Successfully posted BYOK usage data for request ID {llm_request.ref_id}.")
            except Exception as e:
                logger.error(f"Failed to post BYOK usage data for request ID {llm_request.ref_id}. Error: {str(e)}")

        # Return the final llm_response
        return llm_response

    # Helper: Map OpenRouter finish_reason to OpenAI-compatible finish_reason
    def _map_openrouter_finish_reason_to_finish_reason(self, finish_reason: str) -> str:
        # Define mapping for OpenRouter finish reasons to OpenAI-compatible finish reasons
        mapping = {
            "length": "max_output_tokens",
            "stop": "stop",
            "error": "error",
            "tool_calls": "tool_calls",
            "content_filter": "content_filter",
        }
        
        # Return the mapped finish_reason or None if not found
        return mapping.get(finish_reason, None)

    # Helper: Map OpenRouter finish_reason to LLMResponse status
    def _map_openrouter_finish_reason_to_status(self, finish_reason: str) -> str:
        # Define mapping for OpenRouter finish reasons
        mapping = {
            "stop": "completed",
            "length": "incomplete",
            "error": "failed",
            "tool_calls": "tool_calls",
            "content_filter": "content_filter",
        }
        
        # Try to get mapped status
        mapped_status = mapping.get(finish_reason)
        
        # Return mapped status if found, otherwise log and return unknown
        if mapped_status:
            return mapped_status
        
        # Log the raw finish_reason if not mapped
        logger.debug(f"Raw OpenRouter finish_reason: {finish_reason}")
        return "unknown"

    # Helper: Build credit usage data for OpenRouter models based on token usage and model mapping
    def _build_openrouter_credit_usage(self, llm_request: LLMRequest, llm_response: LLMResponse, space_id: str = None):
        """
        Build credit usage for OpenRouter models (Claude, Grok, Qwen, etc.)
        """

        # Normalize model name
        model_name = (llm_request.model or "").strip().lower()
        model_name = model_name.split("/")[-1]  # handle provider prefixes

        # Safe token extraction
        input_tokens = max(getattr(llm_response, "input_tokens", 0) or 0, 0)
        output_tokens = max(getattr(llm_response, "output_tokens", 0) or 0, 0)
        cached_tokens = max(getattr(llm_response, "input_cached_tokens", 0) or 0, 0)

        # OpenRouter Model → Enum Mapping
        OPENROUTER_MODEL_MAP = {
            # Claude
            "claude-4.5-sonnet": {
                "input": "Claude45SonnetInput",
                "output": "Claude45SonnetOutput",
                "cache": "Claude45SonnetCached",
            },
            "claude-4.5-haiku": {
                "input": "Claude45HaikuInput",
                "output": "Claude45HaikuOutput",
                "cache": "Claude45HaikuCached",
            },

            # Grok
            "grok-3-mini": {
                "input": "Grok3MiniInput",
                "output": "Grok3MiniOutput",
                "cache": "Grok3MiniCached",
            },

            # Qwen VL 32B Instruct
            "qwen3-vl-32b-instruct": {
                "input": "Qwen3Vl32bInstructInput",
                "output": "Qwen3Vl32bInstructOutput",
                "cache": "Qwen3Vl32bInstructCached",  # include if backend supports
            },
        }

        # Resolve service mapping
        service_map = OPENROUTER_MODEL_MAP.get(model_name)

        if not service_map:
            for key, value in OPENROUTER_MODEL_MAP.items():
                if model_name.startswith(key):
                    service_map = value
                    break

        # Fallback (future-proof)
        if not service_map:
            normalized = "".join(part.capitalize() for part in model_name.split("-"))
            service_map = {
                "input": f"{normalized}Input",
                "output": f"{normalized}Output",
                "cache": f"{normalized}Cached",
            }

        # Helper to build entry
        def build_entry(service_type, tokens):
            return {
                "ServiceType": service_type,
                "ConsumedUnit": tokens,
                "RefType": llm_request.ref_type,
                "RefId": llm_request.ref_id,
                "RefName": llm_request.ref_name,
                "Action": llm_request.action,
                "TriggeredByAgent": llm_request.ref_name,
            }

        credit_usage = []

        # Add token usage entries
        if input_tokens > 0:
            credit_usage.append(build_entry(service_map["input"], input_tokens))

        if cached_tokens > 0:
            credit_usage.append(build_entry(service_map["cache"], cached_tokens))

        if output_tokens > 0:
            credit_usage.append(build_entry(service_map["output"], output_tokens))
        
        logger.debug("Credit usage: %s", json.dumps(credit_usage, default=str))

        return credit_usage

    # Helper: Build OpenRouter BYOK usage
    def _build_openrouter_byok_usage(self, llm_request: LLMRequest, llm_response: LLMResponse, space_id: str = None, jwt: str = None):
        """
        Build BYOK usage for OpenRouter models (Claude, Grok, Qwen, etc.)

        - Mirrors the credit-usage model mapping entry for entry
        - Carries the vault credential attribution
        """

        # Normalize model name
        model_name = (llm_request.model or "").strip().lower()
        model_name = model_name.split("/")[-1]  # handle provider prefixes

        # Safe token extraction
        input_tokens = max(getattr(llm_response, "input_tokens", 0) or 0, 0)
        output_tokens = max(getattr(llm_response, "output_tokens", 0) or 0, 0)
        cached_tokens = max(getattr(llm_response, "input_cached_tokens", 0) or 0, 0)

        # OpenRouter Model → Enum Mapping
        OPENROUTER_MODEL_MAP = {
            # Claude
            "claude-4.5-sonnet": {
                "input": "Claude45SonnetInput",
                "output": "Claude45SonnetOutput",
                "cache": "Claude45SonnetCached",
            },
            "claude-4.5-haiku": {
                "input": "Claude45HaikuInput",
                "output": "Claude45HaikuOutput",
                "cache": "Claude45HaikuCached",
            },

            # Grok
            "grok-3-mini": {
                "input": "Grok3MiniInput",
                "output": "Grok3MiniOutput",
                "cache": "Grok3MiniCached",
            },

            # Qwen VL 32B Instruct
            "qwen3-vl-32b-instruct": {
                "input": "Qwen3Vl32bInstructInput",
                "output": "Qwen3Vl32bInstructOutput",
                "cache": "Qwen3Vl32bInstructCached",  # include if backend supports
            },
        }

        # Resolve service mapping
        service_map = OPENROUTER_MODEL_MAP.get(model_name)

        if not service_map:
            for key, value in OPENROUTER_MODEL_MAP.items():
                if model_name.startswith(key):
                    service_map = value
                    break

        # Fallback (future-proof)
        if not service_map:
            normalized = "".join(part.capitalize() for part in model_name.split("-"))
            service_map = {
                "input": f"{normalized}Input",
                "output": f"{normalized}Output",
                "cache": f"{normalized}Cached",
            }

        # Resolve the vault credential name for attribution
        credential_name = resolve_credential_name(llm_request.credential_name, jwt=jwt)

        # Helper to build entry
        def build_entry(service_type, tokens):
            return {
                "ServiceType": service_type,
                "Provider": llm_request.provider,
                "Model": llm_request.model,
                "ConsumedUnit": tokens,
                "UnitType": "Tokens",
                "CredentialName": credential_name,
                "RefType": llm_request.ref_type,
                "RefId": llm_request.ref_id,
                "RefName": llm_request.ref_name,
                "Action": llm_request.action,
                "TriggeredByAgent": llm_request.ref_name,
                "SpaceId": space_id,
            }

        byok_usage = []

        # Add token usage entries
        if input_tokens > 0:
            byok_usage.append(build_entry(service_map["input"], input_tokens))

        if cached_tokens > 0:
            byok_usage.append(build_entry(service_map["cache"], cached_tokens))

        if output_tokens > 0:
            byok_usage.append(build_entry(service_map["output"], output_tokens))

        return byok_usage

    # Method: Generate embeddings via OpenRouter (OpenAI-compatible)
    async def generate_embeddings(self, embedding_request: EmbeddingRequest, user: User):
        logger.debug(f"[EMBEDDING] Request sent to OpenRouter with model: {embedding_request.model}")

        # Handle BYOK or credit validation
        if is_byok(embedding_request.credential_name):
            vault_credential = VaultCredentialManager()
            credential = vault_credential.get_vault_credential_secret_by_name(
                embedding_request.credential_name,
                user.access_token,
                env_type=user.env_type,
                tenant_id=str(user.tenant_id) if user.tenant_id else None,
                space_id=user.space_id,
            )

            if not credential:
                raise HTTPException(400, "Invalid BYOK credentials")

            credential_data = credential.get("data") or credential
            self.api_key = credential_data.get("ApiKey")

            if not self.api_key:
                raise HTTPException(400, "Invalid BYOK credentials")

        else:
            credit_mgr = CreditManagerService()
            if not credit_mgr.has_sufficient_credits("openrouter", user.access_token):
                raise HTTPException(400, "Insufficient credits")
            
        response_data = {}
        start_time = time.perf_counter()

        # Build request payload
        payload = {
            "model": embedding_request.model,
            "input": embedding_request.input,
            "encoding_format": embedding_request.encoding_format
        }

        if embedding_request.dimensions:
            payload["dimensions"] = embedding_request.dimensions

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        timeout = httpx.Timeout(300.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.api_url}/embeddings",
                    json=payload,
                    headers=headers
                )

                response.raise_for_status()
                response_data = response.json()

                # Extract embeddings
                embeddings = [item["embedding"] for item in response_data.get("data", [])]

                end_time = time.perf_counter()

                embedding_response = EmbeddingResponse(
                    provider=embedding_request.provider,
                    model=embedding_request.model,
                    embeddings=embeddings,
                    created_on=datetime.now(timezone.utc),
                    time_taken=round(end_time - start_time, 2),
                    input_tokens=response_data.get("usage", {}).get("total_tokens", 0),
                    credential_name=embedding_request.credential_name,
                    status="completed"
                )

                # Credit consumption
                if not is_byok(embedding_request.credential_name):
                    credit_usage = self._build_openrouter_embedding_credit_usage(
                        embedding_request,
                        embedding_response,
                        user.space_id
                    )

                    credit_manager = CreditManagerService()
                    try:
                        credit_manager.post_credit_usage(
                            task="openrouter",
                            request=credit_usage,
                            jwt=user.access_token
                        )
                        logger.debug("Embedding credit usage posted successfully.")
                    except Exception as e:
                        logger.error(f"Failed to post embedding credit usage: {str(e)}")
                        raise HTTPException(status_code=500, detail="Credit usage failed")

                else:
                    byok_usage = self._build_openrouter_embedding_byok_usage(
                        embedding_request,
                        embedding_response,
                        user.space_id,
                        user.access_token
                    )

                    byok_manager = ByokUsageManager()
                    try:
                        if byok_usage:
                            byok_manager.post_byok_usage(
                                task="openrouter",
                                request=byok_usage,
                                jwt=user.access_token
                            )
                        logger.debug("Embedding BYOK usage posted successfully.")
                    except Exception as e:
                        logger.error(f"Failed to post embedding BYOK usage: {str(e)}")

                return embedding_response

        except Exception as e:
            log_exception(logger, e, "OpenRouter embedding error", response_data.get("error", ""))

            return EmbeddingResponse(
                provider=embedding_request.provider,
                model=embedding_request.model,
                embeddings=[],
                status="failed",
                error=str(e)
            )
        
    def _build_openrouter_embedding_credit_usage(
        self,
        embedding_request: EmbeddingRequest,
        embedding_response: EmbeddingResponse,
        space_id: str = None,
    ):
        """
        Construct credit usage payload for OpenRouter embedding requests.

        - Extracts the model name from provider-prefixed format (e.g., "qwen/...")
        - Maps model to internal ServiceType
        - Uses input tokens as consumed units
        """

        # Normalize model name (handle None, casing, whitespace)
        raw_model = (embedding_request.model or "").strip().lower()

        # Extract provider + model (OpenRouter format: "provider/model")
        # Keep both full and short name for flexible matching
        full_model_name = raw_model
        short_model_name = raw_model.split("/")[-1] if "/" in raw_model else raw_model

        # Ensure token count is non-negative
        input_tokens = max(embedding_response.input_tokens or 0, 0)

        # Mapping of OpenRouter models → internal service identifiers (with owner)
        EMBEDDING_MODEL_MAP = {
            "openai/text-embedding-3-small": "OpenRouterOpenAIEmbedding3Small",
            "openai/text-embedding-ada-002": "OpenRouterOpenAIEmbeddingAda002",
        }

        # Resolve service type (try full name first, then fallback to short name)
        service_type = (
            EMBEDDING_MODEL_MAP.get(full_model_name)
            or EMBEDDING_MODEL_MAP.get(short_model_name)
        )

        # Build and return usage payload
        return [{
            "ServiceType": service_type,
            "ConsumedUnit": input_tokens,
            "RefType": embedding_request.reference_type,
            "RefId": embedding_request.reference_id,
            "RefName": embedding_request.reference_name,
            "Action": embedding_request.action,
            "TriggeredByAgent": None,
            "SpaceId": space_id,
        }]

    def _build_openrouter_embedding_byok_usage(
        self,
        embedding_request: EmbeddingRequest,
        embedding_response: EmbeddingResponse,
        space_id: str = None,
        jwt: str = None,
    ):
        """
        Construct BYOK usage payload for OpenRouter embedding requests.

        - Extracts the model name from provider-prefixed format (e.g., "qwen/...")
        - Mirrors the credit-usage model mapping
        - Carries the vault credential attribution
        """

        # Normalize model name (handle None, casing, whitespace)
        raw_model = (embedding_request.model or "").strip().lower()

        # Extract provider + model (OpenRouter format: "provider/model")
        # Keep both full and short name for flexible matching
        full_model_name = raw_model
        short_model_name = raw_model.split("/")[-1] if "/" in raw_model else raw_model

        # Ensure token count is non-negative
        input_tokens = max(embedding_response.input_tokens or 0, 0)

        # Mapping of OpenRouter models → internal service identifiers (with owner)
        EMBEDDING_MODEL_MAP = {
            "openai/text-embedding-3-small": "OpenRouterOpenAIEmbedding3Small",
            "openai/text-embedding-ada-002": "OpenRouterOpenAIEmbeddingAda002",
        }

        # Resolve service type (try full name first, then fallback to short name)
        service_type = (
            EMBEDDING_MODEL_MAP.get(full_model_name)
            or EMBEDDING_MODEL_MAP.get(short_model_name)
        )

        # Skip unsupported models and zero-token calls instead of posting an invalid entry
        if not service_type or input_tokens <= 0:
            logger.warning(f"No embedding BYOK usage recorded for model {embedding_request.model}.")
            return []

        # Resolve the vault credential name for attribution
        credential_name = resolve_credential_name(embedding_request.credential_name, jwt=jwt)

        # Build and return usage payload
        return [{
            "ServiceType": service_type,
            "Provider": embedding_request.provider,
            "Model": embedding_request.model,
            "ConsumedUnit": input_tokens,
            "UnitType": "Tokens",
            "CredentialName": credential_name,
            "RefType": embedding_request.reference_type,
            "RefId": embedding_request.reference_id,
            "RefName": embedding_request.reference_name,
            "Action": embedding_request.action,
            "TriggeredByAgent": None,
            "SpaceId": space_id,
        }]
    
