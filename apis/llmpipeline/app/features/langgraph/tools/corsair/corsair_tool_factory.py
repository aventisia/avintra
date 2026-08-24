"""Factory for creating LangChain BaseTool instances from Corsair sidecar schemas."""

from __future__ import annotations

import json
from typing import Any, Optional

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field, create_model


def _json_property_type(prop: dict[str, Any]) -> Any:
    """Map a JSON schema property to a Pydantic-compatible type."""

    prop_type = prop.get("type") if isinstance(prop, dict) else None
    description = prop.get("description", "") if isinstance(prop, dict) else ""

    if prop_type == "string":
        base = str
    elif prop_type == "integer":
        base = int
    elif prop_type == "number":
        base = float
    elif prop_type == "boolean":
        base = bool
    elif prop_type == "array":
        base = list
    elif prop_type == "object":
        base = dict
    else:
        base = Any

    if description:
        return (base, Field(description=description))

    return base


def _build_args_model(
    name: str,
    parameters: dict[str, Any],
) -> type[BaseModel]:
    """Create a Pydantic model from a JSON schema ``parameters`` block."""

    properties = parameters.get("properties", {}) if isinstance(parameters, dict) else {}
    required = parameters.get("required", []) if isinstance(parameters, dict) else []

    fields: dict[str, Any] = {}
    for key, prop in properties.items():
        field_type = _json_property_type(prop)
        if key not in required:
            field_type = Optional[field_type]
            fields[key] = (field_type, None)
        else:
            if isinstance(field_type, tuple):
                fields[key] = field_type
            else:
                fields[key] = (field_type, ...)

    model_name = "".join(part.capitalize() for part in name.replace("-", "_").split("."))
    return create_model(model_name, **fields)


def _corsair_stub(**kwargs: Any) -> str:
    """Placeholder function for Corsair tools.

    Actual Corsair execution happens inside the LangGraph tool node, which
    intercepts Corsair tool calls before the generic ToolNode runs. The tool
    is only bound to the model so it can emit the correct tool_calls.
    """

    return "Corsair tool placeholder"


def _sanitize_tool_name(name: str) -> str:
    """Convert a dotted Corsair path into an OpenAI-safe tool name.

    OpenAI requires tool names to match ``^[a-zA-Z0-9_-]+$`` (no dots).
    ``github.api.issues.list`` -> ``github_api_issues_list``.

    The original dotted path is preserved on the tool so the tool node can
    route the call back to the sidecar.
    """
    return name.replace(".", "_")


def build_corsair_tool_from_schema(schema: dict[str, Any]) -> StructuredTool:
    """Create a LangChain StructuredTool from a Corsair schema dict.

    ``schema`` is expected to follow the OpenAI function-calling shape produced
    by ``fetch_corsair_schemas``:

        {
            "type": "function",
            "name": "github.api.issues.list",
            "description": "...",
            "parameters": {...}
        }

    The model-facing ``name`` is sanitized (dots -> underscores) because OpenAI
    rejects dotted function names. The original dotted path is stored in the
    tool's ``description`` metadata so the tool node can route execution.
    """

    name = schema["name"]
    sanitized_name = _sanitize_tool_name(name)
    description = schema.get("description") or name
    parameters = schema.get("parameters") or {"type": "object", "properties": {}}

    if isinstance(parameters, str):
        try:
            parameters = json.loads(parameters)
        except Exception:
            parameters = {"type": "object", "properties": {}}

    args_schema = _build_args_model(name, parameters)

    return StructuredTool.from_function(
        name=sanitized_name,
        description=description,
        func=_corsair_stub,
        args_schema=args_schema,
        metadata={"corsair_path": name},
    )


def build_corsair_tools_from_schemas(
    schemas: list[dict[str, Any]],
) -> list[StructuredTool]:
    """Build bindable LangChain tools from a list of Corsair schemas."""

    return [build_corsair_tool_from_schema(schema) for schema in schemas]
