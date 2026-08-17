# Live model discovery for on-prem Ollama.
#
# When a caller supplies an Ollama credential (BYOK), `GET /v2/llm/models`
# must report the models actually installed on the on-prem Ollama server rather
# than LiteLLM's static catalog. This module resolves the server's base URL and
# optional API key from the credential, then calls Ollama's native
# `GET {base_url}/api/tags` endpoint and maps the result onto the same
# `ModelInfo` shape the static discovery path returns.
from __future__ import annotations

import httpx
from fastapi import HTTPException

from app.core.logger import log_exception, logger
from app.core.vault_manager import VaultManager
from app.features.auth.authenticated_user import User

from .provider_registry import capability_for_model, model_metadata, normalize_provider
from .schemas import ModelInfo

# Ollama providers that discover models from a live `/api/tags` endpoint.
# These are the on-prem LiteLLM prefixes. Cloud Ollama (ollama.com) uses the
# OpenAI-compatible API and is handled by the backend's `OllamaCloud` flow.
OLLAMA_PROVIDERS = {"ollama", "ollama_chat"}

# Reasonable timeout for a tag listing on a remote on-prem server.
_OLLAMA_TAGS_TIMEOUT = httpx.Timeout(30.0)


def is_onprem_ollama(provider: str) -> bool:
    """Return True when `provider` targets an on-prem Ollama server.

    `ollama` and `ollama_chat` are the on-prem LiteLLM prefixes (they call
    `GET {base}/api/tags`). Any other provider, including a cloud-style Ollama
    host, is treated as cloud and discovered via the OpenAI-compatible API.
    """
    return normalize_provider(provider) in OLLAMA_PROVIDERS


async def discover_ollama_models(
    provider: str,
    credential_id: str,
    user: User,
) -> list[ModelInfo]:
    """Discover installed Ollama models for `provider` from a credential.

    The credential must carry a base URL (`Url` or `Host`); an optional `ApiKey`
    is forwarded as a bearer token. Raises `HTTPException` on invalid credentials,
    a missing base URL, unreachable/erroring servers, or auth failures.
    """
    base_url, api_key = _credential_base_url_and_key(provider, credential_id, user)
    return await discover_onprem_ollama_models(provider, base_url, api_key)


async def discover_onprem_ollama_models(
    provider: str,
    base_url: str,
    api_key: str | None = None,
) -> list[ModelInfo]:
    """Return the on-prem Ollama model list in LiteLLM's `ModelInfo` format.

    Simpler discovery path: given the resolved Ollama base URL (and optional API
    key), call `GET {base_url}/api/tags` and map each installed model onto the
    same `ModelInfo` shape LiteLLM's static listing returns. The caller is
    responsible for resolving the base URL/key from the credential manager.
    """
    if not base_url:
        raise HTTPException(
            status_code=400,
            detail="Ollama base URL not found in the provided credential.",
        )

    names = await _fetch_ollama_tags(base_url, api_key, provider)
    return [
        ModelInfo(**model_metadata(provider, name, capability_for_model(name)))
        for name in names
    ]


def _credential_base_url_and_key(
    provider: str,
    credential_id: str,
    user: User,
) -> tuple[str, str | None]:
    """Fetch the Ollama base URL and API key from the credential manager.

    Reads the credential directly from the vault by `credential_id` and extracts
    the `ApiKey` and `Url`/`Host` fields (PascalCase, matching the vault payload).
    Raises `HTTPException(400)` on invalid/missing credentials or a missing URL.
    """
    vault = VaultManager()
    credential = vault.get_vault_secret_by_id(
        vault_secret_id=credential_id,
        jwt=user.access_token,
    )
    if not credential:
        logger.error(f"[LLM-V2] Invalid Ollama credentials for provider {provider}")
        raise HTTPException(status_code=400, detail="No valid credentials found.")

    data = credential.get("data") or credential
    base_url = data.get("Url") or data.get("Host")
    api_key = data.get("ApiKey")
    if not base_url:
        logger.error(
            f"[LLM-V2] Ollama credential {credential_id} has no base URL (Url/Host)."
        )
        raise HTTPException(
            status_code=400,
            detail="Ollama base URL not found in the provided credential.",
        )
    return base_url, api_key


async def _fetch_ollama_tags(
    base_url: str,
    api_key: str | None,
    provider: str,
) -> list[str]:
    """Call `GET {base_url}/api/tags` and return the installed model names.

    Maps transport/HTTP failures onto HTTPExceptions (502 for unreachable/5xx,
    400 for auth rejections). Returns an empty list when the server has no models.
    """
    url = _tags_url(base_url)
    headers = {}
    if api_key:
        headers["API-KEY"] = f"{api_key}"

    try:
        async with httpx.AsyncClient(timeout=_OLLAMA_TAGS_TIMEOUT) as client:
            response = await client.get(url, headers=headers)
    except (httpx.ConnectError, httpx.ConnectTimeout, httpx.ReadTimeout) as e:
        log_exception(logger, e, f"[LLM-V2] Ollama tags call failed for {provider}: ")
        raise HTTPException(
            status_code=502,
            detail=(
                f"Unable to reach the Ollama server at {_host(base_url)}. "
                "Please check the credential base URL."
            ),
        ) from e
    except httpx.HTTPError as e:
        log_exception(logger, e, f"[LLM-V2] Ollama tags HTTP error for {provider}: ")
        raise HTTPException(
            status_code=502,
            detail="Error communicating with the Ollama server.",
        ) from e

    if response.status_code in (401, 403):
        logger.error(
            f"[LLM-V2] Ollama server rejected credentials at {url} "
            f"with status {response.status_code}."
        )
        raise HTTPException(
            status_code=400,
            detail="Ollama server rejected the provided credential.",
        )
    if response.status_code >= 400:
        logger.error(
            f"[LLM-V2] Ollama tags returned status {response.status_code} for {provider} at {url}."
        )
        raise HTTPException(
            status_code=502,
            detail="The Ollama server returned an error while listing models.",
        )

    names = _extract_model_names(response)
    if not names:
        logger.info(f"[LLM-V2] Ollama server at {_host(base_url)} has no models.")
        return []
    return names


def _tags_url(base_url: str) -> str:
    """Return the Ollama `/api/tags` URL, tolerating a trailing slash on base_url."""
    return f"{base_url.rstrip('/')}/api/tags"


def _host(base_url: str) -> str:
    """Best-effort host display for log/error messages."""
    return base_url.rstrip("/")


def _extract_model_names(response: httpx.Response) -> list[str]:
    """Parse model names from Ollama's `GET /api/tags` payload.

    Standard shape: `{"models": [{"name": "llama3.1:8b", ...}, ...]}`.
    Returns [] for an unexpected/empty payload so the caller degrades gracefully.
    """
    try:
        payload = response.json()
    except ValueError:
        logger.error("[LLM-V2] Ollama /api/tags returned non-JSON payload.")
        return []
    models = payload.get("models") if isinstance(payload, dict) else None
    if not isinstance(models, list):
        return []
    names: list[str] = []
    for item in models:
        if isinstance(item, dict):
            name = item.get("name")
            if isinstance(name, str) and name:
                names.append(name)
    return names
