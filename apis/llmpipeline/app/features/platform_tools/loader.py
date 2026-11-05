"""Resolve platform (library catalog) tool entries for a chat turn.

Only tools the calling tenant has switched on are loaded: a catalog row must be
mapped in ``ai_TenantPlatformTools`` and not disabled. Names are matched
trimmed and case-insensitively against the catalog display name, then against
the derived Corsair plugin id. A tenant custom tool that owns the same name
always wins, so an unmarked entry that the custom store loaded is left alone.
An explicit platform entry that cannot be resolved is withheld; an unmarked
entry is left for the custom store (fail closed, never guessed). A name that
belongs to a catalog row the tenant cannot use is platform-reserved and is
withheld too.
"""

import uuid
from typing import Any

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.langgraph.tools.tool_config_utils import (
    TOOL_SOURCE_PLATFORM,
    explicit_tool_source,
    field,
)
from app.features.platform_tools.models import PlatformTool, TenantPlatformTool


def derive_plugin_id(parsed_schema: Any) -> str | None:
    """Return the Corsair plugin id from a parsed OpenAPI schema, when present.

    Mirrors ``ToolOperationHelpers.TryGetCorsairPluginId``: a ``/corsair/{plugin}/``
    path segment wins, otherwise the first dotted ``operationId`` prefix.
    """

    if not isinstance(parsed_schema, dict):
        return None

    paths = parsed_schema.get("paths")
    if isinstance(paths, dict):
        for path in paths:
            plugin = _parse_corsair_path(path)
            if plugin:
                return plugin

    operations = parsed_schema.get("operations")
    if isinstance(operations, list):
        for operation in operations:
            if not isinstance(operation, dict):
                continue
            operation_id = operation.get("operationId")
            if isinstance(operation_id, str):
                separator = operation_id.find(".")
                if separator > 0:
                    plugin = operation_id[:separator].strip()
                    if plugin:
                        return plugin

    return None


def _parse_corsair_path(path: Any) -> str | None:
    prefix = "/corsair/"
    if not isinstance(path, str) or not path.lower().startswith(prefix):
        return None

    remainder = path[len(prefix):]
    separator = remainder.find("/")
    plugin = remainder[:separator] if separator > 0 else remainder
    return plugin.strip() or None


def catalog_statement(tenant_id: uuid.UUID):
    """Select every catalog row with the tenant's mapping id, if any.

    The tenant filter is explicit: chat sessions carry no tenant criteria, so
    the gate must never rely on a session-level filter. Unmapped catalog rows
    are returned as well so their names stay platform-reserved. A row is
    enabled only when the mapping id is present and ``IsDisabled`` is false.
    """

    return (
        select(PlatformTool, TenantPlatformTool.id)
        .outerjoin(
            TenantPlatformTool,
            and_(
                TenantPlatformTool.platform_tool_id == PlatformTool.id,
                TenantPlatformTool.tenant_id == tenant_id,
            ),
        )
        .order_by(PlatformTool.id.asc())
    )


def withhold_platform_entries(entries: list[Any]) -> None:
    """Blank platform entries so they cannot bind anything."""

    for entry in entries:
        set_entry_tool(entry, "")


def set_entry_tool(entry: Any, tool: str) -> None:
    if isinstance(entry, dict):
        entry["tool"] = tool
    else:
        entry.tool = tool


async def resolve_platform_tools(
    platform_entries: list[Any],
    tenant_id: uuid.UUID,
    db_session: AsyncSession,
    custom_claimed_roots: set[str] | None = None,
) -> None:
    """Resolve platform entries in place for this tenant.

    ``platform_entries`` holds explicit platform entries and unmarked entries
    that the custom store did not claim. Resolved entries have their ``tool``
    rewritten to the plugin root. An explicit platform entry that cannot be
    resolved is blanked, and so is any entry whose name belongs to a catalog
    row this tenant cannot use; an unmarked entry with no catalog match is left
    for the custom store.
    """

    claimed = {root.strip().casefold() for root in (custom_claimed_roots or set())}

    result = await db_session.execute(catalog_statement(tenant_id))

    display_index: dict[str, tuple[PlatformTool, bool]] = {}
    plugin_index: dict[str, tuple[PlatformTool, bool]] = {}
    for row, mapping_id in result.all():
        enabled = mapping_id is not None and not row.is_disabled
        plugin = derive_plugin_id(row.parsed_schema)
        if plugin:
            plugin_index.setdefault(plugin.casefold(), (row, enabled))
        display_index.setdefault(row.name.strip().casefold(), (row, enabled))

    for entry in platform_entries:
        tool = (field(entry, "tool", "") or "").strip()
        key = tool.casefold()
        explicit_platform = explicit_tool_source(entry) == TOOL_SOURCE_PLATFORM
        match = (display_index.get(key) or plugin_index.get(key)) if key else None

        if match is None:
            _leave_unresolved(
                entry,
                tool,
                explicit_platform,
                f"no catalog row for tenant {tenant_id}",
            )
            continue

        row, enabled = match
        plugin = derive_plugin_id(row.parsed_schema)
        claimed_names = {key, row.name.strip().casefold()}
        if plugin:
            claimed_names.add(plugin.casefold())
        if claimed_names & claimed:
            if explicit_platform:
                logger.info(
                    "Platform tool entry %r resolves to the tenant custom tool (winner=custom)",
                    tool,
                )
                set_entry_tool(entry, "")
            else:
                logger.debug(
                    "Tool entry %r stays with the tenant custom tool (winner=custom)",
                    tool,
                )
            continue

        if not enabled or not plugin:
            logger.warning(
                "Withholding tool entry %r: catalog row %r is not usable for tenant %s",
                tool,
                row.name,
                tenant_id,
            )
            set_entry_tool(entry, "")
            continue

        set_entry_tool(entry, plugin)
        logger.info(
            "Platform tool entry %r resolved. plugin=%s winner=platform",
            tool,
            plugin,
        )


def _leave_unresolved(
    entry: Any,
    tool: str,
    explicit_platform: bool,
    reason: str,
) -> None:
    """Withhold an explicit platform entry; leave an unmarked one to custom.

    An unmarked entry predates the source marker, so the custom store was
    already tried first. Leaving it unchanged reproduces the old behavior
    instead of silently dropping a request whose name is simply unknown.
    """

    if explicit_platform:
        logger.warning("Withholding platform tool entry %r: %s", tool, reason)
        set_entry_tool(entry, "")
    else:
        logger.debug(
            "Leaving unmarked tool entry %r for the custom store: %s",
            tool,
            reason,
        )
