# stt_provider_factory.py

from typing import Type, Dict
from app.features.stt_providers.stt_providers_elevenlabs import ElevenLabsSTTProvider
from app.features.stt_providers.stt_providers_base import BaseSpeechToTextProvider


# Map provider name → provider class
# Add new providers here (e.g., "google", "azure", "deepgram")
STT_PROVIDER_REGISTRY: Dict[str, Type[BaseSpeechToTextProvider]] = {
    "elevenlabs": ElevenLabsSTTProvider,
}


def get_stt_provider(provider_name: str) -> BaseSpeechToTextProvider:
    """
    Return an STT provider instance based on name.

    Input:
    - provider_name: provider key (case-insensitive)

    Output:
    - Instance of an STT provider

    Raises:
    - ValueError if provider is missing or not supported
    """

    # Validate input
    if not provider_name:
        raise ValueError("Provider name is required")

    # Normalize input (trim + lowercase)
    normalized_name = provider_name.strip().lower()

    # Get provider class from registry
    provider_cls = STT_PROVIDER_REGISTRY.get(normalized_name)

    # Handle unsupported provider
    if not provider_cls:
        supported = ", ".join(STT_PROVIDER_REGISTRY.keys())
        raise ValueError(
            f"Unsupported STT provider: '{provider_name}'. "
            f"Supported providers: [{supported}]"
        )

    # Return provider instance
    return provider_cls()