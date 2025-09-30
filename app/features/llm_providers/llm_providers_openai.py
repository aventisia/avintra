# OpenAI LLM Provider implementation
import json
import time
import httpx
from app.core.config import settings
from app.core.logger import logger
from app.features.llm_providers.llm_providers_schemas import LLMRequest, LLMResponse
from app.features.llm_providers.llm_providers_utils import extract_json_from_llm_response
from .llm_providers_base import BaseLLMProvider

class OpenAIProvider(BaseLLMProvider):

    # Constructor to initialize API URL and key
    def __init__(self, api_url: str = settings.OPENAI_API_URL, api_key: str = settings.OPENAI_API_KEY):
        self.api_url = api_url
        self.api_key = api_key

    # Generate a response from the LLM
    async def generate_llm_response(self, request: LLMRequest):
        logger.info(f"Prompt sent to OpenAI provider with model: {request.model}")
        
        # Initialize response_data & Start Time
        response_data = {}
        llm_response = LLMResponse(
            provider=request.provider,
            model=request.model,
            output="",
            temperature=request.temperature,
            top_p=request.top_p,
            is_json_output=request.is_json_output,
            is_byok_enabled=request.is_byok_enabled,
            credential_id=request.credential_id,
            error=None
        )
        start_time = time.perf_counter()
        
        # Build request payload and headers
        request_payload = {
            "model": request.model,
            "input": request.input,
            "temperature": request.temperature,
            "top_p": request.top_p,
            "stream": request.stream,
            "store": False # Disabling openai parameter to store the generated model response for later retrieval via API.
        }
        request_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        # If instructions are provided, include them in the request
        if request.instructions:
            request_payload["instructions"] = request.instructions
        
        # If json_schema is provided, include it in the request
        if request.json_schema:
            request_payload["json_schema"] = request.json_schema
            
        logger.info(f"OpenAI request payload: {request_payload}")
        
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
                
                logger.info(f"OpenAI response data: {response_data}")
                
                # Handle is_json_output if requested
                if request.is_json_output:
                    output = extract_json_from_llm_response(response_data["output"][0]["content"][0]["text"])
                else:
                    output = response_data["output"][0]["content"][0]["text"]
                    
                # End Time. Get total time taken for LLM response
                end_time = time.perf_counter()
                
                # Get token usage details if available
                usage = response_data.get("usage", {})

                # Update llm_response with actual values
                llm_response.output = output
                llm_response.time_taken = round(end_time - start_time, 2)
                llm_response.input_tokens = usage.get("input_tokens", 0)
                llm_response.input_cached_tokens = usage.get("input_tokens_details", {}).get("cached_tokens", 0)
                llm_response.output_tokens = usage.get("output_tokens", 0)
                llm_response.output_reasoning_tokens = usage.get("output_tokens_details", {}).get("reasoning_tokens", 0)
                # Return the final llm_response
                logger.info(f"Final response: {llm_response}")
                return llm_response
        except Exception as e:
            logger.error(f"OpenAI llm transactional request error: {e}, openai error: {response_data.get('error', '')}")
            llm_response.error = f"Failed to generate response: {e}"
            return llm_response