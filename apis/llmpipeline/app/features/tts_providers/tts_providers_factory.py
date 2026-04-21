# tts_provider_factory.py

from typing import Type, Dict
from app.features.tts_providers.tts_providers_elevenlabs import ElevenLabsTTSProvider
from app.features.tts_providers.tts_providers_base import BaseTextToSpeechProvider


# Map provider name → provider class
# Add new providers here (e.g., "google", "azure")
TTS_PROVIDER_REGISTRY: Dict[str, Type[BaseTextToSpeechProvider]] = {
    "elevenlabs": ElevenLabsTTSProvider,
}


def get_tts_provider(provider_name: str) -> BaseTextToSpeechProvider:
    """
    Return a TTS provider instance based on name.

    Input:
    - provider_name: provider key (case-insensitive)

    Output:
    - Instance of a TTS provider

    Raises:
    - ValueError if provider is missing or not supported
    """

    # Validate input
    if not provider_name:
        raise ValueError("Provider name is required")

    # Normalize (handles spaces and case)
    normalized_name = provider_name.strip().lower()

    # Get provider class from registry
    provider_cls = TTS_PROVIDER_REGISTRY.get(normalized_name)

    # Handle unsupported provider
    if not provider_cls:
        supported = ", ".join(TTS_PROVIDER_REGISTRY.keys())
        raise ValueError(
            f"Unsupported TTS provider: '{provider_name}'. "
            f"Supported providers: [{supported}]"
        )

    # Return provider instance
    return provider_cls()