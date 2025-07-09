import httpx
from typing import Any, Dict
from app.core.config import settings
from app.core.logger import logger
from app.qdrant.service import get_last_chat_turn_by_model_id, get_document_context_by_model_id  

if not settings.ollama_api_url:
    logger.warning("OLLAMA_API_URL is not set")

if not settings.ollama_api_key:
    logger.warning("OLLAMA_API_KEY is not set. Some functionality may be limited.")

class LLMService:
    """
    Service class to interact with the Ollama API for generating responses based on a provided prompt.
    """

    # Mapping model identifiers to actual model versions
    llm_model_mapper = {
        "deepseek-r1": "deepseek-r1:7b",
        "phi4": "phi4:14b",
        "llama3.1": "llama3.1:8b",
        "llama3.2": "llama3.2:3b",
        "mistral": "mistral:7b",
        "gemma": "gemma:7b",
    }

    def __init__(self, api_url: str = settings.ollama_api_url, api_key: str = settings.ollama_api_key) -> None:
        """
        Initialize the LLMService with API URL and Key.

        :param api_url: The URL for the Ollama API.
        :param api_key: The API key for authentication.
        """
        self.api_url = api_url
        self.api_key = api_key

    def resolve_model_version(self, model: str) -> str:
        """
        Resolves the provided model identifier to the corresponding model version.

        :param model: The model identifier (e.g., "gemma").
        :return: The full model version (e.g., "gemma:7b").
        """
        return self.llm_model_mapper.get(model, model)  # Returns the actual model version or the original if not found

    async def generate_response(self, prompt: str, model: str, temperature: float = 0.7) -> Dict[str, Any]:
        """
        Send a request to the Ollama API to generate a response based on a prompt.

        :param prompt: The prompt to send to the model.
        :param model: The model name (e.g., "gemma").
        :param temperature: Controls randomness in the model's response (default 0.7).
        :return: A dictionary containing the response or error message.
        """
        # Get the full model version from the mapping
        actual_model = self.resolve_model_version(model)

        payload = {
            "model": actual_model,
            "prompt": prompt,
            "temperature": temperature,
            "stream": False,  # Disable streaming for a one-time response
        }

        headers = {
            "Content-Type": "application/json",
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            # Send asynchronous POST request to Ollama API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                )

                response.raise_for_status()  # Raise error for any non-2xx status code

                logger.info(f"Request to {self.api_url} was successful: {response.status_code}")

                return response.json() 

        except httpx.RequestError as req_err:
            logger.error(f"Request failed: {str(req_err)}")  # Log request errors
            return {"error": f"Request failed: {str(req_err)}"}

        except httpx.HTTPStatusError as http_err:
            status_code = http_err.response.status_code
            logger.error(f"HTTP error {status_code}: {http_err.response.text}")
            return {"error": f"HTTP error {status_code}: {http_err.response.text}"}

        except Exception as e:
            logger.exception(f"Unexpected error: {str(e)}") 
            return {"error": f"Unexpected error: {str(e)}"}


def generate_prompt_for_ai_persona(model_id: str, user_query: str) -> str:
    """
    Generates a prompt for the AIPersona that includes:
    - Relevant document context
    - The latest chat turn (user + AI)
    - The current user query
    """

    # Step 1: Get document context
    document_context = get_document_context_by_model_id(user_query=user_query, model_id=model_id)

    # Step 2: Get last chat exchange (user + AI)
    last_chat = get_last_chat_turn_by_model_id(model_id=model_id)
    chat_history = ""
    if last_chat:
        # Rephrase to include user and AI conversation history as strings
        chat_history = f"User: {last_chat['User']}\nAIPersona: {last_chat['AIPersona']}"

    # Step 3: Combine into prompt with string response
    prompt = f"""
        You are AIPersona, an intelligent assistant with helpful insights.

        # # Context from Documents: {document_context}

        # Previous Chat (most recent): {chat_history}

        # New User Question: {user_query}
        """

    return prompt.strip()
