# Ollama LLM Provider implementation
import json
import time
import httpx
from app.core.config import settings
from app.core.logger import logger
from app.features.llm_providers.llm_providers_schemas import LLMRequest, LLMResponse
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from .llm_providers_base import BaseLLMProvider
from datetime import datetime

class OllamaProvider(BaseLLMProvider):
    
    # Constructor to initialize API URL and key
    def __init__(self, api_url: str = settings.OLLAMA_API_URL, api_key: str = settings.OLLAMA_API_KEY):
        self.api_url = api_url
        self.api_key = api_key

    # Generate a response from the LLM
    async def generate_llm_response(self, request: LLMRequest):
        logger.info(f"Prompt sent to Ollama provider with model: {request.model}")
        
        # Initialize
        response_data = {}
        llm_response = LLMResponse(
            provider=request.provider,
            model=request.model,
            output="",
            temperature=request.temperature,
            top_p=request.top_p,
            max_output_tokens=request.max_output_tokens,
            is_json_output=request.is_json_output,
            is_byok_enabled=request.is_byok_enabled,
            credential_id=request.credential_id,
            error=None
        )
        start_time = time.perf_counter()
        
        # Convert LLMMessage objects to dicts if input is a list
        if isinstance(request.input, str):
            messages = [{"role": "user", "content": request.input}]
        elif isinstance(request.input, list):
            messages = [msg.model_dump() if hasattr(msg, 'model_dump') else msg for msg in request.input]
        else:
            llm_response.error = "Invalid input format. Must be string or list of messages."
            return llm_response
        
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
        
        # Set a long timeout for potentially lengthy responses
        timeout = httpx.Timeout(600.0) # 10 minutes
        
        # Send request to Ollama API
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.post(
                    f"{self.api_url}/chat",
                    json=request_payload,
                    headers=request_headers,
                )
                
                # Handle response
                response.raise_for_status()
                response_data = response.json()
                
                # Handle is_json_output if requested
                if request.is_json_output:
                    output = extract_json_from_llm_response(response_data["message"]["content"])
                else:
                    output = response_data["message"]["content"]
                
                # End Time. To Get total time taken for LLM response
                end_time = time.perf_counter()
                
                # Get created_at from response and convert to datetime
                created_at_datetime = datetime.fromisoformat(response_data.get("created_at").replace('Z', '+00:00'))
                
                # Update llm_response with actual values
                llm_response.output = output
                llm_response.created_on = created_at_datetime.strftime('%Y-%m-%d %H:%M:%S')
                llm_response.time_taken = round(end_time - start_time, 2)
                llm_response.input_tokens = response_data["prompt_eval_count"]
                llm_response.input_cached_tokens = 0 # Ollama does not provide cached tokens info
                llm_response.output_tokens = response_data["eval_count"]
                llm_response.output_reasoning_tokens = 0 # Ollama does not provide reasoning tokens info
                
                # Return the final llm_response
                return llm_response
        except Exception as e:
            logger.error(f"Ollama llm transactional request error: {e}, ollama error: {response_data.get('error', '')}")
            llm_response.error = f"Failed to generate response: {e}"
            return llm_response