import json
import time
from app.features.auth.authenticated_user import User
import httpx
from datetime import datetime, timezone
from app.core.config import settings
from app.core.logger import log_exception, logger
from app.features.llm_providers.llm_providers_schemas import LLMChunkResponse, LLMRequest, LLMResponse
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from .llm_providers_base import BaseLLMProvider
from app.features.llm_providers.llm_job_manager import active_llm_jobs
from fastapi import HTTPException
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService
from app.utils.file_util import FileUtils

class AnthropicProvider(BaseLLMProvider):
    # Constructor: To initialize API URL and key
    def __init__(self, api_url: str = settings.CLAUDE_API_URL, api_key: str = settings.CLAUDE_API_KEY, anthropic_version: str = settings.CLAUDE_VERSION):
        self.api_url = api_url
        self.api_key = api_key
        self.anthropic_version = anthropic_version

    # Method: Generate a response from the LLM
    async def generate_llm_response(self, llm_request: LLMRequest, user: User):
        logger.info(f"[NO STREAMING] Promptf sent to Anthropic provider with model: {llm_request.model}")
        
        # Handle BYOK (Bring Your Own Key) if enabled
        if llm_request.is_byok_enabled and llm_request.credential_id:
            vault_manager = VaultManager()

            # Fetch the credentials from the vault using the credential ID and JWT
            logger.info(f"Fetching credentials from vault for credential_id: {llm_request.credential_id}")
            credential = vault_manager.get_vault_secret_by_id(vault_secret_id=llm_request.credential_id, jwt=user.access_token)

            if credential:
                # Update the API URL and key from the vault credentials
                self.api_url = credential.get("data", {}).get("Url", self.api_url)
                self.api_key = credential.get("data", {}).get("ApiKey", self.api_key)
                logger.info("BYOK credentials successfully applied.")
            else:
                logger.error(f"BYOK enabled but no valid credentials found for credential_id: {llm_request.credential_id}")
                raise HTTPException(status_code=400, detail="No valid credentials found for the provided credential_id.")
        else:
            # If BYOK is not enabled, check the user's credits
            credential_manager = CreditManagerService()

            if not credential_manager.has_sufficient_credits(task="anthropic", jwt=user.access_token):
                logger.warning(f"Insufficient credits for Anthropic task, user: {user.username}")
                raise HTTPException(status_code=400, detail="Insufficient credits to continue. Please top up your credits.")

        # Initialize
        response_data = {}
        default_llm_response_obj = self._create_initial_llm_response_with_defaults(llm_request)
        start_time = time.perf_counter()
        
        # Get request payload and headers
        request_payload, request_headers = self._create_request_payload_and_headers(llm_request)
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send request to Anthropic API
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.api_url.rstrip('/')}/messages",
                    json=request_payload,
                    headers=request_headers,
                )
                
                # Handle response
                response.raise_for_status()
                response_data = response.json()
                
                # Log response data for debugging (pretty-printed for readability)
                logger.info(f"Anthropic response data:\n{json.dumps(response_data, indent=2)}")
                
                # Extract output text using robust helper method
                raw_output = self._extract_output_text_from_response(response_data)
                
                # Handle is_json_output if requested
                output = extract_json_from_llm_response(raw_output) if llm_request.is_json_output else raw_output
                
                # Return final llm response
                return self._create_final_llm_response(llm_request, default_llm_response_obj, start_time, output, user.access_token, response_data)
        except Exception as e:
            log_exception(logger, e, "Anthropic llm transactional request error: ", response_data.get('error', ''))
            default_llm_response_obj.error = f"Failed to generate response: {e}"

            return default_llm_response_obj

    # Method: Streaming response generator for Anthropic
    async def stream_llm_response(self, llm_request: LLMRequest, job_id: str, user: User):
        logger.info(f"[STREAMING] Prompt sent to Anthropic provider with model: {llm_request.model}")

        # Handle BYOK (Bring Your Own Key) if enabled
        if llm_request.is_byok_enabled and llm_request.credential_id:
            vault_manager = VaultManager()

            # Fetch the credentials from the vault using the credential ID and JWT
            logger.info(f"Fetching credentials from vault for credential_id: {llm_request.credential_id}")
            credential = vault_manager.get_vault_secret_by_id(vault_secret_id=llm_request.credential_id, jwt=user.access_token)

            if credential:
                # Update the API URL and key from the vault credentials
                self.api_url = credential.get("data", {}).get("Url", self.api_url)
                self.api_key = credential.get("data", {}).get("ApiKey", self.api_key)
                logger.info("BYOK credentials successfully applied.")
            else:
                logger.error(f"BYOK enabled but no valid credentials found for credential_id: {llm_request.credential_id}")
                raise HTTPException(status_code=400, detail="No valid credentials found for the provided credential_id.")
        else:
            # If BYOK is not enabled, check the user's credits
            credential_manager = CreditManagerService()

            if not credential_manager.has_sufficient_credits(task="anthropic", jwt=user.access_token):
                logger.warning(f"Insufficient credits for Anthropic task, user: {user.username}")
                raise HTTPException(status_code=400, detail="Insufficient credits to continue. Please top up your credits.")

        # Initialize
        chunk_response = LLMChunkResponse(
            provider=llm_request.provider,
            model=llm_request.model,
            output=""
        )
        buffer_output = ""  # Buffer to accumulate output if is_json_output is True
        default_llm_response_obj = self._create_initial_llm_response_with_defaults(llm_request)
        start_time = time.perf_counter()
        
        # Get request payload and headers
        request_payload, request_headers = self._create_request_payload_and_headers(llm_request)
        
        # Set a long timeout for potentially lengthy messages 
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send streaming request to Anthropic API
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.api_url.rstrip('/')}/messages",
                    json=request_payload,
                    headers=request_headers,
                ) as response:
                    # Handle response
                    response.raise_for_status()

                    response_data = {}
                    # Stream response lines from Anthropic API
                    async for line in response.aiter_lines():
                        # Stop streaming if the job has been cancelled
                        if job_id not in active_llm_jobs:
                            logger.info(f"Streaming stopped: job {job_id} no longer active")
                            break

                        # Normalize incoming line
                        line = line.strip()
                        logger.info("Response: %s", line)
                        # Ignore non-data lines (Anthropic sends only "data:" lines for payload)
                        if not line.startswith("data:"):
                            continue

                        # Remove "data:" prefix
                        json_str = line[len("data:"):].strip()

                        # Handle explicit stream termination signal
                        if json_str == "[DONE]":
                            logger.info(f"Received DONE signal for job {job_id}")
                            break

                        try:
                            # Attempt to parse JSON chunk
                            chunk = json.loads(json_str)

                        except json.JSONDecodeError as json_err:
                            logger.error(
                                f"JSON decode failure in stream | job_id={job_id} | raw={json_str[:200]}",
                                exc_info=json_err
                            )
                            continue

                        except Exception as parse_err:
                            logger.error(
                                f"Unexpected parsing error in stream | job_id={job_id}",
                                exc_info=parse_err
                            )
                            continue

                        # Extract event type safely
                        event_type = chunk.get("type")
                        if not event_type:
                            logger.warning(
                                f"Missing event type in chunk | job_id={job_id} | chunk={chunk}"
                            )
                            continue

                        try:
                            # Handle streaming text chunks
                            if event_type == "content_block_delta":
                                delta = chunk.get("delta")

                                if not isinstance(delta, dict):
                                    logger.warning(
                                        f"Invalid delta format | job_id={job_id} | delta={delta}"
                                    )
                                    continue

                                if delta.get("type") == "text_delta":
                                    text = delta.get("text", "")

                                    if not isinstance(text, str):
                                        logger.warning(
                                            f"Non-string text delta | job_id={job_id} | value={text}"
                                        )
                                        continue

                                    # Append to full buffer
                                    buffer_output += text

                                    # Emit streaming chunk if not expecting structured JSON output
                                    if not llm_request.is_json_output:
                                        chunk_response.output = text
                                        yield chunk_response.model_dump_json() + "\n"

                            # Handle completion event
                            elif event_type == "message_stop":
                                logger.info(f"Stream completed successfully | job_id={job_id}")

                                try:
                                    if llm_request.is_json_output:
                                        final_output = extract_json_from_llm_response(buffer_output)
                                    else:
                                        final_output = buffer_output
                                except Exception as transform_err:
                                    logger.error(
                                        f"Post-processing failed | job_id={job_id}",
                                        exc_info=transform_err
                                    )
                                    final_output = buffer_output  # fallback

                                try:
                                    final_llm_response = self._create_final_llm_response(
                                        llm_request,
                                        default_llm_response_obj,
                                        start_time,
                                        final_output,
                                        user.access_token,
                                        response_data
                                    )

                                    yield final_llm_response.model_dump_json() + "\n"

                                except Exception as final_err:
                                    logger.error(
                                        f"Final response creation failed | job_id={job_id}",
                                        exc_info=final_err
                                    )
                                    yield f"Failed to finalize response: {str(final_err)}"

                                break
                            
                            elif event_type == "message_delta":
                                usage = chunk.get("usage", {})
                                delta = chunk.get("delta", {})

                                response_data = {
                                    "usage": {
                                        "input_tokens": usage.get("input_tokens", 0),
                                        "output_tokens": usage.get("output_tokens", 0),
                                        "cache_read_input_tokens": usage.get("cache_read_input_tokens", 0),
                                        "reasoning_tokens": usage.get("reasoning_tokens", 0)
                                    },
                                    "stop_reason": delta.get("stop_reason", "failed")
                                }

                            # Ignore non-essential lifecycle events
                            elif event_type in ("message_start", "content_block_start", "content_block_stop"):
                                logger.debug(f"Ignored event | job_id={job_id} | type={event_type}")

                            else:
                                logger.debug(
                                    f"Unknown event type | job_id={job_id} | type={event_type}"
                                )

                        except Exception as stream_err:
                            logger.error(
                                f"Unhandled stream processing error | job_id={job_id}",
                                exc_info=stream_err
                            )
                            continue
        except Exception as e:
            log_exception(logger, e, "Anthropic provider stream error")
            yield f"Failed to generate response: {e}"

    # Helper: Create request payload and headers
    def _create_request_payload_and_headers(self, llm_request: LLMRequest) -> tuple:
        if isinstance(llm_request.input, str):
            # If the input is a single string, treat it as a single user message
            messages = [{"role": "user", "content": llm_request.input}]
        elif isinstance(llm_request.input, list):
            # If input is a list of messages, group by role
            messages = []  # Initialize contents list to store the grouped messages
            for msg in llm_request.input:
                if hasattr(msg, "role") and hasattr(msg, "content"):
                   # Check if role is either 'user', if so, set it to 'user'
                    if msg.role in {"user"}:
                        role = "user"
                    else:
                        role = "assistant"  # Set to 'assistant' for all other cases
                        
                    # Append the message to the contents with role and content parts
                    messages.append({
                        "role": role,
                        "content": msg.content
                    })
        else:
            raise ValueError("Invalid input format. Must be string or list of messages.")

        # Split into model + max_tokens (if present)
        model_raw = llm_request.model or ""
        parts = model_raw.split("/")

        model_name = parts[0]
        max_tokens_from_model = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None

        # Build request payload
        request_payload = {
            "model": model_name,
            "messages": messages, 
            "stream": llm_request.stream,
            # IMPORTANT NOTE: The top_p and temperature parameters have been deprecated in Anthropic APIs and may be removed in future versions
            # "top_p": llm_request.top_p 
            # "temperature": llm_request.temperature,
            # "store": False # Disabling openai parameter to store the generated model response for later retrieval via API.
        }

        # Decide max_tokens
        if llm_request.max_output_tokens and llm_request.max_output_tokens > 0:
            request_payload["max_tokens"] = llm_request.max_output_tokens
        elif max_tokens_from_model:
            request_payload["max_tokens"] = max_tokens_from_model
    
        if llm_request.json_schema:
            schema_str = json.dumps(llm_request.json_schema, indent=2)

            for msg in reversed(messages):
                if msg["role"] == "user":
                    msg["content"] += f"""
                        Return ONLY valid JSON matching this schema:
                        {schema_str}

                        Do not include any extra text.
                        """
                    break
        
        # Add base64 files if any are provided
        if llm_request.files:
            for file_data in llm_request.files:
                # Check if file_data is a URL, else it's a file object
                if isinstance(file_data, str):  
                    mime_type, encoded_content = FileUtils.get_file_data_from_url(file_data)
                else:  # If file_data is an object containing mime type and encoded content
                    mime_type = file_data.mime_type
                    encoded_content = file_data.encoded_content

                # Only add the file data to payload if mime_type and encoded_content are present
                if mime_type and encoded_content:
                    # Determine the file type and set the 'type' in the payload accordingly
                    file_type = "document"  # Default file type is 'document'
                    
                    if mime_type.startswith("image/"):  # For images
                        file_type = "image"
                    elif mime_type.startswith("application/pdf"):  # For PDFs
                        file_type = "document"
                    
                    # Add the file to the payload
                    request_payload["messages"].append({
                        "role": "user",  # The role of the user submitting the file
                        "content": [
                            {
                                "type": file_type,  # Dynamically set type (image or document)
                                "source": {
                                    "type": "base64",  # Encoding type is base64
                                    "media_type": mime_type,  # The file's mime type (e.g., image/jpeg)
                                    "data": encoded_content  # The base64-encoded file content
                                }
                            }
                        ]
                    })

        # Build request headers
        request_headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": self.anthropic_version
        }

        # Return the final request payload and headers
        return request_payload, request_headers
    
    def _extract_output_text_from_response(self, response_data: dict) -> str:
    # Extract the content from the response
        content_array = response_data.get("content", [])
        
        for content_item in content_array:
            # Check if the item is of type "text"
            if content_item.get("type") == "text":
                # Return the text content
                return content_item.get("text", "")
        
        logger.warning("Could not find output_text in Anthropic response structure")
        return ""

    def _create_initial_llm_response_with_defaults(self, llm_request: LLMRequest) -> LLMResponse:
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

    def _create_final_llm_response(self, llm_request: LLMRequest, default_llm_response_obj: LLMResponse, start_time: float, output: str, jwt: str, response_data) -> LLMResponse: 
        llm_response = default_llm_response_obj   
        end_time = time.perf_counter()
        usage = response_data.get("usage", {})
        llm_response.output = output
        llm_response.finish_reason = response_data.get("stop_reason", None)
        llm_response.status = self._map_anthropic_finish_reason_to_status(response_data.get("stop_reason", "failed"))
        llm_response.created_on = datetime.now(timezone.utc)
        llm_response.time_taken = round(end_time - start_time, 2)
        llm_response.input_tokens = usage.get("input_tokens", 0)
        llm_response.input_cached_tokens = usage.get("cache_read_input_tokens", 0)
        llm_response.output_tokens = usage.get("output_tokens", 0)
        llm_response.output_reasoning_tokens = usage.get("reasoning_tokens", 0)

       # Post credit usage only when BYOK is disabled and no external credential is used
        if not llm_request.is_byok_enabled and not llm_request.credential_id:
            credit_usage_data = self._build_anthropic_credit_usage(llm_request, llm_response)

            # # TODO: Extend ServiceType handling if new token categories are introduced
            # # TODO: Verify if any additional services need to be uncommented/added in credit usage payload.
            # credit_manager = CreditManagerService()

            # try:
            #     # Send credit usage data to billing/credit service
            #     credit_manager.post_credit_usage(
            #         task="anthropic",
            #         request=credit_usage_data,
            #         jwt=jwt
            #     )
            #     logger.info(
            #         f"Successfully posted credit usage data for request ID {llm_request.ref_id}."
            #     )

            # except Exception as e:
            #     # Log and propagate failure for visibility and retry handling
            #     logger.error(
            #         f"Failed to post credit usage data for request ID {llm_request.ref_id}. Error: {str(e)}"
            #     )
            #     raise HTTPException(
            #         status_code=500,
            #         detail=f"Failed to post credit usage: {str(e)}"
            #     )

        return llm_response

    def _map_anthropic_finish_reason_to_status(self, stop_reason: str) -> str:
        # Define mapping for Anthropic finish reasons to status
        mapping = {
            "end_turn": "completed",               # Model reached a natural stopping point
            "max_tokens": "incomplete",            # Exceeded max_tokens limit
            "stop_sequence": "completed",          # Custom stop sequence triggered
            "tool_use": "tool_calls",              # Model invoked tools
            "pause_turn": "paused",                # Paused due to long-running turn, wait for continuation
            "refusal": "content_filter",           # Policy violations handled by streaming classifiers
        }
        
        # Return mapped status based on the stop_reason, defaulting to 'failed' if not found
        return mapping.get(stop_reason, "failed")

    def _build_anthropic_credit_usage(self, llm_request: LLMRequest, llm_response: LLMResponse):
        model_name = (llm_request.model or "").strip().lower()

        # Normalize token values
        input_tokens = max(llm_response.input_tokens or 0, 0)
        output_tokens = max(llm_response.output_tokens or 0, 0)

        # Cache tokens (safe fallback if fields are missing)
        cache_read_tokens = max(getattr(llm_response, "cache_read_tokens", 0) or 0, 0)
        cache_write_tokens = max(getattr(llm_response, "cache_write_tokens", 0) or 0, 0)

        credit_usage_data = [
            {
                "ServiceType": "CustomInputService",
                "ConsumedUnit": input_tokens,
                "RefType": llm_request.ref_type,
                "RefId": llm_request.ref_id,
                "RefName": llm_request.ref_name,
                "Action": llm_request.action,
                "TriggeredByAgent": llm_request.agent_name
            },
            {
                "ServiceType": "CustomOutputService",
                "ConsumedUnit": output_tokens,
                "RefType": llm_request.ref_type,
                "RefId": llm_request.ref_id,
                "RefName": llm_request.ref_name,
                "Action": llm_request.action,
                "TriggeredByAgent": llm_request.agent_name
            },
            {
                "ServiceType": "CustomCacheReadService",  # Tokens read from cache
                "ConsumedUnit": cache_read_tokens,
                "RefType": llm_request.ref_type,
                "RefId": llm_request.ref_id,
                "RefName": llm_request.ref_name,
                "Action": llm_request.action,
                "TriggeredByAgent": llm_request.agent_name
            },
            {
                "ServiceType": "CustomCacheWriteService",  # Tokens written to cache
                "ConsumedUnit": cache_write_tokens,
                "RefType": llm_request.ref_type,
                "RefId": llm_request.ref_id,
                "RefName": llm_request.ref_name,
                "Action": llm_request.action,
                "TriggeredByAgent": llm_request.agent_name
            }
        ]

        return credit_usage_data