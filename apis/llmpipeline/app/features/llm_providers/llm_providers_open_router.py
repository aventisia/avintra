import json
import time
import httpx
from fastapi import HTTPException, Request

from app.core.config import settings
from app.core.logger import log_exception, logger
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService
from app.core.security import get_jwt
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from app.features.llm_providers.llm_providers_schemas import (
    LLMChunkResponse,
    LLMRequest,
    LLMResponse,
)
from app.features.llm_providers.llm_job_manager import active_llm_jobs
from .llm_providers_base import BaseLLMProvider


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
    async def generate_llm_response(self, llm_request: LLMRequest, request: Request):
        logger.info(f"[NO STREAMING] Prompt sent to OpenRouter with model: {llm_request.model}")

        # Extract JWT from request
        jwt = get_jwt(request)

        # Validate JWT
        if not jwt or jwt.startswith("Error"):
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Validate BYOK or credits
        self._handle_byok_and_credits(llm_request, jwt)

        # Initialize response data
        response_data = {}

        # Initialize default response
        default_response = self.create_initial_llm_response_with_defaults(llm_request)

        # Start timing
        start_time = time.perf_counter()

        # Build payload and headers
        payload, headers = self.create_request_payload_and_headers(llm_request)

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

                return self.create_final_llm_response(
                    llm_request,
                    default_response,
                    start_time,
                    output,
                    jwt,
                    response_data,
                )

        except Exception as e:
            log_exception(logger, e, "OpenRouter request failed")
            default_response.error = str(e)
            return default_response

    # Handle streaming OpenRouter requests
    async def stream_llm_response(
        self, llm_request: LLMRequest, job_id: str, request: Request
    ):
        logger.info(f"[STREAMING] Prompt sent to OpenRouter with model: {llm_request.model}")

        # Extract JWT
        jwt = get_jwt(request)

        # Validate JWT
        if not jwt or jwt.startswith("Error"):
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Validate BYOK or credits
        self._handle_byok_and_credits(llm_request, jwt)

        # Initialize chunk response
        chunk_response = LLMChunkResponse(
            provider=llm_request.provider,
            model=llm_request.model,
            output="",
        )

        buffer_output = ""
        default_response = self.create_initial_llm_response_with_defaults(llm_request)
        start_time = time.perf_counter()

        payload, headers = self.create_request_payload_and_headers(llm_request)
        payload["stream"] = True

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

                    async for line in response.aiter_lines():
                        if job_id not in active_llm_jobs:
                            break

                        if not line or not line.startswith("data:"):
                            continue

                        data = line.replace("data:", "").strip()

                        if data == "[DONE]":
                            break

                        chunk = json.loads(data)

                        delta = (
                            chunk.get("choices", [{}])[0]
                            .get("delta", {})
                            .get("content")
                        )

                    buffer_output += delta

                    if not llm_request.is_json_output:
                        # If the output is not JSON, use the method to refine the output
                        refined_output = self.extract_json_from_llm_response(buffer_output)
                        chunk_response.output = refined_output
                        yield chunk_response.model_dump_json() + "\n"
                    else:
                        chunk_response.output = delta
                        yield chunk_response.model_dump_json() + "\n"

                    final_output = (
                        json.loads(buffer_output)
                        if llm_request.is_json_output
                        else buffer_output
                    )

                    final_response = self.create_final_llm_response(
                        llm_request,
                        default_response,
                        start_time,
                        final_output,
                        jwt,
                        {},
                    )

                    yield final_response.model_dump_json() + "\n"

        except Exception as e:
            log_exception(logger, e, "OpenRouter streaming failed")
            yield f"Failed to stream response: {e}"

    # Function to build OpenRouter request payload and headers
    def create_request_payload_and_headers(self, llm_request: LLMRequest):
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

        # Add base64 files if provided
        if llm_request.files:
            for b64_file in llm_request.files:
                messages.append({
                    "inline_data": {
                        "mime_type": "image/png",  # Change this based on your file type (e.g., image/jpeg, application/pdf, etc.)
                        "data": b64_file
                    }
                })
        # Building the payload with dynamic elements
        payload = {
            "model": llm_request.model,
            "messages": messages,
            "stream": llm_request.stream,
            "temperature": llm_request.temperature,
            "top_p": llm_request.top_p,
            "max_tokens": llm_request.max_output_tokens,
        }

        # Include response format for JSON output type
        if llm_request.is_json_output:
            payload["response_format"] = {"type": llm_request.json_schema}
            payload["output_type"] = "json",
        else:
            payload["output_type"] = "text",


        # Constructing the headers with the API key
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            # "HTTP-Referer": "https://your-app-domain.com",
            # "X-Title": "Aventisia Technologies Private Limited",
        }

        return payload, headers

    # Handle BYOK credentials or credit usage
    def _handle_byok_and_credits(self, llm_request: LLMRequest, jwt: str):
        if llm_request.is_byok_enabled and llm_request.credential_id:
            vault = VaultManager()
            credential = vault.get_vault_secret_by_id(
                llm_request.credential_id, jwt
            )

            if not credential:
                raise HTTPException(400, "Invalid BYOK credentials")

            self.api_key = credential["data"]["ApiKey"]

        else:
            credit_mgr = CreditManagerService()
            if not credit_mgr.has_sufficient_credits("openrouter", jwt):
                raise HTTPException(400, "Insufficient credits")

    # Create default LLMResponse
    def create_initial_llm_response_with_defaults(
        self, llm_request: LLMRequest
    ) -> LLMResponse:
        return LLMResponse(
            provider=llm_request.provider,
            model=llm_request.model,
            output="",
            status=None,
            finish_reason=None,
            temperature=llm_request.temperature,
            top_p=llm_request.top_p,
            stream=llm_request.stream,
            max_output_tokens=llm_request.max_output_tokens,
            is_json_output=llm_request.is_json_output,
            is_byok_enabled=llm_request.is_byok_enabled,
            credential_id=llm_request.credential_id,
            error=None,
        )

    def create_final_llm_response(self, llm_request: LLMRequest, default_llm_response_obj: LLMResponse, start_time: float, output: str, jwt: str, response_data) -> LLMResponse: 
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
        llm_response.created_on = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(response_data.get("created", 0)))
        llm_response.time_taken = round(end_time - start_time, 2)
        llm_response.input_tokens = usage.get("prompt_tokens", 0)
        llm_response.input_cached_tokens = usage.get("prompt_tokens_details", {}).get("cached_tokens", 0)
        llm_response.output_tokens = usage.get("completion_tokens", 0)
        llm_response.output_reasoning_tokens = usage.get("completion_tokens_details", {}).get("reasoning_tokens", 0)

        # # If not BYOK and credential_id is present, post the credit usage
        # if not llm_request.is_byok_enabled and llm_request.credential_id:
        #     # Prepare the credit usage data
        #     credit_usage_data = [
        #         {
        #             "ServiceType": "CustomInputService",
        #             "ConsumedUnit": llm_response.input_tokens or 0,
        #             "RefType": llm_request.ref_type,
        #             "RefId": llm_request.ref_id,
        #             "RefName": llm_request.ref_name,
        #             "Action": llm_request.action,
        #             "TriggeredByAgent": llm_request.agent_name
        #         },
        #         {
        #             "ServiceType": "CustomInputService",
        #             "ConsumedUnit": llm_response.output_tokens or 0,
        #             "RefType": llm_request.ref_type,
        #             "RefId": llm_request.ref_id,
        #             "RefName": llm_request.ref_name,
        #             "Action": llm_request.action,
        #             "TriggeredByAgent": llm_request.agent_name
        #         }
        #     ]

        #     # Initialize the CreditManagerService
        #     credit_manager = CreditManagerService()

        #     # Post the credit usage data
        #     try:
        #         credit_manager.post_credit_usage(task="openrouter", request=credit_usage_data, jwt=jwt)
        #         logger.info(f"Successfully posted credit usage data for request ID {llm_request.ref_id}.")
        #     except Exception as e:
        #         logger.error(f"Failed to post credit usage data for request ID {llm_request.ref_id}. Error: {str(e)}")
        #         raise HTTPException(status_code=500, detail=f"Failed to post credit usage: {str(e)}")

        # Return the final llm_response
        return llm_response

    # Helper: Map OpenRouter finish_reason to OpenAI-compatible finish_reason
    def map_openrouter_finish_reason_to_finish_reason(self, finish_reason: str) -> str:
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
    def map_openrouter_finish_reason_to_status(self, finish_reason: str) -> str:
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
        logger.info(f"Raw OpenRouter finish_reason: {finish_reason}")
        return "unknown"
