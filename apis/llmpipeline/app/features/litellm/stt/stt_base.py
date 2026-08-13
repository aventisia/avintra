# Base class for Speech-to-Text providers in the LiteLLM feature.
from __future__ import annotations

from abc import ABC, abstractmethod

from ..core.schemas import STTRequest, STTResponse


class BaseSpeechToTextProvider(ABC):
    """Abstract Speech-to-Text provider.

    LiteLLM's `atranscription` is non-streaming, so only `transcribe` is
    abstract. Streaming is intentionally absent until a LiteLLM streaming path
    exists.
    """

    @abstractmethod
    async def transcribe(self, req: STTRequest, user) -> STTResponse:
        """Convert audio to text and return the full transcript."""
        raise NotImplementedError
