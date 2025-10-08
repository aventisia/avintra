# OpenAI LLM Provider implementation. Watch YT video for details on OpenAI new Responses APIs: https://www.youtube.com/watch?v=0pGxoubWI6s
import json
import time
import httpx
from app.core.config import settings
from app.core.logger import log_exception, logger
from app.features.llm_providers.llm_providers_schemas import LLMChunkResponse, LLMRequest, LLMResponse
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from .llm_providers_base import BaseLLMProvider

class OpenAIProvider(BaseLLMProvider):
    # Constructor: To initialize API URL and key
    def __init__(self, api_url: str = settings.OPENAI_API_URL, api_key: str = settings.OPENAI_API_KEY):
        self.api_url = api_url
        self.api_key = api_key

    # Method: Generate a response from the LLM
    async def generate_llm_response(self, request: LLMRequest):
        logger.info(f"[NO STREAMING] Prompt sent to OpenAI provider with model: {request.model}")
        
        # Initialize
        response_data = {}
        default_llm_response_obj = self.create_initial_llm_response_with_defaults(request)
        start_time = time.perf_counter()
        
        # Get request payload and headers
        request_payload, request_headers = self.create_request_payload_and_headers(request)
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send request to OpenAI API
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
                
                # Handle is_json_output if requested
                if request.is_json_output:
                    output = extract_json_from_llm_response(response_data.get("output", [{}])[0].get("content", [{}])[0].get("text", ""))
                else:
                    output = response_data.get("output", [{}])[0].get("content", [{}])[0].get("text", "")
                    
                # Return final llm response
                return self.create_final_llm_response(default_llm_response_obj, start_time, output, response_data)
        except Exception as e:
            log_exception(logger, e, "OpenAI llm transactional request error: ", response_data.get('error', ''))
            default_llm_response_obj.error = f"Failed to generate response: {e}"
            return default_llm_response_obj

    # Method: Streaming response generator for OpenAI
    async def stream_llm_response(self, request: LLMRequest):
        logger.info(f"[STREAMING] Prompt sent to OpenAI provider with model: {request.model}")
        
        # Initialize
        chunk_response = LLMChunkResponse(
            provider=request.provider,
            model=request.model,
            output=""
        )
        buffer_output = ""  # Buffer to accumulate output if is_json_output is True
        default_llm_response_obj = self.create_initial_llm_response_with_defaults(request)
        start_time = time.perf_counter()
        
        # Get request payload and headers
        request_payload, request_headers = self.create_request_payload_and_headers(request)
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send streaming request to OpenAI API
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
                    
                    # Stream response lines from OpenAI API
                    async for line in response.aiter_lines():
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
                                output = extract_json_from_llm_response(buffer_output) if request.is_json_output else ""
                                full_response = chunk.get("response", {})
                                final_llm_response = self.create_final_llm_response(default_llm_response_obj, start_time, output, full_response)
                                yield final_llm_response.model_dump_json() + "\n"
                                break
                            
                            # Stream chunk delta if available
                            if event_type == "output_text.delta" and chunk_delta:
                                buffer_output += chunk_delta # Accumulate output in buffer for json/structured output
                                if not request.is_json_output:
                                    chunk_response.output = chunk_delta
                                    yield chunk_response.model_dump_json() + "\n"
                        except Exception as chunk_exc:
                            log_exception(logger, chunk_exc, f"[STREAMING] Failed to parse OpenAI stream chunk: {chunk_exc}")
        except Exception as e:
            log_exception(logger, e, "OpenAI provider stream error")
            yield f"Failed to generate response: {e}"
            
    # Helper: Create request payload and headers
    def create_request_payload_and_headers(self, request: LLMRequest) -> tuple:
        
        # Convert LLMMessage objects to dicts if input is a list
        if isinstance(request.input, str):
            input_serialized = request.input
        elif isinstance(request.input, list):
            input_serialized = [msg.model_dump() if hasattr(msg, 'model_dump') else msg for msg in request.input]
        else:
            raise ValueError("Invalid input format. Must be string or list of messages.")
        
        # Build request payload and headers
        request_payload = {
            "model": request.model,
            "input": input_serialized, # Can be string or list of messages (as dicts)
            "temperature": request.temperature,
            "top_p": request.top_p,
            "stream": request.stream,
            "store": False # Disabling openai parameter to store the generated model response for later retrieval via API.
        }
        request_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # If json_schema is provided, set up text as per OpenAI API
        if request.json_schema:
            schema = json.loads(request.json_schema) if isinstance(request.json_schema, str) else request.json_schema
            request_payload["text"] = {
                "format": {
                    "type": "json_schema",
                    "name": "strict_json_schema",
                    "schema": schema,
                    "strict": True
                }
            }
            
        # If max_output_tokens is provided, include it in the payload
        if request.max_output_tokens:
            request_payload["max_output_tokens"] = request.max_output_tokens

        # Return both payload and headers
        return request_payload, request_headers
    
    # Helper: Create llm_response object with default values
    def create_initial_llm_response_with_defaults(self, request: LLMRequest) -> LLMResponse:
        return LLMResponse(
            provider=request.provider,
            model=request.model,
            output="",
            status=None,
            finish_reason=None,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=request.stream,
            max_output_tokens=request.max_output_tokens,
            is_json_output=request.is_json_output,
            is_byok_enabled=request.is_byok_enabled,
            credential_id=request.credential_id,
            error=None
        )
     
    # Helper: Create final llm_response object with actual values
    def create_final_llm_response(self, default_llm_response_obj: LLMResponse, start_time: float, output: str, response_data) -> LLMResponse: 
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
        llm_response.created_on = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(response_data.get("created_at")))
        llm_response.time_taken = round(end_time - start_time, 2)
        llm_response.input_tokens = usage.get("input_tokens", 0)
        llm_response.input_cached_tokens = usage.get("input_tokens_details", {}).get("cached_tokens", 0)
        llm_response.output_tokens = usage.get("output_tokens", 0)
        llm_response.output_reasoning_tokens = usage.get("output_tokens_details", {}).get("reasoning_tokens", 0)
        
        # Return the final llm_response
        return llm_response
