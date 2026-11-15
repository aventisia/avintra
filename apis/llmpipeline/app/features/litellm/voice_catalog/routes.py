"""API routes for provider voices and supported languages."""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User
from app.features.litellm.core.schemas import ProviderCapability

from .schemas import LanguagesResponse, VoicesResponse
from .service import voice_catalog_service

router = APIRouter(tags=["LiteLLM Voice Catalog"])


@router.get("/v2/llm/voices", response_model=VoicesResponse)
async def list_voices_route(
    provider: str,
    model: str,
    capability: ProviderCapability | None = None,
    credential_name: str | None = None,
    _user: User = Depends(authorize()),
):
    return await voice_catalog_service.list_voices(
        provider,
        model,
        capability.value if capability else None,
        credential_name,
        _user,
    )


@router.get("/v2/llm/languages", response_model=LanguagesResponse)
async def list_languages_route(
    provider: str,
    model: str,
    capability: ProviderCapability | None = None,
    credential_name: str | None = None,
    _user: User = Depends(authorize()),
):
    return await voice_catalog_service.list_languages(
        provider,
        model,
        capability.value if capability else None,
        credential_name,
        _user,
    )
