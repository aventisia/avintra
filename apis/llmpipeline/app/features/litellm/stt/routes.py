# API routes for the LiteLLM Speech-to-Text capability.
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.logger import logger
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from ..core.schemas import STTRequest, STTResponse
from .litellm_stt_provider import LiteLLMSTTProvider

router = APIRouter(tags=["LiteLLM Speech-to-Text"])


@router.post("/v2/llm/stt/transcribe", response_model=STTResponse)
async def transcribe_speech_to_text(
    req: STTRequest,
    _user: User = Depends(authorize()),
):
    """Speech-to-Text via LiteLLM (non-streaming).

    Coexists with the ElevenLabs `/stt/transcribe` endpoint under a distinct
    `/v2/llm/stt/*` path.
    """
    try:
        # Normalize credential_name:
        # - Convert to string and trim surrounding whitespace.
        # - Treat None, empty strings, and whitespace-only values as "no credential".
        raw = req.credential_name
        if raw:
            cleaned = str(raw).strip()
            if cleaned:
                req.credential_name = cleaned
            else:
                req.credential_name = None
        else:
            req.credential_name = None

        # All STT providers (including ElevenLabs) go through LiteLLM.
        provider = LiteLLMSTTProvider()
        return await provider.transcribe(req, _user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in LiteLLM speech-to-text transcription: {e}")
        raise HTTPException(status_code=500, detail="Error in speech-to-text transcription.")
