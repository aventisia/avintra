# stt_providers_base.py

from abc import ABC, abstractmethod
from typing import AsyncGenerator
from fastapi import Request

from app.features.stt_providers.stt_providers_schema import (
    STTProviderRequest,
    STTProviderResponse,
    STTProviderStreamChunk
)


class BaseSpeechToTextProvider(ABC):
    """
    Base class for all STT providers (Google, Azure, Deepgram, Whisper, etc.).

    Each provider must implement:
    - transcribe: full transcript (non-streaming)
    - stream_transcription: partial transcripts (streaming)
    """

    # Non-streaming STT (audio → full text)
    @abstractmethod
    async def transcribe(
        self,
        stt_request: STTProviderRequest
    ) -> STTProviderResponse:
        """
        Convert audio to text and return full transcript.

        Input:
        - stt_request: audio + config

        Output:
        - STTProviderResponse (full transcript + metadata)
        """
        pass

    # Streaming STT (audio → partial text)
    @abstractmethod
    async def stream_transcription(
        self,
        stt_request: STTProviderRequest,
        job_id: str
    ) -> AsyncGenerator[STTProviderStreamChunk, None]:
        """
        Convert audio to text and stream partial transcripts.

        Input:
        - stt_request: audio + config
        - job_id: unique stream identifier

        Yields:
        - STTProviderStreamChunk (partial transcript)

        Note:
        - Emits text progressively as audio is processed
        """
        pass