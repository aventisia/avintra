import json
import time
import httpx
from datetime import datetime, timezone
from fastapi import HTTPException, Request

from app.core.config import settings
from app.core.logger import log_exception, logger
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService
from app.core.security import get_jwt

from app.features.llm_providers.llm_providers_schemas import (
    LLMChunkResponse,
    LLMRequest,
    LLMResponse,
)
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from app.features.llm_providers.llm_job_manager import active_llm_jobs
from .llm_providers_base import BaseLLMProvider
from app.utils.file_util import FileUtils

class GeminiProvider(BaseLLMProvider):
    """
    Gemini LLM provider implementation.
    Supports streaming, non-streaming, BYOK, and credit enforcement.
    """

    # Initialize Gemini provider with API URL and API key
    def __init__(
        self,
        api_url: str = settings.GEMINI_API_URL,
        api_key: str = settings.GEMINI_API_KEY,
    ):
        # Normalize Gemini API base URL
        self.api_url = api_url.rstrip("/")

        # Store Gemini API key for authentication
        self.api_key = api_key

    # Handle non-streaming Gemini LLM requests
    async def generate_llm_response(self, llm_request: LLMRequest, request: Request):
        logger.info(f"[NO STREAMING] Prompt sent to Gemini with model: {llm_request.model}")

        # Extract JWT from incoming request
        jwt = get_jwt(request)

        # Validate JWT before processing request
        if not jwt or jwt.startswith("Error"):
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Validate BYOK credentials or check platform credits
        self._handle_byok_and_credits(llm_request, jwt)

        # Initialize container for raw Gemini response
        response_data = {}

        # Initialize default response object
        default_response = self.create_initial_llm_response_with_defaults(llm_request)

        # Capture request start time
        start_time = time.perf_counter()

        # Build Gemini request payload and headers
        payload, headers = self.create_request_payload_and_headers(llm_request)

        # Define timeout for long-running requests
        timeout = httpx.Timeout(600.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                # Send request to Gemini generateContent endpoint
                response = await client.post(
                    f"{self.api_url}/models/{llm_request.model}:generateContent",
                    headers=headers,
                    json=payload,
                )

                # Raise exception if HTTP response is not successful
                response.raise_for_status()

                # Parse Gemini API response
                response_data = response.json()
                
                # Log response data for debugging (pretty-printed for readability)
                logger.info(f"Gemini response data:\n{json.dumps(response_data, indent=2)}")
        
                # Extract generated text from response structure
                text_output = (
                    response_data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )

                text_output = response_data['candidates'][0]['content']['parts'][0]['text']
                
                # Convert output to JSON if requested
                if llm_request.is_json_output:
                    output = extract_json_from_llm_response(text_output)
                else:
                    output = text_output

                # Return standardized LLM response
                return self.create_final_llm_response(llm_request, default_response, start_time, output, jwt, response_data)

        except Exception as e:
            # Log Gemini request failure
            log_exception(logger, e, "Gemini request failed")

            # Attach error message to response
            default_response.error = str(e)

            return default_response

    # Handle streaming Gemini LLM requests
    async def stream_llm_response(
        self, llm_request: LLMRequest, job_id: str, request: Request
    ):
        logger.info(f"[STREAMING] Prompt sent to Gemini with model: {llm_request.model}")

        # Extract JWT for authentication
        jwt = get_jwt(request)

        # Validate JWT before opening stream
        if not jwt or jwt.startswith("Error"):
            raise HTTPException(status_code=401, detail="Unauthorized")

        # Validate BYOK credentials or available credits
        self._handle_byok_and_credits(llm_request, jwt)

        # Initialize streaming chunk response object
        chunk_response = LLMChunkResponse(
            provider=llm_request.provider,
            model=llm_request.model,
            output="",
        )

        # Initialize buffer for JSON output aggregation
        buffer_output = ""

        # Initialize default response metadata
        default_response = self.create_initial_llm_response_with_defaults(llm_request)

        # Capture streaming start time
        start_time = time.perf_counter()

        # Build Gemini streaming payload and headers
        payload, headers = self.create_request_payload_and_headers(llm_request)

        # Define timeout for streaming request
        timeout = httpx.Timeout(600.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                # Open streaming connection to Gemini
                async with client.stream(
                    "POST",
                    f"{self.api_url}/models/{llm_request.model}:streamGenerateContent",
                    headers=headers,
                    json=payload,
                ) as response:
                    # Validate streaming response
                    response.raise_for_status()

                    async for line in response.aiter_lines():
                        # Stop streaming if job has been cancelled
                        if job_id not in active_llm_jobs:
                            logger.info(f"Job {job_id} cancelled. Stopping Gemini stream.")
                            break

                        # Skip empty streaming lines
                        if not line:
                            continue

                        # Parse streamed JSON chunk
                        chunk = json.loads(line)

                        parts = (
                            chunk.get("candidates", [{}])[0]
                            .get("content", {})
                            .get("parts", [])
                        )

                        for part in parts:
                            # Extract incremental token text
                            delta = part.get("text")

                            # Skip empty tokens
                            if not delta:
                                continue

                            # Accumulate output
                            buffer_output += delta

                            # Yield chunks immediately for non-JSON output
                            if not llm_request.is_json_output:
                                chunk_response.output = delta
                                yield chunk_response.model_dump_json() + "\n"

                    # Finalize output after streaming completes
                    if llm_request.is_json_output:
                        final_output = extract_json_from_llm_response(buffer_output)
                    else:
                        final_output = buffer_output

                    # Build final response object
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
            # Log streaming failure
            log_exception(logger, e, "Gemini streaming failed")

            yield f"Failed to stream response: {e}"

    # Build Gemini request payload and authentication headers
    def create_request_payload_and_headers(self, llm_request: LLMRequest):
        # Initialize contents list
        contents = []
        
         # Process input: string or list of messages
        if isinstance(llm_request.input, str):
            # If input is a string, treat it as a "text" message
            contents.append({
                "parts": [{"text": llm_request.input}]
            })
        elif isinstance(llm_request.input, list):
            # If input is a list of messages, group by role
            for msg in llm_request.input:
                if hasattr(msg, "role") and hasattr(msg, "content"):
                    # Assign role based on condition: if it's 'user', use 'user', else 'model'
                    role = "user" if msg.role == "user" else "model"                    
                    contents.append({
                        "role": role,
                        "parts": [{"text": msg.content}]
                    })
        else:
            raise ValueError("Input must be a string or a list of messages.")

        # Add base64 files if any are provided (Gemini 'inline_data')
        if llm_request.files:
            for file_data in llm_request.files:
                # If file_data is a URL (assuming it's a string), fetch file content from URL
                if isinstance(file_data, str):  # Assuming file_data is a URL if it's a string
                    mime_type, encoded_content = FileUtils.get_file_data_from_url(file_data)
                else:
                    # Handle the case where file_data is an object with mime_type and encoded_content
                    mime_type = file_data.mime_type
                    encoded_content = file_data.encoded_content

                if mime_type and encoded_content:
                    contents.append({
                        "parts": [
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": encoded_content
                                }
                            }
                        ]
                    })

        # Create the payload base
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": llm_request.temperature,
                "topP": llm_request.top_p,
                "maxOutputTokens": llm_request.max_output_tokens,
            }
        }
        
        # Initialize responseMimeType to a default value (text)
        payload["generationConfig"]["responseMimeType"] = "text/plain"

        # If JSON schema is defined, include it and set MIME type to application/json
        if llm_request.json_schema:
            payload["generationConfig"]["responseJsonSchema"] = llm_request.json_schema
            payload["generationConfig"]["responseMimeType"] = "application/json"

        # If JSON output is requested (and no schema), set MIME type to application/json
        elif llm_request.is_json_output:
            payload["generationConfig"]["responseMimeType"] = "application/json"


        # Construct request headers for Gemini API
        headers = {
            "x-goog-api-key": self.api_key,
            "Content-Type": "application/json"
        }

        return payload, headers
    
    # Handle BYOK credentials or enforce platform credit usage
    def _handle_byok_and_credits(self, llm_request: LLMRequest, jwt: str):
        # Use customer-provided credentials when BYOK is enabled
        if llm_request.is_byok_enabled and llm_request.credential_id:
            vault = VaultManager()

            # Retrieve API credentials from secure vault
            credential = vault.get_vault_secret_by_id(
                llm_request.credential_id, jwt
            )

            # Reject request if credentials are invalid
            if not credential:
                raise HTTPException(400, "Invalid BYOK credentials")

            # Override Host and API key
            self.api_url = credential["data"]["Host"].rstrip("/")
            self.api_key = credential["data"]["ApiKey"]

        else:
            # Enforce credit availability for platform-managed usage
            credit_mgr = CreditManagerService()

            # Reject request if credits are insufficient
            if not credit_mgr.has_sufficient_credits("gemini", jwt):
                raise HTTPException(400, "Insufficient credits")

    # Helper: Create llm_response object with default values
    def create_initial_llm_response_with_defaults(self, llm_request: LLMRequest) -> LLMResponse:
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
            error=None
        )

    def create_final_llm_response(self, llm_request: LLMRequest, default_llm_response_obj: LLMResponse, start_time: float, output: str, jwt: str, response_data) -> LLMResponse:
        # Create a copy of the default llm_response_obj
        llm_response = default_llm_response_obj
        
        # End Time. To get total time taken for LLM response
        end_time = time.perf_counter()
        
        # Extract token usage metadata from the Gemini response
        usage_metadata = response_data.get("usageMetadata", {})
        
        # List of model output candidates returned by Gemini
        candidates = response_data.get("candidates", [{}])[0]
        
        # Final text output produced by the LLM
        llm_response.output = output
        
        # Overall status of the LLM request (e.g., success, error, completed)
        llm_response.status = self.map_gemini_finish_reason_to_status(candidates.get("finishReason", ""))

        # Reason the model stopped generating output (e.g., STOP, MAX_TOKENS, SAFETY)
        llm_response.finish_reason = self.map_gemini_finish_reason_to_finish_reason(candidates.get("finishReason", ""))

        # Timestamp when the response object is created
        llm_response.created_on = datetime.now(timezone.utc)
        
        # Total time taken for the LLM call (in seconds)
        llm_response.time_taken = round(end_time - start_time, 2)
                
        # Extract the prompt token count
        llm_response.input_tokens = usage_metadata.get("promptTokenCount", 0)
        
        # Extract the completion token count
        llm_response.output_tokens = usage_metadata.get("candidatesTokenCount", 0)
        
        # Extract cached tokens (Gemini returns these when using Context Caching)
        # This represents tokens retrieved from the cache (not billed as fresh input)
        llm_response.input_cached_tokens = usage_metadata.get("cachedContentTokenCount", 0)
        
        # Extract reasoning tokens (available in Gemini 3 thinking models)
        # These are internal "thought" tokens generated before the final answer
        llm_response.output_reasoning_tokens = usage_metadata.get("thoughtTokenCount", 0)
        
        # Post credit usage only when BYOK is disabled and no credential is provided
        if not llm_request.is_byok_enabled and not llm_request.credential_id:
            # Prepare the credit usage data
            credit_usage_data = self.build_gemini_credit_usage(llm_request, llm_response)

            if credit_usage_data:
                credit_manager = CreditManagerService()
                credit_manager.post_credit_usage(
                    task="gemini",
                    request=credit_usage_data,
                    jwt=jwt
                )
                
            # Initialize the CreditManagerService
            credit_manager = CreditManagerService()

            # Post the credit usage data
            try:
                credit_manager.post_credit_usage(task="gemini", request=credit_usage_data, jwt=jwt)
                logger.info(f"Successfully posted credit usage data for request ID {llm_request.ref_id}.")
            except Exception as e:
                logger.error(f"Failed to post credit usage data for request ID {llm_request.ref_id}. Error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to post credit usage: {str(e)}")

        # Return the final llm_response
        return llm_response
    
    # Helper: Map Gemini finish_reason to LLMResponse status
    def map_gemini_finish_reason_to_status(self, finish_reason: str) -> str:
        # Define mapping for Gemini finish reasons
        mapping = {
            "STOP": "completed",
            "MAX_TOKENS": "incomplete",
            "SAFETY": "content_filter",  
            "RECITATION": "content_filter",  
            "LANGUAGE": "content_filter",  
            "BLOCKLIST": "content_filter",  
            "PROHIBITED_CONTENT": "content_filter",  
            "SPII": "content_filter",  
            "IMAGE_SAFETY": "content_filter",  
            "IMAGE_PROHIBITED_CONTENT": "content_filter",  
            "IMAGE_RECITATION": "content_filter",
            "UNEXPECTED_TOOL_CALL": "failed",  
            "TOO_MANY_TOOL_CALLS": "failed",  
            "MISSING_THOUGHT_SIGNATURE": "failed", 
            "IMAGE_OTHER": "failed",  
            "NO_IMAGE": "failed",  
            "OTHER": "failed",  
            "MALFORMED_FUNCTION_CALL": "failed",  
            "tool_calls": "tool_calls",
            "cancelled": "cancelled"
        }
        
        # First try to get mapped status
        mapped_status = mapping.get(finish_reason)
        
        # Return mapped status if found
        if mapped_status:
            return mapped_status

        # Log the raw finish_reason if not mapped
        logger.info(f"Raw DeepInfra finish_reason: {finish_reason}")
        return "unknown"

    # Helper: Map Gemini finish_reason to OpenAI-compatible finish_reason
    def map_gemini_finish_reason_to_finish_reason(self, finish_reason: str) -> str:
        # Define mapping for Gemini finish reasons to OpenAI-compatible finish reasons
        mapping = {
            "MAX_TOKENS": "max_output_tokens",  
            "STOP": "stop",  
            "SAFETY": "content_filter",  
            "RECITATION": "content_filter",  
            "LANGUAGE": "content_filter",  
            "OTHER": "error",  
            "BLOCKLIST": "content_filter",  
            "PROHIBITED_CONTENT": "content_filter",  
            "SPII": "content_filter",  
            "MALFORMED_FUNCTION_CALL": "error",  
            "IMAGE_SAFETY": "content_filter",  
            "IMAGE_PROHIBITED_CONTENT": "content_filter",  
            "IMAGE_OTHER": "error",  
            "NO_IMAGE": "error",  
            "IMAGE_RECITATION": "content_filter",  
            "UNEXPECTED_TOOL_CALL": "error",  
            "TOO_MANY_TOOL_CALLS": "error",  
            "MISSING_THOUGHT_SIGNATURE": "error",  
        }
        
        # Return the mapped finish_reason, or None if not found
        return mapping.get(finish_reason, None)
    
    def build_gemini_credit_usage(self, llm_request: LLMRequest, llm_response: LLMResponse):
        """
        Build credit usage specifically for Gemini models.

        - Maps model → CreditServiceTypesEnum
        - Handles missing/invalid token values safely
        - Supports future models via fallback
        """

        # Normalize model name
        model_name = (llm_request.model or "").strip().lower()

        # Safe token extraction
        input_tokens = max(getattr(llm_response, "input_tokens", 0) or 0, 0)
        output_tokens = max(getattr(llm_response, "output_tokens", 0) or 0, 0)
        cached_tokens = max(getattr(llm_response, "input_cached_tokens", 0) or 0, 0)

        # Gemini Model → Enum Mapping
        GEMINI_MODEL_MAP = {
            "gemini-2.5-flash": {
                "input": "Gemini25FlashInput",
                "output": "Gemini25FlashOutput",
                "cache": "Gemini25FlashCached",
            },
            "gemini-2.5-light": {
                "input": "Gemini25LightInput",
                "output": "Gemini25LightOutput",
                "cache": "Gemini25LightCached",
            },
        }

        # Resolve service mapping
        service_map = GEMINI_MODEL_MAP.get(model_name)

        if not service_map:
            for key, value in GEMINI_MODEL_MAP.items():
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
                "TriggeredByAgent": llm_request.agent_name,
            }

        credit_usage = []

        # Add token usage entries
        if input_tokens > 0:
            credit_usage.append(build_entry(service_map["input"], input_tokens))

        if cached_tokens > 0:
            credit_usage.append(build_entry(service_map["cache"], cached_tokens))

        if output_tokens > 0:
            credit_usage.append(build_entry(service_map["output"], output_tokens))

        return credit_usage