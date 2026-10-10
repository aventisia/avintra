"""Corsair sidecar integration for llmpipeline tool execution.

This module provides the bridge between the legacy ``platform_capability`` tool
execution path and the Corsair sidecar. Tool names that contain a dot (e.g.
``github.issues.create``) are treated as Corsair tools; everything else keeps
using the legacy dynamic-import executors.
"""

from __future__ import annotations

import json
import time
from typing import Any, List

import httpx

from app.core.config import settings
from app.core.logger import logger
from app.core.vault_credential_manager import VaultCredentialManager
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest, ToolConfig


class CorsairSidecarServiceError(Exception):
    """Raised when a Corsair sidecar call cannot be completed."""

    def __init__(self, message: str, response_body: Any = None):
        super().__init__(message)
        self.response_body = response_body


def is_corsair_tool(tool_name: str) -> bool:
    """Return True when ``tool_name`` looks like a Corsair path.

    Legacy tools use ``platform_capability`` (underscore only, e.g.
    ``github_create_issue``). Corsair tools use dotted plugin paths such as
    ``github.issues.create``.

    The model-facing name is sanitized for OpenAI (dots replaced with
    underscores, e.g. ``github_api_issues_list``), so we also detect the
    ``_api_`` marker that only appears in sanitized Corsair tool names.
    """
    if not tool_name:
        return False
    # A dot-separated name with at least two segments (plugin.action) is Corsair.
    if "." in tool_name:
        return True
    # Sanitized Corsair names carry the ``_api_`` segment (e.g. github_api_issues_list).
    return "_api_" in tool_name


def parse_corsair_tool_name(tool_name: str) -> tuple[str, str]:
    """Parse a Corsair tool name into ``(plugin, action)``.

    ``github.api.issues.create`` -> ("github", "api.issues.create")
    ``notion.pages.create``      -> ("notion", "pages.create")
    ``github_api_issues_list``   -> ("github", "api.issues.list")  (sanitized form)

    The returned ``action`` preserves the dotted path as used in the tool name.
    Callers that need the sidecar action (which starts below ``tenant.<plugin>.api``)
    should use ``to_sidecar_action`` to strip the leading ``api.`` segment.
    """
    if "." in tool_name:
        parts = tool_name.split(".")
        if len(parts) < 2:
            raise ValueError(f"Invalid Corsair tool name: {tool_name}")
        plugin = parts[0]
        action = ".".join(parts[1:])
        return plugin, action

    # Sanitized form: github_api_issues_list -> plugin "github", action "api.issues.list"
    marker = "_api_"
    idx = tool_name.find(marker)
    if idx <= 0:
        raise ValueError(f"Invalid Corsair tool name: {tool_name}")
    plugin = tool_name[:idx]
    action = "api." + tool_name[idx + len(marker):].replace("_", ".")
    return plugin, action


def to_sidecar_action(action: str) -> str:
    """Convert a tool action to the sidecar action path.

    Tool names include the ``api`` root exposed by the sidecar (e.g.
    ``github.api.issues.list``), but ``/api/corsair/invoke`` resolves
    ``tenant.github.api`` first and then walks the remaining segments. Strip
    the leading ``api.`` so the sidecar receives ``issues.list``.
    """
    parts = action.split(".")
    if len(parts) >= 2 and parts[0] == "api":
        return ".".join(parts[1:])
    return action


def to_corsair_action(plugin: str, action: str) -> str:
    """Normalize a plugin action to the sidecar's ``api.<action>`` form.

    Studio stores Corsair operations as the seeded OpenAPI ``operationId``
    (``<plugin>.<action>``, e.g. ``openai.models.list``) while the sidecar
    exposes them under the plugin's ``api`` root
    (``openai.api.models.list``). This strips a redundant plugin prefix and
    ensures the ``api.`` root while preserving the action's original casing.
    """

    plugin_id = (plugin or "").strip().lower()
    action_path = (action or "").strip().strip(".")

    prefix = f"{plugin_id}."
    if plugin_id and action_path.lower().startswith(prefix):
        action_path = action_path[len(prefix):]

    if action_path and not action_path.lower().startswith("api."):
        action_path = f"api.{action_path}"

    return action_path


def to_corsair_tool_path(plugin: str, action: str) -> str:
    """Return the canonical dotted sidecar path for a plugin action."""

    plugin_id = (plugin or "").strip().lower()
    return f"{plugin_id}.{to_corsair_action(plugin, action)}"


def _translate_corsair_input_schema(input_schema: Any) -> dict[str, Any]:
    """Translate the Corsair sidecar's custom input format into JSON Schema.

    The sidecar returns a schema shaped like:

        {"kind": "object", "optional": false,
         "fields": {"owner": {"kind": "string", "optional": false}, ...}}

    This is converted into a standard JSON Schema object that model binding
    layers (e.g. LangChain StructuredTool) understand.
    """
    if not isinstance(input_schema, dict):
        return {"type": "object", "properties": {}}

    # If already looks like JSON Schema, leave it alone.
    if "type" in input_schema:
        return input_schema

    return _corsair_kind_to_json_schema(input_schema)


def _corsair_kind_to_json_schema(value: Any) -> Any:
    if not isinstance(value, dict):
        return {"type": "string"}

    kind = value.get("kind")
    optional = value.get("optional", False)
    if kind == "object":
        props = {}
        required = []
        fields = value.get("fields") or {}
        for name, field_schema in fields.items():
            props[name] = _corsair_kind_to_json_schema(field_schema)
            if not field_schema.get("optional", False):
                required.append(name)
        return {"type": "object", "properties": props, "required": required}

    if kind == "array":
        items = value.get("items", {})
        return {"type": "array", "items": _corsair_kind_to_json_schema(items)}

    if kind == "string":
        out: dict[str, Any] = {"type": "string"}
        if "enum" in value:
            out["enum"] = value["enum"]
        if not optional:
            out["description"] = "required"
        return out

    if kind == "number":
        return {"type": "number"}

    if kind == "boolean":
        return {"type": "boolean"}

    # Fallback for unknown kinds.
    return {"type": "string"}


def _resolve_corsair_credential_id(
    tool_name: str,
    llm_request: LLMRequest,
    user: User,
) -> str | None:
    """Find the credential id for a Corsair tool from ``tool_config``.

    Corsair tools are stored in ``tool_config`` using the plugin name (the first
    segment of the dotted tool path). For example, ``github.issues.create`` is
    looked up under tool ``github``.

    The frontend sends the credential by NAME (consistent with every other
    feature). Corsair, however, keys connections by the credential ID (the
    VaultCredential Id), which it uses as the tenant/connection identifier. So when
    only a ``credential_name`` is supplied we resolve it to its Id via the
    vault credential. An explicit ``credential_id`` is still honored for backward
    compatibility.
    """
    if not llm_request.tool_config:
        return None

    plugin, _ = parse_corsair_tool_name(tool_name)

    for config in llm_request.tool_config:
        if isinstance(config, dict):
            if config.get("tool", "").lower() != plugin.lower():
                continue
            credential_id = config.get("credential_id")
            if credential_id:
                return credential_id
            credential_name = config.get("credential_name")
            if credential_name:
                return _resolve_credential_id_by_name(credential_name, user)
        elif isinstance(config, ToolConfig):
            if config.tool.lower() != plugin.lower():
                continue
            if config.credential_id:
                return config.credential_id
            if config.credential_name:
                return _resolve_credential_id_by_name(config.credential_name, user)

    return None


def _resolve_credential_id_by_name(
    credential_name: str,
    user: User,
) -> str | None:
    """Resolve a credential NAME to its VaultCredential Id via the vault credential.

    Corsair uses the credential Id as the ``connectionId`` (tenant identifier),
    but the frontend only sends the credential name. Look the secret up by name
    and return its ``Id``.
    """
    try:
        vault_credential = VaultCredentialManager()
        credential = vault_credential.get_vault_credential_secret_by_name(
            credential=credential_name,
            jwt=user.access_token,
            env_type=user.env_type,
            tenant_id=str(user.tenant_id) if user.tenant_id else None,
            space_id=user.space_id,
        )
    except Exception:
        logger.exception(
            "Failed to resolve credential id for Corsair tool. credential_name=%s",
            credential_name,
        )
        return None

    if not credential:
        logger.warning(
            "No credential found for Corsair tool. credential_name=%s",
            credential_name,
        )
        return None

    # The vault credential API serializes the VaultCredential DTO with camelCase keys.
    credential_id = credential.get("Id") or credential.get("id")
    if not credential_id:
        logger.warning(
            "Credential has no Id for Corsair tool. credential_name=%s",
            credential_name,
        )
        return None

    return str(credential_id)


def _sidecar_headers() -> dict[str, str]:
    # The sidecar is backend-only and private to the deployment network; no auth
    # header is required. Kept as a helper so callers share a single header set.
    return {"Content-Type": "application/json"}


def _sidecar_base_url() -> str:
    url = settings.CORSAIR_API_BASE_URL or "http://localhost:4006"
    return url.rstrip("/")


# In-process cache for the sidecar tool catalog: (monotonic time, tools).
# Plugin descriptions change only when integrations are installed, so a short
# TTL avoids a sidecar round-trip for every planner and binding call.
_CORSAIR_TOOLS_CACHE_TTL_SECONDS = 600
_corsair_tools_cache: tuple[float, List[dict[str, Any]]] | None = None


async def invoke_corsair_tool(
    tool_name: str,
    arguments: dict[str, Any],
    llm_request: LLMRequest,
    user: User,
) -> dict[str, Any]:
    """Call the Corsair sidecar ``POST /api/corsair/invoke`` for a tool.

    The sidecar expects::

        {
            "connectionId": "<tenantId or credential handle>",
            "plugin": "github",
            "action": "issues.create",
            "payload": {...}
        }

    Returns the sidecar response (``{"success": true, "data": ...}``) on a 2xx
    response, or a normalized error dict on failure.
    """
    base_url = _sidecar_base_url()
    if not base_url:
        raise CorsairSidecarServiceError("CORSAIR_API_BASE_URL is not configured")

    plugin, action = parse_corsair_tool_name(tool_name)
    sidecar_action = to_sidecar_action(action)
    credential_id = _resolve_corsair_credential_id(tool_name, llm_request, user)
    if not credential_id:
        raise CorsairSidecarServiceError(
            f"No credential configured for Corsair tool {tool_name}. "
            "Re-save the credential in the vault credential to mirror it to the Corsair sidecar."
        )

    endpoint = f"{base_url}/api/corsair/invoke"
    payload = {
        "connectionId": credential_id,
        "plugin": plugin,
        "action": sidecar_action,
        "payload": arguments or {},
    }

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(600.0),
            verify=settings.SSL_VERIFY,
        ) as client:
            response = await client.post(
                endpoint,
                json=payload,
                headers=_sidecar_headers(),
            )
            response.raise_for_status()
            result = response.json()

        if not isinstance(result, dict):
            raise CorsairSidecarServiceError(
                f"Unexpected sidecar response type: {type(result).__name__}"
            )

        return result

    except httpx.HTTPStatusError as exc:
        body = None
        try:
            body = exc.response.json()
        except Exception:
            body = exc.response.text
        message = (
            body.get("error")
            or body.get("message")
            or f"Sidecar returned HTTP {exc.response.status_code}"
        ) if isinstance(body, dict) else f"Sidecar returned HTTP {exc.response.status_code}"
        if isinstance(body, dict) and body.get("needsConnect"):
            message = (
                f"{message}. The credential is not mirrored to Corsair; "
                "re-save it in the vault credential to trigger the mirror."
            )
        logger.exception("Corsair sidecar invocation failed for %s", tool_name)
        raise CorsairSidecarServiceError(
            f"Corsair sidecar error for {tool_name}: {message}",
            response_body=body,
        )
    except httpx.RequestError as exc:
        logger.exception("Corsair sidecar request error for %s", tool_name)
        raise CorsairSidecarServiceError(
            f"Corsair sidecar request error for {tool_name}: {exc}"
        )


async def _fetch_all_corsair_tools() -> List[dict[str, Any]]:
    """Fetch the sidecar tool catalog, cached for a short TTL.

    Both planner-catalog building and tool-schema binding read the same
    ``GET /api/corsair/tools`` response, so the raw tool list is cached
    in-process to avoid a sidecar round-trip on every chat message. Returns an
    empty list when the sidecar is unreachable so callers fail closed.
    """

    global _corsair_tools_cache

    now = time.monotonic()
    if _corsair_tools_cache is not None:
        cached_at, cached_tools = _corsair_tools_cache
        if now - cached_at < _CORSAIR_TOOLS_CACHE_TTL_SECONDS:
            return cached_tools

    base_url = _sidecar_base_url()
    if not base_url:
        return []

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(60.0),
            verify=settings.SSL_VERIFY,
        ) as client:
            response = await client.get(
                f"{base_url}/api/corsair/tools",
                headers=_sidecar_headers(),
            )
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        logger.warning("Failed to fetch Corsair schemas from sidecar: %s", exc)
        return []

    sidecar_tools = data.get("tools", []) if isinstance(data, dict) else []
    if not isinstance(sidecar_tools, list):
        return []

    _corsair_tools_cache = (now, sidecar_tools)
    return sidecar_tools


async def fetch_corsair_schemas(
    tool_configs: List[ToolConfig] | list[dict[str, Any]],
) -> List[dict[str, Any]]:
    """Fetch Corsair tool schemas from the sidecar for the given configs.

    Only configs whose tool name corresponds to a Corsair plugin are fetched.
    The sidecar ``GET /api/corsair/tools`` returns a list of operations with
    ``path``, ``description``, and ``input`` (JSON schema). We translate each
    matching path into the OpenAI Responses API function shape.

    ``tool_configs`` may contain either ``ToolConfig`` instances or plain
    dicts (e.g. deserialized request JSON), so both shapes are handled.
    """

    if not tool_configs:
        return []

    sidecar_tools = await _fetch_all_corsair_tools()
    if not sidecar_tools:
        return []

    # Build a quick lookup by path.
    schemas_by_path: dict[str, dict[str, Any]] = {}
    for tool in sidecar_tools:
        path = tool.get("path")
        if isinstance(path, str):
            schemas_by_path[path] = tool

    def _config_to_plugin_actions(config):
        if isinstance(config, ToolConfig):
            return (
                (config.tool or "").lower(),
                {(action.action or "").lower() for action in (config.actions or [])},
            )
        plugin = (config.get("tool") or "").lower()
        actions = {
            (a.get("action") or "").lower()
            for a in (config.get("actions") or [])
        }
        return plugin, actions

    result: list[dict[str, Any]] = []
    for config in tool_configs:
        plugin, allowed_actions = _config_to_plugin_actions(config)
        if not plugin:
            continue

        for path, schema in schemas_by_path.items():
            path_plugin = schema.get("plugin", path.split(".")[0]).lower()
            if path_plugin != plugin:
                continue

            # If actions are listed, only include matching ones.
            action_part = ".".join(path.split(".")[1:])
            if allowed_actions and action_part.lower() not in allowed_actions:
                continue

            input_schema = schema.get("input") or {
                "type": "object",
                "properties": {},
            }
            if isinstance(input_schema, str):
                try:
                    input_schema = json.loads(input_schema)
                except Exception:
                    input_schema = {"type": "object", "properties": {}}

            input_schema = _translate_corsair_input_schema(input_schema)

            result.append({
                "type": "function",
                "name": path,
                "description": schema.get("description") or path,
                "parameters": input_schema,
            })

    return result
