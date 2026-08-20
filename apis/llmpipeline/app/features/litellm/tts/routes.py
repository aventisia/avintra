# API routes for the LiteLLM Text-to-Speech capability.
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.logger import logger
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from ..core.schemas import TTSRequest, TTSResponse
from .litellm_tts_provider import LiteLLMTTSProvider

router = APIRouter(tags=["LiteLLM Text-to-Speech"])


@router.post("/v2/llm/tts/synthesize", response_model=TTSResponse)
async def synthesize_tts(
    req: TTSRequest,
    _user: User = Depends(authorize()),
):
    """Text-to-Speech via LiteLLM (non-streaming).

    Coexists with the ElevenLabs `/tts/synthesize` endpoint under a distinct
    `/v2/llm/tts/*` path.
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

        # All TTS providers (including ElevenLabs) go through LiteLLM.
        provider = LiteLLMTTSProvider()
        return await provider.synthesize(req, _user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in LiteLLM text-to-speech synthesis: {e}")
        raise HTTPException(status_code=500, detail="Error in text-to-speech synthesis.")
