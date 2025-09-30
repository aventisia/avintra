# Base interface for LLM providers
from abc import ABC, abstractmethod
from app.features.llm_providers.llm_providers_schemas import LLMRequest


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_llm_response(self, request: LLMRequest):
        """
        Generate a transactional (non-stream) response. Returns the complete answer in one go.
        For extraction or other single-shot tasks.
        """
        pass