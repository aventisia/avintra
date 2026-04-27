# Provider factory to select correct provider
from .llm_providers_openai import OpenAIProvider
from .llm_providers_ollama import OllamaProvider
from .llm_providers_deepinfra import DeepInfraProvider
from .llm_providers_gemini import GeminiProvider
from .llm_providers_open_router import OpenRouterProvider
from .llm_providers_anthropic import AnthropicProvider

LLM_PROVIDER_MAP = {
    'openai': OpenAIProvider,
    'ollama': OllamaProvider,
    'deepinfra': DeepInfraProvider,
    'googlegemini': GeminiProvider,
    'openrouter': OpenRouterProvider,
    'anthropic': AnthropicProvider
}

def get_llm_provider(provider_name: str):
    provider_cls = LLM_PROVIDER_MAP.get(provider_name)
    if not provider_cls:
        raise ValueError(f"Unsupported provider: {provider_name}")
    return provider_cls()
