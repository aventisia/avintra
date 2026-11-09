"""HTTP endpoint that bootstraps one LiveKit voice session."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.core.logger import logger
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

from .schemas import VoiceSessionRequest, VoiceSessionResponse
from .service import VoiceSessionError, create_session

router = APIRouter()


@router.post("/v2/voice/sessions", response_model=VoiceSessionResponse)
async def create_voice_session(
    request: VoiceSessionRequest,
    user: User = Depends(authorize()),
) -> VoiceSessionResponse:
    """Creates the LiveKit room, worker dispatch, and caller token for one session."""

    try:
        return await create_session(request, user)
    except VoiceSessionError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except Exception as error:
        logger.warning("[voice-session] LiveKit request failed", exc_info=True)
        raise HTTPException(status_code=502, detail="Voice session could not be created.") from error
