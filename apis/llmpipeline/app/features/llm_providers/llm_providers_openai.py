# OpenAI LLM Provider implementation. Watch YT video for details on OpenAI new Responses APIs: https://www.youtube.com/watch?v=0pGxoubWI6s
import json
import time
from app.features.llm_providers.services.tool_execution_service import ToolExecutionService
from app.features.llm_providers.services.tool_schema_generator_service import ToolSchemaGeneratorService
from app.features.llm_providers.services.tool_call_extractor import ToolCallExtractor
from app.features.auth.authenticated_user import User
import httpx
from datetime import datetime, timezone
from app.core.config import settings
from app.core.logger import log_exception, logger
from app.features.llm_providers.llm_providers_schemas import EmbeddingRequest, EmbeddingResponse, LLMChunkResponse, LLMRequest, LLMResponse
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from .llm_providers_base import BaseLLMProvider
from app.features.llm_providers.llm_job_manager import active_llm_jobs
from fastapi import HTTPException
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService
from app.utils.file_converter_utils import file_to_base64

class OpenAIProvider(BaseLLMProvider):
    # Constructor: To initialize API URL and key
    def __init__(self, api_url: str = settings.OPENAI_API_URL, api_key: str = settings.OPENAI_API_KEY):
        self.api_url = api_url
        self.api_key = api_key

    # Method: Generate a response from the LLM
    async def generate_llm_response(self, llm_request: LLMRequest, user: User):
        logger.info(f"[NO STREAMING] Prompt sent to OpenAI provider with model: {llm_request.model}")
        
        # Handle BYOK (Bring Your Own Key) if enabled
        if llm_request.is_byok_enabled and llm_request.credential_id:
            vault_manager = VaultManager()

            # Fetch the credentials from the vault using the credential ID and JWT
            logger.info(f"Fetching credentials from vault for credential_id: {llm_request.credential_id}")
            credential = vault_manager.get_vault_secret_by_id(vault_secret_id=llm_request.credential_id, jwt=user.access_token)

            if credential:
                # Update the API URL and key from the vault credentials
                self.api_url = credential.get('data', {}).get('Url')
                self.api_key = credential.get("data", {}).get("ApiKey")
                logger.info("BYOK credentials successfully applied.")
            else:
                logger.error(f"BYOK enabled but no valid credentials found for credential_id: {llm_request.credential_id}")
                raise HTTPException(status_code=400, detail="No valid credentials found for the provided credential_id.")
        else:
            # If BYOK is not enabled, check the user's credits
            credential_manager = CreditManagerService()

            if not credential_manager.has_sufficient_credits(task="openai", jwt=user.access_token):
                logger.warning(f"Insufficient credits for OpenAI task, user: {user.username}")
                raise HTTPException(status_code=400, detail="Insufficient credits to continue. Please top up your credits.")

        # Initialize
        response_data = {}
        default_llm_response_obj = self._create_initial_llm_response_with_defaults(llm_request)
        start_time = time.perf_counter()
        
        # Get request payload and headers
        request_payload, request_headers = self._create_request_payload_and_headers(llm_request, user)
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send request to OpenAI API
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.api_url.rstrip('/')}/responses",
                    json=request_payload,
                    headers=request_headers,
                )
                
                # Handle response
                response.raise_for_status()
                response_data = response.json()

                raw_output = None

                tool_calls = (
                    ToolCallExtractor.extract_openai_tool_calls(
                        response_data
                    )
                )

                if tool_calls:

                    tool_outputs = (
                        await ToolExecutionService.execute_tool_calls(
                            tool_calls,
                            llm_request,
                            user
                        )
                    )
                    
                    # # Build tool response text
                    # raw_msg = "\n".join(
                    #     f"Tool {o.get('call_id')} returned: {json.loads(o.get('output', '{}'))}"
                    #     for o in tool_outputs
                    # )

                    # tool_response = {
                    #     "role": "assistant",
                    #     "content": [{"type": "output_text", "text": raw_msg}]
                    # }

                    # # Merge original input with tool response
                    # # If original input is a list of messages
                    # original_input = request_payload.get("input", [])
                    # if isinstance(original_input, list):
                    #     merged_input = original_input + [tool_response]
                    # else:
                    #     # fallback if input is a single dict
                    #     merged_input = [original_input, tool_response]

                    # # Prepare continuation payload
                    # continuation_payload = {
                    #     "model": llm_request.model,
                    #     "input": merged_input,
                    #     "stream": False
                    # }

                    # response_data = await self._post_response(
                    #     client,
                    #     continuation_payload,
                    #     request_headers
                    # )
                                    
                    # Store raw tool outputs directly
                    raw_output = tool_outputs

                else:
                    # Extract output text using robust helper method
                    raw_output = self._extract_output_text_from_response(
                        response_data
                    )
                
                # Log response data for debugging (pretty-printed for readability)
                logger.info(f"OpenAI response data:\n{json.dumps(response_data, indent=2)}")
                # Handle is_json_output if requested
                output = extract_json_from_llm_response(raw_output) if llm_request.is_json_output else raw_output
                
                # Return final llm response
                return self._create_final_llm_response(llm_request, default_llm_response_obj, start_time, output, user.access_token, response_data)
        except Exception as e:
            log_exception(logger, e, "OpenAI llm transactional request error: ", response_data.get('error', ''))
            default_llm_response_obj.error = f"Failed to generate response: {e}"

            return default_llm_response_obj

    # Method: Streaming response generator for OpenAI
    async def stream_llm_response(self, llm_request: LLMRequest, job_id: str, user: User):
        logger.info(f"[STREAMING] Prompt sent to OpenAI provider with model: {llm_request.model}")

        # Handle BYOK (Bring Your Own Key) if enabled
        if llm_request.is_byok_enabled and llm_request.credential_id:
            vault_manager = VaultManager()

            # Fetch the credentials from the vault using the credential ID and JWT
            logger.info(f"Fetching credentials from vault for credential_id: {llm_request.credential_id}")
            credential = vault_manager.get_vault_secret_by_id(vault_secret_id=llm_request.credential_id, jwt=user.access_token)

            if credential:
                # Update the API URL and key from the vault credentials
                self.api_url = credential.get("data", {}).get("Url")
                self.api_key = credential.get("data", {}).get("ApiKey")
                logger.info("BYOK credentials successfully applied.")
            else:
                logger.error(f"BYOK enabled but no valid credentials found for credential_id: {llm_request.credential_id}")
                raise HTTPException(status_code=400, detail="No valid credentials found for the provided credential_id.")
        else:
            # If BYOK is not enabled, check the user's credits
            credential_manager = CreditManagerService()

            if not credential_manager.has_sufficient_credits(task="openai", jwt=user.access_token):
                logger.warning(f"Insufficient credits for OpenAI task, user: {user.username}")
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
        
        # Send streaming request to OpenAI API
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.api_url.rstrip('/')}/responses",
                    json=request_payload,
                    headers=request_headers,
                ) as response:
                    # Handle response
                    response.raise_for_status()
                    
                    # Stream response lines from OpenAI API
                    async for line in response.aiter_lines():
                        # Check for job cancellation
                        if job_id not in active_llm_jobs:
                            logger.info(f"Job {job_id} cancelled. Stopping OpenAI stream.")
                            break
                        
                        # Process each line
                        line = line.strip()
                        if not line.startswith("data:"):
                            continue  # Skip event lines and others

                        # Get content from chunk and yield as LLMChunkResponse
                        try:
                            json_str = line[len("data:"):].strip() # Remove the 'data:' prefix
                            chunk = json.loads(json_str)
                            chunk_delta = chunk.get("delta", "")
                            event_type = chunk.get("type")
                            
                            # Adjust event_type to remove "response." prefix if present
                            if event_type and event_type.startswith("response."):
                                event_type = event_type.replace("response.", "")
                            
                            # Break if completed and yield the final llm response
                            if event_type in ("completed", "incomplete", "failed"):
                                full_response = chunk.get("response", {})
                                
                                # Extract output text using robust helper method
                                raw_output = self._extract_output_text_from_response(full_response)
                                
                                # Handle is_json_output if requested
                                output = extract_json_from_llm_response(raw_output) if llm_request.is_json_output else raw_output
                                
                                final_llm_response = self._create_final_llm_response(llm_request, default_llm_response_obj, start_time, output, user.access_token, full_response)
                                yield final_llm_response.model_dump_json() + "\n"
                                break
                            
                            # Stream chunk delta if available
                            if event_type == "output_text.delta" and chunk_delta:
                                buffer_output += chunk_delta # Accumulate output in buffer for json/structured output
                                if not llm_request.is_json_output:
                                    chunk_response.output = chunk_delta
                                    yield chunk_response.model_dump_json() + "\n"
                        except Exception as chunk_exc:
                            log_exception(logger, chunk_exc, f"[STREAMING] Failed to parse OpenAI stream chunk: {chunk_exc}")
        except Exception as e:
            log_exception(logger, e, "OpenAI provider stream error")
            yield f"Failed to generate response: {e}"
            
    # async def _post_response(
    #         self,
    #         client: httpx.AsyncClient,
    #         payload: dict,
    #         headers: dict,
    #     ) -> dict:

    #         response = await client.post(
    #             f"{self.api_url}/responses",
    #             json=payload,
    #             headers=headers,
    #         )

    #         response.raise_for_status()

    #         return response.json()
    
    # Helper: Create request payload and headers
    def _create_request_payload_and_headers(self, llm_request: LLMRequest, user: User=None) -> tuple:
        
        # Convert LLMMessage objects to dicts if input is a list
        if isinstance(llm_request.input, str):
            input_serialized = [{"role": "user", "content": [{"type": "input_text", "text": llm_request.input}]}]
        elif isinstance(llm_request.input, list):
            input_serialized = [msg.model_dump() if hasattr(msg, 'model_dump') else msg for msg in llm_request.input]
        else:
            raise ValueError("Invalid input format. Must be string or list of messages.")

        if llm_request.tools:

            has_system_prompt = any(
                msg.get("role") == "assistant"
                for msg in input_serialized
            )

            if not has_system_prompt:

                input_serialized.insert(0, {
                    "role": "assistant",
                    "content": "if you don't know the answer, say you don't know. try to get from context if not ask user required arguments if not provided. use tools only when necessary."
                })
                
        # Build request payload and headers
        request_payload = {
            "model": llm_request.model,
            "input": input_serialized, # Can be string or list of messages (as dicts)
            "temperature": llm_request.temperature,
            "top_p": llm_request.top_p,
            "stream": llm_request.stream,
            "store": False # Disabling openai parameter to store the generated model response for later retrieval via API.
        }

        if llm_request.tools:
            request_payload["tools"] = (
                ToolSchemaGeneratorService.generate_tools(
                    llm_request.tools
                )              
            )
            
        request_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # If json_schema is provided, set up text as per OpenAI API
        if llm_request.json_schema:
            schema = json.loads(llm_request.json_schema) if isinstance(llm_request.json_schema, str) else llm_request.json_schema
            request_payload["text"] = {
                "format": {
                    "type": "json_schema",
                    "name": "strict_json_schema",
                    "schema": schema,
                    "strict": True
                }
            }
            
        # If max_output_tokens is provided and greater than 0 (in python 0 is falsy), include it in the payload
        if llm_request.max_output_tokens:
            request_payload["max_output_tokens"] = llm_request.max_output_tokens
        
        # Add base64 files if any are provided
        if llm_request.files:
            # Iterate through the files provided in llm_request.files
            for file_data in llm_request.files:
                # Convert to base64 URI
                base64_uri = file_to_base64(file_data)
                if not base64_uri:
                    continue  # skip invalid files

                # Add to payload
                if base64_uri.startswith("data:image/"):
                    request_payload["input"][0]["content"].append({
                        "type": "input_image",
                        "image_url": base64_uri
                    })
                else:
                    # Simplified filename
                    filename = getattr(file_data, "filename", "file_from_base64")
                    request_payload["input"][0]["content"].append({
                        "type": "input_file",
                        "filename": filename,
                        "file_data": base64_uri
                    })

        # Return both payload and headers
        return request_payload, request_headers
    
    # Helper: Extract output text from OpenAI response structure
    def _extract_output_text_from_response(self, response_data: dict) -> str:
        """
        Robustly extract text from OpenAI response by finding the output with type 'message'
        and content with type 'output_text', regardless of their position in the arrays.
        """
        output_array = response_data.get("output", [])
        
        # Find the message object in the output array
        for output_item in output_array:
            if output_item.get("type") == "message":
                content_array = output_item.get("content", [])
                
                # Find the output_text object in the content array
                for content_item in content_array:
                    if content_item.get("type") == "output_text":
                        return content_item.get("text", "")
        
        # Fallback: return empty string if structure not found
        logger.warning("Could not find output_text in OpenAI response structure")
        return ""
    
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
    def _create_final_llm_response(self, llm_request: LLMRequest, default_llm_response_obj: LLMResponse, start_time: float, output: str,jwt: str, response_data) -> LLMResponse: 
        # Create a copy of the default llm_response_obj
        llm_response = default_llm_response_obj   
        
        # End Time. To Get total time taken for LLM response
        end_time = time.perf_counter()
        
        # Get token usage details and incomplete_details if available
        usage = response_data.get("usage", {})
        incomplete_details = response_data.get("incomplete_details") or {}
        
        # Update llm_response with actual values
        llm_response.output = output
        llm_response.status = response_data.get("status")
        llm_response.finish_reason = incomplete_details.get("reason", None)
        llm_response.created_on = datetime.fromtimestamp(response_data.get("created_at"), tz=timezone.utc)
        llm_response.time_taken = round(end_time - start_time, 2)
        llm_response.input_tokens = usage.get("input_tokens", 0)
        llm_response.input_cached_tokens = usage.get("input_tokens_details", {}).get("cached_tokens", 0)
        llm_response.output_tokens = usage.get("output_tokens", 0)
        llm_response.output_reasoning_tokens = usage.get("output_tokens_details", {}).get("reasoning_tokens", 0)
        
        # If BYOK is not enabled and credential_id is not provided, post credit usage to CreditManagerService
        if not llm_request.is_byok_enabled and not llm_request.credential_id:
            credit_usage_data = self._build_gpt_credit_usage(llm_request, llm_response)

            # Initialize the CreditManagerService
            credit_manager = CreditManagerService()

            # Post the credit usage data
            try:
                credit_manager.post_credit_usage(task="openai", request=credit_usage_data, jwt=jwt)
                logger.info(f"Successfully posted credit usage data for request ID {llm_request.ref_id}.")
            except Exception as e:
                logger.error(f"Failed to post credit usage data for request ID {llm_request.ref_id}. Error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to post credit usage: {str(e)}")
        
        # Return the final llm_response
        return llm_response
    
    def _build_gpt_credit_usage(self, llm_request: LLMRequest, llm_response: LLMResponse):
        """
        Build credit usage specifically for GPT models.

        - Maps model_name → CreditServiceTypesEnum
        - Handles missing/invalid token values safely
        - Supports future models via fallback
        """

        # Normalize model name
        model_name = (llm_request.model or "").strip().lower()

        # Safe token extraction
        input_tokens = max(getattr(llm_response, "input_tokens", 0) or 0, 0)
        output_tokens = max(getattr(llm_response, "output_tokens", 0) or 0, 0)
        cached_tokens = max(getattr(llm_response, "input_cached_tokens", 0) or 0, 0)

        # 3GPT Model → Enum Mapping
        # IMPORTANT: Must match backend enum exactly
        GPT_MODEL_MAP = {
            "gpt-4o-mini": {
                "input": "Gpt4oMiniInput",
                "output": "Gpt4oMiniOutput",
                "cache": "Gpt4oMiniCached",
            },
            "gpt-4o": {
                "input": "Gpt4oInput",
                "output": "Gpt4oOutput",
                "cache": "Gpt4oCached",
            },
            "gpt-5.1": {
                "input": "Gpt51Input",
                "output": "Gpt51Output",
                "cache": "Gpt51Cached",
            },
            "gpt-5-mini": {
                "input": "Gpt5MiniInput",
                "output": "Gpt5MiniOutput",
                "cache": "Gpt5MiniCached",
            },
            "gpt-5-nano": {
                "input": "Gpt5NanoInput",
                "output": "Gpt5NanoOutput",
                "cache": "Gpt5NanoCached",
            },
        }

        # Resolve service mapping 
        # Priority: exact match → safe prefix match
        service_map = GPT_MODEL_MAP.get(model_name)

        if not service_map:
            for key, value in GPT_MODEL_MAP.items():
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

        # Helper to build entry (DRY)
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
    

    # Method: Generate embeddings from OpenAI
    async def generate_embeddings(self, embedding_request: EmbeddingRequest, user: User):
        logger.info(f"[EMBEDDING] Request sent to OpenAI provider with model: {embedding_request.model}")

        # Handle BYOK (Bring Your Own Key)
        if embedding_request.is_byok_enabled and embedding_request.credential_id:
            vault_manager = VaultManager()

            logger.info(f"Fetching credentials from vault for credential_id: {embedding_request.credential_id}")
            credential = vault_manager.get_vault_secret_by_id(
                vault_secret_id=embedding_request.credential_id,
                jwt=user.access_token
            )

            if credential:
                self.api_url = credential.get('data', {}).get('Url')
                self.api_key = credential.get("data", {}).get("ApiKey")
                logger.info("BYOK credentials successfully applied.")
            else:
                logger.error("Invalid BYOK credential_id")
                raise HTTPException(status_code=400, detail="No valid credentials found.")
        else:
            credit_manager = CreditManagerService()
            if not credit_manager.has_sufficient_credits(task="openai", jwt=user.access_token):
                logger.warning(f"Insufficient credits for embeddings, user: {user.username}")
                raise HTTPException(status_code=400, detail="Insufficient credits.")

        # Initialize
        start_time = time.perf_counter()
        response_data = {}

        # Build request payload
        request_payload = {
            "model": embedding_request.model,
            "input": embedding_request.input,
            "encoding_format": embedding_request.encoding_format
        }

        # Optional params
        if embedding_request.dimensions:
            request_payload["dimensions"] = embedding_request.dimensions

        request_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        timeout = httpx.Timeout(300.0)

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.api_url.rstrip('/')}/embeddings",
                    json=request_payload,
                    headers=request_headers
                )

                response.raise_for_status()
                response_data = response.json()

                # Extract embeddings
                embeddings = [item["embedding"] for item in response_data.get("data", [])]

                # Build response
                end_time = time.perf_counter()

                embedding_response = EmbeddingResponse(
                    provider=embedding_request.provider,
                    model=embedding_request.model,
                    embeddings=embeddings,
                    created_on=datetime.now(timezone.utc),
                    time_taken=round(end_time - start_time, 2),
                    input_tokens=response_data.get("usage", {}).get("total_tokens", 0),
                    is_byok_enabled=embedding_request.is_byok_enabled,
                    credential_id=embedding_request.credential_id,
                    status="completed"
                )

                # Credit consumption (same pattern as LLM)
                if not embedding_request.is_byok_enabled and not embedding_request.credential_id:
                    credit_usage = self._build_embedding_credit_usage(
                        embedding_request,
                        embedding_response
                    )

                    credit_manager = CreditManagerService()
                    try:
                        credit_manager.post_credit_usage(
                            task="openai",
                            request=credit_usage,
                            jwt=user.access_token
                        )
                        logger.info("Embedding credit usage posted successfully.")
                    except Exception as e:
                        logger.error(f"Failed to post embedding credit usage: {str(e)}")
                        raise HTTPException(status_code=500, detail="Credit usage failed")

                return embedding_response

        except Exception as e:
            log_exception(logger, e, "OpenAI embedding error", response_data.get('error', ''))

            return EmbeddingResponse(
                provider=embedding_request.provider,
                model=embedding_request.model,
                embeddings=[],
                status="failed",
                error=str(e)
            )
        
    def _build_embedding_credit_usage(
        self,
        embedding_request: EmbeddingRequest,
        embedding_response: EmbeddingResponse
    ):
        """
        Build credit usage payload for embedding requests.

        - Maps model name → internal ServiceType
        - Uses input token count as consumed units
        - Falls back to PascalCase conversion if model is unknown
        - Does NOT assign any default ServiceType if model is empty/invalid
        """

        # Normalize model name to avoid case / whitespace issues
        model_name = (embedding_request.model or "").strip().lower()

        # Ensure token count is always a non-negative integer
        input_tokens = max(embedding_response.input_tokens or 0, 0)

        # Known model → ServiceType mapping
        # Extend this dictionary when adding new supported models
        EMBEDDING_MODEL_MAP = {
            "text-embedding-ada-002": "OpenAIEmbeddingAda002",
            "text-embedding-3-small": "OpenAIEmbedding3Small",
            "text-embedding-3-large": "OpenAIEmbedding3Large",
        }

        # Try resolving ServiceType from predefined mapping
        service_type = EMBEDDING_MODEL_MAP.get(model_name)

        # Build and return credit usage payload
        return [{
            "ServiceType": service_type,
            "ConsumedUnit": input_tokens,
            "RefType": embedding_request.reference_type,
            "RefId": embedding_request.reference_id,
            "RefName": embedding_request.reference_name,
            "Action": embedding_request.action,
            "TriggeredByAgent": None
        }]