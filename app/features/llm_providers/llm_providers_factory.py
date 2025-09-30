# Provider factory to select correct provider
from .llm_providers_openai import OpenAIProvider

LLM_PROVIDER_MAP = {
    'openai': OpenAIProvider,
}

def get_llm_provider(provider_name: str):
    provider_cls = LLM_PROVIDER_MAP.get(provider_name)
    if not provider_cls:
        raise ValueError(f"Unsupported provider: {provider_name}")
    return provider_cls()
