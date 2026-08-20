# Provider administration for the LLM Providers v2 feature.
#
# Provides:
#   - listing providers supported by LiteLLM (dynamic)
#   - listing models for a provider from LiteLLM (dynamic)
from __future__ import annotations

from app.features.auth.authenticated_user import User

from .litellm_service import litellm_service
from .schemas import ModelsResponse, ProvidersResponse


class ProviderAdminService:
    async def list_providers(
        self,
        capability: str | None = None,
        provider: str | None = None,
    ) -> ProvidersResponse:
        providers = await litellm_service.list_providers(
            capability=capability,
            provider=provider,
        )
        return ProvidersResponse(providers=providers, count=len(providers))

    async def list_models(
        self,
        provider: str,
        capability: str | None = None,
        credential_name: str | None = None,
        user: User | None = None,
    ) -> ModelsResponse:
        models = await litellm_service.list_models(
            provider,
            capability,
            credential_name=credential_name,
            user=user,
        )
        return ModelsResponse(provider=provider, models=models, count=len(models))


provider_admin_service = ProviderAdminService()
