from __future__ import annotations

from langchain_core.tools import BaseTool
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.custom_tools.custom_tool_loader import load_custom_tools
from app.features.langgraph.tools.tool_config_utils import (
    configured_tool_roots,
    expand_tool_config,
    field,
)
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.llm_providers.services.corsair_sidecar_service import is_corsair_tool


class ToolResolver:
    """
    Resolves tools that should be available to the LLM agent.
    """

    def __init__(
        self,
        registry: ToolRegistry,
        tool_names: list[str] | None = None,
    ):
        # Store tool registry reference.
        self.registry = registry
        self.tool_names = tool_names

    def resolve(self) -> list[BaseTool]:
        """
        Select tools for the current LLM request.

        Rules:
            - If a list of ``tool_names`` was provided during construction:
                Load only those requested tools.

            - Otherwise:
                Load all registered tools.
        """

        if self.tool_names:
            tools = self.registry.get_by_names(self.tool_names)
        else:
            tools = self.registry.get_all()

        return tools

    def resolve_from_request(
        self,
        tool_config: list | None,
    ) -> list[BaseTool]:
        """
        Backwards-compatible resolver used when the caller already knows the
        requested tool names from the request payload.
        """

        if tool_config:
            tool_names = [
                config.tool
                for config in tool_config
            ]
            tools = self.registry.get_by_names(tool_names)
        else:
            tools = self.registry.get_all()

        return tools


async def register_configured_custom_tools(
    request: LLMRequest,
    user: User,
    db_session: AsyncSession,
    registry: ToolRegistry,
) -> None:
    """Load the request's configured custom tools and register them.

    Only tools explicitly configured on the agent are loaded, scoped to the
    active environment. The previous ``FlowVersionId`` join could never match
    (the link table is dormant), so tools are resolved by their root name
    (``ai_Tools.Name``) instead.
    """

    tool_names = configured_tool_roots(request.tool_config or [])
    if not tool_names:
        return

    try:
        custom_tools = await load_custom_tools(
            session=db_session,
            tenant_id=user.tenant_id,
            tool_names=tool_names,
            workspace_api=f"https://{settings.APP_BASE_URL}/workspace",
            access_token=user.access_token,
            env_type=user.env_type,
            space_id=user.space_id,
        )
        registry.register_many(custom_tools)
        if custom_tools:
            logger.debug(
                "Registered %d custom tools for tenant %s",
                len(custom_tools),
                user.tenant_id,
            )
    except Exception as exc:
        logger.warning(
            "Failed to load custom tools for tenant %s: %s",
            user.tenant_id,
            exc,
        )


async def resolve_configured_tools(
    request: LLMRequest,
    user: User,
    registry: ToolRegistry,
    db_session: AsyncSession | None = None,
) -> list[BaseTool]:
    """Return every tool action configured on the request.

    The chat graph resolves only the planner's per-message picks; a realtime
    session has no planner, so it exposes the configured set instead.
    """

    if db_session is not None:
        await register_configured_custom_tools(request, user, db_session, registry)

    return await resolve_tools(
        registry,
        expand_tool_config(request.tool_config or []),
        request,
    )


async def resolve_tools(
    tool_registry: ToolRegistry,
    selected_tool_names: list[str] | None,
    llm_request: LLMRequest | None = None,
) -> list[BaseTool]:
    """Resolve selected tool names to concrete tool instances."""

    if not selected_tool_names:
        return []

    legacy_names = [name for name in selected_tool_names if not is_corsair_tool(name)]
    corsair_names = [name for name in selected_tool_names if is_corsair_tool(name)]

    tools = []
    if legacy_names:
        resolved_legacy = tool_registry.get_by_names(legacy_names)
        if resolved_legacy:
            tools.extend(resolved_legacy)

    if corsair_names and llm_request is not None:
        corsair_tools = await _build_corsair_tools_for_names(corsair_names, llm_request)
        tools.extend(corsair_tools)

    return tools


async def _build_corsair_tools_for_names(
    tool_names: list[str],
    llm_request: LLMRequest,
) -> list[BaseTool]:
    """Fetch sidecar schemas and build bindable Corsair tools.

    Only actions that are explicitly allowed by ``llm_request.tool_config``
    are fetched so the model cannot call unconfigured Corsair actions.
    """
    from app.features.langgraph.tools.corsair.corsair_tool_factory import (
        build_corsair_tools_from_schemas,
    )
    from app.features.llm_providers.services.corsair_sidecar_service import (
        fetch_corsair_schemas,
        parse_corsair_tool_name,
        to_corsair_action,
    )

    configs = llm_request.tool_config or []
    allowed: dict[str, set[str]] = {}
    for config in configs:
        tool = field(config, "tool", "")
        actions = {
            field(action, "action", "")
            for action in field(config, "actions", []) or []
        }
        plugin = (tool or "").strip().lower()
        allowed.setdefault(plugin, set()).update(
            to_corsair_action(plugin, action) for action in actions if action
        )

    fetch_configs = []
    wanted: set[str] = set()
    for name in tool_names:
        plugin, action = parse_corsair_tool_name(name)
        plugin = plugin.strip().lower()
        action = to_corsair_action(plugin, action)
        wanted.add(f"{plugin}.{action}")

        if action in allowed.get(plugin, set()):
            fetch_configs.append({"tool": plugin, "actions": [{"action": action}]})
        else:
            logger.warning(
                "Skipping unconfigured Corsair tool %s (plugin=%s action=%s)",
                name,
                plugin,
                action,
            )

    if not fetch_configs:
        return []

    try:
        schemas = await fetch_corsair_schemas(fetch_configs)
    except Exception:
        logger.exception("Failed to fetch Corsair schemas for tool binding")
        return []

    schemas = [s for s in schemas if s.get("name") in wanted]

    return build_corsair_tools_from_schemas(schemas)
