# DeepInfra LLM Provider implementation (Using OpenAI-compatible HTTP API).
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
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService
from fastapi import HTTPException
from app.utils.file_util import FileUtils

class DeepInfraProvider(BaseLLMProvider):
    # Constructor: To initialize API URL and key
    def __init__(self, api_url: str = settings.DEEPINFRA_API_URL, api_key: str = settings.DEEPINFRA_API_KEY):
        self.api_url = api_url
        self.api_key = api_key

    # Method: Generate a response from the LLM
    async def generate_llm_response(self, llm_request: LLMRequest, user: User):
        logger.info(f"[NO STREAMING] Prompt sent to DeepInfra provider with model: {llm_request.model}")

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

            if not credential_manager.has_sufficient_credits(task="deepinfra", jwt=user.access_token):
                logger.warning(f"Insufficient credits for DeepInfra task, user: {user.username}")
                raise HTTPException(status_code=400, detail="Insufficient credits to continue. Please top up your credits.")

        # Initialize
        response_data = {}
        default_llm_response_obj = self._create_initial_llm_response_with_defaults(llm_request)
        start_time = time.perf_counter()

        # Get request payload and headers
        request_payload, request_headers = self._create_request_payload_and_headers(llm_request)
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send request to DeepInfra API
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    self.api_url,
                    json=request_payload,
                    headers=request_headers,
                )
                
                # Handle response
                response.raise_for_status()
                response_data = response.json()
                
                # Log response data for debugging (pretty-printed for readability)
                logger.info(f"DeepInfra response data:\n{json.dumps(response_data, indent=2)}")
                
                # Extract content from the first choice in the choices list
                content = response_data.get("choices", [])[0].get("message", {}).get("content", "")
                
                # Handle is_json_output if requested
                if llm_request.is_json_output:
                    output = extract_json_from_llm_response(content)
                else:
                    output = content
                    
                # Return final llm response
                return self._create_final_llm_response(llm_request, default_llm_response_obj, start_time, output, user.access_token, response_data)
                
        except Exception as e:
            log_exception(logger, e, "DeepInfra llm transactional request error: ", response_data.get('error', '')) # TODO: response_data may not have 'error' key. Not clearly documented in DeepInfra API docs.
            default_llm_response_obj.error = f"Failed to generate response: {e}"
            return default_llm_response_obj

    # TODO: Method: Streaming response generator for DeepInfra
    async def stream_llm_response(self, llm_request: LLMRequest, job_id: str, user: User):
        logger.info(f"[STREAMING] Prompt sent to DeepInfra provider with model: {llm_request.model}")
        
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

            if not credential_manager.has_sufficient_credits(task="deepinfra", jwt=user.access_token):
                logger.warning(f"Insufficient credits for DeepInfra task, user: {user.username}")
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
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send streaming request to DeepInfra API
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    self.api_url,
                    json=request_payload,
                    headers=request_headers,
                ) as response:
                    # Handle response
                    response.raise_for_status()

                    # Stream response lines from DeepInfra API
                    async for line in response.aiter_lines():
                        # Check for job cancellation
                        if job_id not in active_llm_jobs:
                            logger.info(f"Job {job_id} cancelled. Stopping DeepInfra stream.")
                            break
                        
                        # Process each line
                        line = line.strip()
                        if not line.startswith("data:"):
                            continue  # Skip event lines and others
                        
                        # Get content from chunk and yield as LLMChunkResponse
                        try:
                            json_str = line[len("data:"):].strip() # Remove the 'data:' prefix
                            chunk = json.loads(json_str)
                            chunk_delta = chunk.get("choices", [])[0].get("delta", {}).get("content", "")
                            finish_reason = chunk.get("choices", [])[0].get("finish_reason", "")
                            
                            # Break if finished and yield the final llm response
                            if finish_reason and finish_reason in ("stop", "length", "tool_calls", "content_filter", "failed"):
                                output = extract_json_from_llm_response(buffer_output) if llm_request.is_json_output else ""
                                full_response = chunk.get("response", {})
                                final_llm_response = self._create_final_llm_response(llm_request, default_llm_response_obj, start_time, output, user.access_token, full_response)
                                yield final_llm_response.model_dump_json() + "\n"
                                break
                            
                            # Stream chunk delta if available
                            if finish_reason is not None and chunk_delta:
                                buffer_output += chunk_delta # Accumulate output in buffer for json/structured output
                                if not llm_request.is_json_output:
                                    chunk_response.output = chunk_delta
                                    yield chunk_response.model_dump_json() + "\n"
                        except Exception as chunk_exc:
                            log_exception(logger, chunk_exc, f"[STREAMING] Failed to parse DeepInfra stream chunk: {chunk_exc}")
        except Exception as e:
            log_exception(logger, e, "DeepInfra provider stream error")
            yield f"Failed to generate response: {e}"
            
    # Helper: Create request payload and headers
    def _create_request_payload_and_headers(self, llm_request: LLMRequest) -> tuple:

        # Convert LLMMessage objects to dicts if input is a list
        if isinstance(llm_request.input, str):
            messages = [{"role": "user", "content": [{ "type": "text", "text": llm_request.input }]}]
        elif isinstance(llm_request.input, list):
            messages = [msg.model_dump() if hasattr(msg, 'model_dump') else msg for msg in llm_request.input]
        else:
            raise ValueError("Invalid input format. Must be string or list of messages.")

         # Add base64 files if any are provided
        if llm_request.files:
            for file_data in llm_request.files:
                # If file_data is a URL (assuming it's a string), fetch file content from URL
                if isinstance(file_data, str):
                    mime_type, encoded_content = FileUtils.get_file_data_from_url(file_data)
                    filename = file_data.split('/')[-1]  # Extract filename from URL
                else:
                    mime_type = file_data.mime_type
                    encoded_content = file_data.encoded_content
                    filename = getattr(file_data, "filename", "file")  # Use provided filename or default

                # Ensure mime_type and encoded_content are valid
                if mime_type and encoded_content:
                    # Handle image files (JPEG, PNG, GIF, etc.)
                    if mime_type.startswith("image/"):
                        messages[0]["content"].append({
                            "type": "input_image",
                            "image_url": f"data:{mime_type};base64,{encoded_content}"
                        })

                    # Handle other file types (PDF, DOCX, CSV, TXT, JSON, etc.)
                    else:
                        messages[0]["content"].append({
                            "type": "input_file",
                            "filename": filename,
                            "file_data": f"data:{mime_type};base64,{encoded_content}"
                        })

        # Build request payload and headers
        request_payload = {
            "model": llm_request.model,
            "messages": messages,
            "temperature": llm_request.temperature,
            "top_p": llm_request.top_p,
            # Has to set this default supported max_tokens value since it is an required input from deepinfra side; 
            # can be overridden below if provided in the request
            # Even if deepinfra supports documentation says it can handle up to 1000000 tokens, but when we tested above 16000 tokens it failed.
            "max_tokens": 16000,  
            "stream": llm_request.stream
        }
        request_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # TODO: If is_json_output is True, set the format to JSON Mode
        if llm_request.is_json_output:
            request_payload["response_format"] = "json"
            
        # TODO: If json_schema is provided, update the format to json_schema
        if llm_request.json_schema:
            request_payload["response_format"] = json.loads(llm_request.json_schema) if isinstance(llm_request.json_schema, str) else llm_request.json_schema
        
        # If max_output_tokens is provided, include it in the payload
        if llm_request.max_output_tokens:
            request_payload["max_tokens"] = llm_request.max_output_tokens       

        # Return both payload and headers
        return request_payload, request_headers
    
    # Helper: Create llm_response object with default values
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
     
    # Helper: Create final llm_response object with actual values
    def _create_final_llm_response(self, llm_request:LLMRequest, default_llm_response_obj: LLMResponse, start_time: float, output: str, jwt: str, response_data) -> LLMResponse: 
        # Create a copy of the default llm_response_obj
        llm_response = default_llm_response_obj   
        
        # End Time. To Get total time taken for LLM response
        end_time = time.perf_counter()
        
        # Get usage and finish_reason from DeepInfra response
        usage = response_data.get("usage", {})
        finish_reason = response_data.get("choices", [])[0].get("finish_reason", "")
        
        # Update llm_response with actual values
        llm_response.output = output
        llm_response.status = self._map_deepinfra_finish_reason_to_status(finish_reason)
        llm_response.finish_reason = self._map_deepinfra_finish_reason_to_finish_reason(finish_reason)
        llm_response.created_on = datetime.fromtimestamp(response_data.get("created", 0), tz=timezone.utc)
        llm_response.time_taken = round(end_time - start_time, 2)
        llm_response.input_tokens = usage.get("prompt_tokens", 0)
        llm_response.input_cached_tokens = 0 # DeepInfra does not provide cached tokens info
        llm_response.output_tokens = usage.get("completion_tokens", 0)
        llm_response.output_reasoning_tokens = 0 # DeepInfra does not provide reasoning tokens info

        # TODO: Uncomment the code and update the ServiceType to reflect the correct services (e.g., "CustomInputService" and "CustomOutputService")
        # # If not BYOK and credential_id is present, post the credit usage
        # if not llm_request.is_byok_enabled and llm_request.credential_id:
        #    # Prepare the credit usage data
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
        #             "ServiceType": "CustomOutputService",
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
        #         credit_manager.post_credit_usage(task="deepinfra", request=credit_usage_data, jwt=jwt)
        #         logger.info(f"Successfully posted credit usage data for request ID {llm_request.ref_id}.")
        #     except Exception as e:
        #         logger.error(f"Failed to post credit usage data for request ID {llm_request.ref_id}. Error: {str(e)}")
        #         raise HTTPException(status_code=500, detail=f"Failed to post credit usage: {str(e)}")
        
        # Return the final llm_response
        return llm_response

    # Helper: Map DeepInfra finish_reason to LLMResponse status
    def _map_deepinfra_finish_reason_to_status(self, finish_reason: str) -> str:
        mapping = {
            "stop": "completed",
            "length": "incomplete",
            "tool_calls": "tool_calls",
            "content_filter": "content_filter",
            "error": "failed",
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

    # Helper: Map DeepInfra finish_reason to LLMResponse finish_reason compatible with OpenAI finish_reason
    def _map_deepinfra_finish_reason_to_finish_reason(self, finish_reason: str) -> str:
        mapping = {
            "length": "max_output_tokens",
        }
        
        return mapping.get(finish_reason, None)