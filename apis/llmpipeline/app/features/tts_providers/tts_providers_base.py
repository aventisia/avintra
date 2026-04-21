# tts_providers_base.py

from abc import ABC, abstractmethod
from typing import AsyncGenerator
from app.features.tts_providers.tts_providers_schema import (
    TTSProviderRequest,
    TTSProviderResponse,
    TTSProviderStreamChunk
)


class BaseTextToSpeechProvider(ABC):
    """
    Base class for all TTS providers (ElevenLabs, Google, Azure, etc.).

    Each provider must implement:
    - synthesize: full audio response
    - stream_synthesis: chunked audio streaming
    """

    # Non-streaming TTS
    @abstractmethod
    async def synthesize(
        self,
        tts_request: TTSProviderRequest
    ) -> TTSProviderResponse:
        """
        Generate speech from text and return full audio.

        Input:
        - tts_request: text and config (model, voice, etc.)

        Output:
        - TTSProviderResponse (base64 audio + metadata)

        Note:
        - Returns complete result (no streaming)
        """
        pass

    # Streaming TTS
    @abstractmethod
    async def stream_synthesis(
        self,
        tts_request: TTSProviderRequest,
        job_id: str
    ) -> AsyncGenerator[TTSProviderStreamChunk, None]:
        """
        Generate speech and stream audio in chunks.

        Input:
        - tts_request: text and config
        - job_id: unique stream identifier

        Yields:
        - TTSProviderStreamChunk (partial audio)

        Note:
        - Sends data progressively (real-time use)
        """
        pass