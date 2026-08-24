"""Corsair sidecar integration for llmpipeline tool execution.

This module provides the bridge between the legacy ``platform_capability`` tool
execution path and the Corsair sidecar. Tool names that contain a dot (e.g.
``github.issues.create``) are treated as Corsair tools; everything else keeps
using the legacy dynamic-import executors.
"""

from __future__ import annotations

import json
from typing import Any, List

import httpx

from app.core.config import settings
from app.core.logger import logger
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
    ``github.api.issues.list``), but ``/corsair/invoke`` resolves
    ``tenant.github.api`` first and then walks the remaining segments. Strip
    the leading ``api.`` so the sidecar receives ``issues.list``.
    """
    parts = action.split(".")
    if len(parts) >= 2 and parts[0] == "api":
        return ".".join(parts[1:])
    return action


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
) -> str | None:
    """Find the credential id for a Corsair tool from ``tool_config``.

    Corsair tools are stored in ``tool_config`` using the plugin name (the first
    segment of the dotted tool path). For example, ``github.issues.create`` is
    looked up under tool ``github``.
    """
    if not llm_request.tool_config:
        return None

    plugin, _ = parse_corsair_tool_name(tool_name)

    for config in llm_request.tool_config:
        if isinstance(config, dict):
            if config.get("tool", "").lower() == plugin.lower():
                return config.get("credential_id")
        elif isinstance(config, ToolConfig):
            if config.tool.lower() == plugin.lower():
                return config.credential_id

    # TODO: Once the sidecar supports per-call tenant/caller identity, pass it
    # here alongside the credential_id so the sidecar can authorize the lookup.
    return None


def _sidecar_headers() -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if settings.CORSAIR_API_KEY:
        headers["X-Corsair-Api-Key"] = settings.CORSAIR_API_KEY
    return headers


def _sidecar_base_url() -> str:
    url = settings.CORSAIR_SIDECAR_URL or "http://localhost:3456"
    return url.rstrip("/")


async def invoke_corsair_tool(
    tool_name: str,
    arguments: dict[str, Any],
    llm_request: LLMRequest,
    user: User,
) -> dict[str, Any]:
    """Call the Corsair sidecar ``POST /corsair/invoke`` for a tool.

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
        raise CorsairSidecarServiceError("CORSAIR_SIDECAR_URL is not configured")

    plugin, action = parse_corsair_tool_name(tool_name)
    sidecar_action = to_sidecar_action(action)
    credential_id = _resolve_corsair_credential_id(tool_name, llm_request)
    if not credential_id:
        raise CorsairSidecarServiceError(
            f"No credential configured for Corsair tool {tool_name}"
        )

    endpoint = f"{base_url}/corsair/invoke"
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
    base_url = _sidecar_base_url()
    if not base_url or not tool_configs:
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
