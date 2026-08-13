# Base class for Text-to-Speech providers in the LiteLLM feature.
from __future__ import annotations

from abc import ABC, abstractmethod

from ..core.schemas import TTSRequest, TTSResponse


class BaseTextToSpeechProvider(ABC):
    """Abstract Text-to-Speech provider.

    LiteLLM's `aspeech` is non-streaming, so only `synthesize` is abstract.
    Streaming is intentionally absent until a LiteLLM streaming path exists.
    """

    @abstractmethod
    async def synthesize(self, req: TTSRequest, user) -> TTSResponse:
        """Generate speech from text and return base64-encoded audio."""
        raise NotImplementedError
