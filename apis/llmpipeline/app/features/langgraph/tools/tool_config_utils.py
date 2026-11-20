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

# Tool-config source values; an absent marker keeps the custom store default.
TOOL_SOURCE_CUSTOM = "custom"
TOOL_SOURCE_PLATFORM = "platform"


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


def explicit_tool_source(config: Any) -> str | None:
    source = str(field(config, "source", "") or "").strip().lower()
    return source if source in (TOOL_SOURCE_CUSTOM, TOOL_SOURCE_PLATFORM) else None


def tool_source(config: Any) -> str:
    return explicit_tool_source(config) or TOOL_SOURCE_CUSTOM


def platform_candidate_entries(tool_config: list[Any] | None) -> list[Any]:
    """Return entries that may resolve from the platform catalog.

    An explicit ``custom`` entry never becomes a platform tool. An entry with
    no marker is a candidate because requests written before the stores split
    carry no source; the custom store is tried first, so a tenant custom tool
    with the same name always wins.
    """

    return [
        config
        for config in tool_config or []
        if explicit_tool_source(config) in (None, TOOL_SOURCE_PLATFORM)
    ]


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


def configured_tool_roots(
    tool_config: list[Any],
    exclude_source: str | None = None,
) -> list[str]:
    """Return the distinct root tool names from Studio ``tool_config`` entries.

    The root is the Studio ``tool`` field (e.g. ``outlook`` for the action
    ``outlook_send_email``), which matches ``ai_Tools.Name``. Custom OpenAPI
    tools are stored per root, so this is what ``load_custom_tools`` filters
    on. Entries whose source marker equals ``exclude_source`` are skipped so a
    platform reference is never looked up in the custom store. Order is
    preserved and duplicates are dropped.
    """

    roots: list[str] = []
    for config in tool_config or []:
        if exclude_source and tool_source(config) == exclude_source:
            continue
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
