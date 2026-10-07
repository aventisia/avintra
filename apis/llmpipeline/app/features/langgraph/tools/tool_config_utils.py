"""Normalization helpers for Studio ``tool_config`` entries.

Studio sends configured actions as ``{ tool, credential_name, actions:
[{ action, approval }] }`` entries, as pydantic ``ToolConfig``/``ToolAction``
models or plain dicts (deserialized request JSON). These helpers turn those
entries into the canonical LangGraph tool names used for binding, planner
gating, and approval lookups, so every consumer normalizes identically.
"""

from typing import Any

from app.features.llm_providers.services.corsair_sidecar_service import (
    to_corsair_tool_path,
)

# Approval policy values sent by Studio per action.
APPROVAL_AUTO = "auto"
APPROVAL_HUMAN = "human"


def field(obj: Any, name: str, default: Any = None) -> Any:
    """Read ``name`` from a pydantic-style object or a plain dict.

    Only ``None`` falls back to ``default``; empty strings and zeros are
    legitimate values and are returned unchanged.
    """

    if isinstance(obj, dict):
        value = obj.get(name)
    else:
        value = getattr(obj, name, None)
    return default if value is None else value


def iter_tool_config_entries(tool_config: list[Any]):
    """Yield ``(normalized_tool_name, approval)`` for every configured action.

    Naming rules (shared by expansion and the approval map):
    - tool containing a dot → ``<tool>.<action>``
    - dotted action (Corsair operationId) → canonical ``<plugin>.api.<action>``
    - legacy action → ``<tool>_<action>``
    - entry without actions → the raw tool name
    """

    for config in tool_config:
        tool = field(config, "tool", "")
        actions = field(config, "actions", []) or []

        if not actions:
            if tool:
                yield tool, None
            continue

        for action in actions:
            action_name = field(action, "action", "")
            approval = field(action, "approval")
            if not (tool and action_name):
                continue
            if "." in tool:
                yield f"{tool}.{action_name}", approval
            elif "." in action_name:
                # Dotted actions identify Corsair tools. Studio sends the seeded
                # OpenAPI operationId (e.g. "openai.models.list"); normalize it
                # to the canonical sidecar path (e.g. "openai.api.models.list").
                yield to_corsair_tool_path(tool, action_name), approval
            else:
                yield f"{tool}_{action_name}", approval


def configured_tool_roots(tool_config: list[Any]) -> list[str]:
    """Return the distinct root tool names from Studio ``tool_config`` entries.

    The root is the Studio ``tool`` field (e.g. ``outlook`` for the action
    ``outlook_send_email``), which matches ``ws_Tools.Name``. Custom OpenAPI
    tools are stored per root, so this is what ``load_custom_tools`` filters
    on. Order is preserved and duplicates are dropped.
    """

    roots: list[str] = []
    for config in tool_config or []:
        tool = (field(config, "tool", "") or "").strip()
        if tool and tool not in roots:
            roots.append(tool)
    return roots


def expand_tool_config(tool_config: list[Any]) -> list[str]:
    """Expand Studio tool config entries into LangGraph tool names.

    Studio format: { tool: "outlook", actions: [{ action: "send_email" }] }
    Legacy LangGraph name: "outlook_send_email"
    Corsair LangGraph name: "github.api.issues.create"

    For Corsair, the Studio ``tool`` field is the plugin root (e.g. ``github``)
    and the action is either the remaining dotted path (e.g.
    ``api.issues.create``) or the seeded OpenAPI operationId (e.g.
    ``openai.models.list``). Both are normalized to the canonical sidecar path
    ``<plugin>.api.<action>``.

    For legacy platform tools, the action is a single capability word (e.g.
    ``send_email``) and the emitted name remains ``<tool>_<action>``.
    """

    return [name for name, _ in iter_tool_config_entries(tool_config)]
