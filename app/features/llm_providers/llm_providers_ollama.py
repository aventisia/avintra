# Ollama LLM Provider implementation
import json
import time
import httpx
from app.core.config import settings
from app.core.logger import log_exception, logger
from app.features.llm_providers.llm_providers_schemas import LLMChunkResponse, LLMRequest, LLMResponse
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from .llm_providers_base import BaseLLMProvider
from datetime import datetime
from app.features.llm_providers.llm_job_manager import active_llm_jobs

class OllamaProvider(BaseLLMProvider):
    # Constructor: To initialize API URL and key
    def __init__(self, api_url: str = settings.OLLAMA_API_URL, api_key: str = settings.OLLAMA_API_KEY):
        self.api_url = api_url
        self.api_key = api_key

    # Method: Generate a response from the LLM
    async def generate_llm_response(self, request: LLMRequest):
        logger.info(f"[NO STREAMING] Prompt sent to Ollama provider with model: {request.model}")
        
        # Initialize
        response_data = {}
        default_llm_response_obj = self.create_initial_llm_response_with_defaults(request)
        start_time = time.perf_counter()

        # Get request payload and headers
        request_payload, request_headers = self.create_request_payload_and_headers(request)
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send request to Ollama API
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
                    output = extract_json_from_llm_response(response_data.get("message", {}).get("content", ""))
                else:
                    output = response_data.get("message", {}).get("content", "")
                    
                # Return final llm response
                return self.create_final_llm_response(default_llm_response_obj, start_time, output, response_data)
                
        except Exception as e:
            log_exception(logger, e, "Ollama llm transactional request error: ", response_data.get('error', '')) # TODO: response_data may not have 'error' key. Not clearly documented in Ollama API docs.
            default_llm_response_obj.error = f"Failed to generate response: {e}"
            return default_llm_response_obj

    # Method: Streaming response generator for Ollama
    async def stream_llm_response(self, request: LLMRequest, job_id: str):
        logger.info(f"[STREAMING] Prompt sent to Ollama provider with model: {request.model}")
        
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
        
        # Send streaming request to Ollama API
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
                    
                    # Stream response lines from Ollama API
                    async for line in response.aiter_lines():
                        # Check for job cancellation
                        if job_id not in active_llm_jobs:
                            logger.info(f"Job {job_id} cancelled. Stopping OpenAI stream.")
                            break
                        
                        # Skip empty lines
                        if not line.strip():
                            continue
                        
                        # Get content from chunk and yield as LLMChunkResponse
                        try:
                            # Parse JSON line and get chunk content
                            chunk = json.loads(line)
                            is_done = chunk.get("done", False)
                            chunk_content = chunk.get("message", {}).get("content", "")
                            
                            # Break if done and yield the final llm response
                            if is_done:
                                output = extract_json_from_llm_response(buffer_output) if request.is_json_output else ""
                                final_llm_response = self.create_final_llm_response(default_llm_response_obj, start_time, output, chunk)
                                yield final_llm_response.model_dump_json() + "\n"
                                break
                            
                            # Stream chunk content if available
                            if chunk_content:
                                buffer_output += chunk_content # Accumulate output in buffer for json/structured output
                                if not request.is_json_output:
                                    chunk_response.output = chunk_content
                                    yield chunk_response.model_dump_json() + "\n"
                        except Exception as chunk_exc:
                            logger.warning(f"[STREAMING] Failed to parse stream chunk: {chunk_exc}")
        except Exception as e:
            log_exception(logger, e, "Ollama provider stream error")
            yield f"Failed to generate response: {e}"
            
    # Helper: Create request payload and headers
    def create_request_payload_and_headers(self, request: LLMRequest) -> tuple:
        
        # Convert LLMMessage objects to dicts if input is a list
        if isinstance(request.input, str):
            messages = [{"role": "user", "content": request.input}]
        elif isinstance(request.input, list):
            messages = [msg.model_dump() if hasattr(msg, 'model_dump') else msg for msg in request.input]
        else:
            raise ValueError("Invalid input format. Must be string or list of messages.")
        
        # Build request payload and headers
        request_payload = {
            "model": request.model,
            "messages": messages,
            "options": {
                "temperature": request.temperature,
                "top_p": request.top_p
            },
            "stream": request.stream
        }
        request_headers = {
            "Content-Type": "application/json"
        }
        
        # If API key is set, include it in headers
        if self.api_key:
            request_headers["API-KEY"] = self.api_key
            
        # If is_json_output is True, set the format to JSON Mode
        if request.is_json_output:
            request_payload["format"] = "json"
            
        # If json_schema is provided, update the format to json_schema
        if request.json_schema:
            request_payload["format"] = json.loads(request.json_schema) if isinstance(request.json_schema, str) else request.json_schema
        
        # If max_output_tokens is provided, include it in the payload
        if request.max_output_tokens:
            request_payload["options"]["num_predict"] = request.max_output_tokens       

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
        
        # Get created_at from response and convert to datetime
        created_at_datetime = datetime.fromisoformat(response_data.get("created_at").replace('Z', '+00:00'))
        
        # Get ollama done_reason
        done_reason = response_data.get("done_reason") if response_data.get("done_reason") else None
        
        # Update llm_response with actual values
        llm_response.output = output
        llm_response.status = self.map_ollama_done_reason_to_status(done_reason)
        llm_response.finish_reason = self.map_ollama_done_reason_to_finish_reason(done_reason)
        llm_response.created_on = created_at_datetime.strftime('%Y-%m-%d %H:%M:%S')
        llm_response.time_taken = round(end_time - start_time, 2)
        llm_response.input_tokens = response_data.get("prompt_eval_count", 0)
        llm_response.input_cached_tokens = 0 # Ollama does not provide cached tokens info
        llm_response.output_tokens = response_data.get("eval_count", 0)
        llm_response.output_reasoning_tokens = 0 # Ollama does not provide reasoning tokens info
        
        # Return the final llm_response
        return llm_response

    # Helper: Map Ollama done_reason to LLMResponse status
    def map_ollama_done_reason_to_status(self, done_reason: str) -> str:
        mapping = {
            "stop": "completed",
            "length": "incomplete",
            "error": "failed",
            "cancelled": "cancelled"
        }
        return mapping.get(done_reason, "incomplete")
    
    # Helper: Map ollama done_reason to LLMResponse finish_reason compatible with OpenAI finish_reason
    def map_ollama_done_reason_to_finish_reason(self, done_reason: str) -> str:
        mapping = {
            "length": "max_output_tokens",
        }
        return mapping.get(done_reason, None)