"""Resolve platform (library catalog) tool entries for a chat turn.

Only tools the calling tenant has switched on are loaded: a catalog row must be
mapped in ``ai_TenantPlatformTools`` and not disabled. Names are matched
trimmed and case-insensitively against the catalog display name, then against
the derived Corsair plugin id. A tenant custom tool that owns the same name
always wins, so its entry is left untouched for the custom store. An explicit
platform entry that cannot be resolved is withheld, and so is any other entry
that would execute through Corsair (fail closed, never guessed).
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
    """Mirror ``ToolOperationHelpers.TryGetCorsairPluginId``: ``/corsair/{plugin}/``
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
                        return plugin.casefold()

    return None


def _parse_corsair_path(path: Any) -> str | None:
    prefix = "/corsair/"
    if not isinstance(path, str) or not path.lower().startswith(prefix):
        return None

    remainder = path[len(prefix):]
    separator = remainder.find("/")
    plugin = remainder[:separator] if separator > 0 else remainder
    return plugin.strip().casefold() or None


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
    for entry in entries:
        set_entry_tool(entry, "")


def set_entry_tool(entry: Any, tool: str) -> None:
    if isinstance(entry, dict):
        entry["tool"] = tool
    else:
        entry.tool = tool


def _index_row(
    index: dict[str, tuple[PlatformTool, bool]],
    key: str,
    row: PlatformTool,
    enabled: bool,
    kind: str,
) -> None:
    existing = index.get(key)
    if existing is not None:
        # IMPORTANT NOTE: display names are unique and each plugin maps to one row, so
        # a duplicate means the catalog is inconsistent; the first row wins and the
        # collision must be visible instead of silently shadowing a tenant's choice.
        logger.warning(
            "Catalog %s %r is shared by rows %s and %s; using the first.",
            kind,
            key,
            existing[0].id,
            row.id,
        )
        return
    index[key] = (row, enabled)


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
    row this tenant cannot use. An unmarked entry with no catalog match is left
    for the custom store unless it would execute through Corsair.
    """

    claimed = {root.strip().casefold() for root in (custom_claimed_roots or set())}

    result = await db_session.execute(catalog_statement(tenant_id))

    display_index: dict[str, tuple[PlatformTool, bool]] = {}
    plugin_index: dict[str, tuple[PlatformTool, bool]] = {}
    for row, mapping_id in result.all():
        enabled = mapping_id is not None and not row.is_disabled
        _index_row(display_index, row.name.strip().casefold(), row, enabled, "display name")
        plugin = derive_plugin_id(row.parsed_schema)
        if plugin:
            _index_row(plugin_index, plugin, row, enabled, "plugin id")

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
                key in claimed,
                f"no catalog row for tenant {tenant_id}",
            )
            continue

        row, enabled = match
        plugin = derive_plugin_id(row.parsed_schema)
        claimed_names = {key, row.name.strip().casefold()}
        if plugin:
            claimed_names.add(plugin)
        if claimed_names & claimed:
            # IMPORTANT NOTE: the custom tool is already registered for this turn, so the
            # entry must stay as configured and expand to the custom store's name; blanking
            # it would leave neither the custom tool nor a platform tool bound.
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
    claimed_by_custom: bool,
    reason: str,
) -> None:
    if claimed_by_custom:
        logger.debug(
            "Leaving tool entry %r for the tenant custom tool: %s",
            tool,
            reason,
        )
        return

    # IMPORTANT NOTE: an unmarked entry that expands to a dotted Corsair path would execute
    # through the sidecar without a catalog row, so the tenant gate must withhold it too.
    if explicit_platform or expands_to_corsair(entry):
        logger.warning("Withholding tool entry %r: %s", tool, reason)
        set_entry_tool(entry, "")
    else:
        logger.debug(
            "Leaving unmarked tool entry %r for the custom store: %s",
            tool,
            reason,
        )


def expands_to_corsair(entry: Any) -> bool:
    if "." in (field(entry, "tool", "") or ""):
        return True

    return any(
        "." in (field(action, "action", "") or "")
        for action in (field(entry, "actions", []) or [])
    )
