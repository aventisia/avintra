import httpx
from app.qdrant.service import get_last_chats_by_model_id, get_document_context_by_model_id 
from typing import Any, Dict
from app.core.config import settings
from app.core.logger import logger

# Warn if required environment variables are missing
if not settings.ollama_api_url:
    logger.warning("OLLAMA_API_URL is not set")

if not settings.ollama_api_key:
    logger.warning("OLLAMA_API_KEY is not set. Some functionality may be limited.")

class LLMService:
    """
    Service class to interact with the Ollama API for generating language model responses.
    """

    # Mapping short model identifiers to their full version strings
    model_version_map = {
        "deepseek-r1": "deepseek-r1:7b",
        "phi4": "phi4:14b",
        "llama3.1": "llama3.1:8b",
        "llama3.2": "llama3.2:3b",
        "mistral": "mistral:7b",
        "gemma": "gemma:7b",
    }

    def __init__(self, api_url: str = settings.ollama_api_url, api_key: str = settings.ollama_api_key) -> None:
        """
        Initialize the LLMService with the Ollama API URL and API key.
        """
        self.api_url = api_url
        self.api_key = api_key

    def resolve_model_version(self, model_identifier: str) -> str:
        """
        Map a short model name to the actual model version.
        
        :param model_identifier: A simplified model name (e.g., "gemma").
        :return: The full model version string (e.g., "gemma:7b").
        """
        return self.model_version_map.get(model_identifier, model_identifier)

    async def generate_response(self, prompt: str, model: str, temperature: float = 0.7) -> Dict[str, Any]:
        """
        Generate a response from the Ollama LLM based on the user's prompt.

        :param prompt: The prompt/question from the user.
        :param model: The simplified model name.
        :param temperature: Controls randomness of the LLM output.
        :return: A dictionary containing either the cleaned response or an error.
        """
        model_version = self.resolve_model_version(model)

        # Step 5: Build request payload and headers
        request_payload = {
            "model": model_version,
            "prompt": prompt,
            "temperature": temperature,
            "stream": False,  # Use non-streaming response
        }

        request_headers = {
            "Content-Type": "application/json",
        }

        if self.api_key:
            request_headers["API-KEY"] = self.api_key

        # Log details of the request being sent
        logger.info(f"Sending request to LLM model: {model_version}")
        logger.debug(f"Request payload: {request_payload}")

        try:
           # Step 6: Send POST request to generate the data from the LLM
            async with httpx.AsyncClient() as client:
                api_response = await client.post(
                    f"{self.api_url}/generate",
                    json=request_payload,
                    headers=request_headers,
                )

                # Step 7: Handle response from the API
                api_response.raise_for_status()  # This raises an error if the status code is 4xx/5xx
                logger.info(f"Received response from Ollama API: {api_response.status_code}")

                # Step 8: Parse the response body
                try:
                    ollama_response = api_response.json() 
                except Exception as e:
                    logger.error(f"Error parsing JSON response: {e}")
                    return {"error": "Failed to parse JSON response."}

                # Step 9: Ensure the response contains the expected 'response' field
                if "response" not in ollama_response:
                    logger.warning("LLM response is missing the 'response' field.")
                    return {"error": "LLM response is missing the 'response' field."}
                
                # Step 10: Extract and clean the response content
                response_content = ollama_response["response"]
                cleaned_response = self._clean_llm_response(response_content)

                logger.info(f"Final cleaned LLM response: {cleaned_response}")

                # Return the cleaned response in a structured format
                return cleaned_response

        except httpx.RequestError as req_err:
            logger.error(f"Request error: {str(req_err)}")
            return {"error": f"Request failed: {str(req_err)}"}

        except httpx.HTTPStatusError as http_err:
            logger.error(f"HTTP error {http_err.response.status_code}: {http_err.response.text}")
            return {"error": f"HTTP error {http_err.response.status_code}: {http_err.response.text}"}

        except Exception as e:
            logger.exception(f"Unexpected error during LLM call: {str(e)}")
            return {"error": f"Unexpected error: {str(e)}"}

    def _clean_llm_response(self, llm_response: str) -> str:
        """
        Clean known debug or formatting tags from the LLM response.

        :param llm_response: The raw response string from the LLM.
        :return: A cleaned version of the LLM response.
        """
        # Step 10: Clean up known formatting issues
        if "<think>" in llm_response and "</think>" in llm_response:
            llm_response = llm_response.replace("<think>", "").replace("</think>", "")
            logger.info("Removed <think> tags from LLM response.")

        if "```json" in llm_response:
            llm_response = llm_response.replace("```json", "")
            logger.info("Removed ```json tag from LLM response.")

        if "```" in llm_response:
            llm_response = llm_response.replace("```", "")
            logger.info("Removed ``` tags from LLM response.")

        llm_response = llm_response.strip()  # Remove any excess whitespace
        return llm_response

def generate_prompt_for_ai_persona(model_id: str, user_query: str) -> str:
    """
    Generates a clear and relevant prompt for the AIPersona (LLM), incorporating:
    - Relevant document context based on the model ID and the user's query.
    - The most recent chat exchange (user + AI), if available.
    - The user's current query to generate an insightful response.
    
    If no previous chat is found, instructs the LLM to initiate the conversation.
    """
    # Step 1: Initialize variables
    document_context = ""
    chat_history = ""

    # Step 2: Extract relevant document context based on the model ID and user query
    raw_document_context = get_document_context_by_model_id(user_query=user_query, model_id=model_id)
    if raw_document_context:
        document_context = f"Context from Documents: {str(raw_document_context)}"

    # Step 3: Retrieve the most recent chat (user + AI), if any
    last_chat = get_last_chats_by_model_id(user_query=user_query, model_id=model_id)
    if last_chat:
        chat_history = f"Previous Conversation: {str(last_chat)}"

    # Step 4: Build the final prompt as a single string content
    prompt = (
        "You are a highly intelligent assistant with vast knowledge and insightful responses. "
        f"{document_context} "
        f"{chat_history} "
        f"Current User Query: {user_query}"
    )

    # Step 5: Return the final prompt
    return prompt.strip()
