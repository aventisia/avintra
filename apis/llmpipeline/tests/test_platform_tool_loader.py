"""Platform (library catalog) resolution for the chat pipeline.

Covers the read-only table mappings, the plugin-id derivation ported from the
Workspace ``ToolOperationHelpers``, and the tenant gate in the loader: only
mapped, non-disabled catalog rows resolve, a tenant custom tool wins a shared
name, an unmarked entry falls back to the catalog without overriding custom,
and an entry whose name belongs to a catalog row the tenant cannot use is
withheld.

Run from ``apis/llmpipeline``:

    ENV=local ./venv/Scripts/python.exe -m pytest tests/test_platform_tool_loader.py -q
"""

import asyncio
from types import SimpleNamespace
from uuid import uuid4

import pytest
from sqlalchemy.dialects import postgresql

from app.features.platform_tools.loader import (
    catalog_statement,
    derive_plugin_id,
    resolve_platform_tools,
    withhold_platform_entries,
)
from app.features.platform_tools.models import PlatformTool, TenantPlatformTool


class _FakeResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return list(self._rows)


class _FakeSession:
    def __init__(self, rows):
        self.rows = rows
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _FakeResult(self.rows)


def _row(name, parsed_schema, is_disabled=False):
    return SimpleNamespace(
        id=uuid4(),
        name=name,
        parsed_schema=parsed_schema,
        is_disabled=is_disabled,
    )


def _mapped(row):
    return (row, uuid4())


def _unmapped(row):
    return (row, None)


def _entry(tool, source=None):
    entry = {"tool": tool, "actions": [{"action": "chat.postMessage"}]}
    if source:
        entry["source"] = source
    return entry


def _resolve(rows, entries, claimed=None):
    session = _FakeSession(rows)
    asyncio.run(
        resolve_platform_tools(
            platform_entries=entries,
            tenant_id=uuid4(),
            db_session=session,
            custom_claimed_roots=claimed,
        )
    )
    return session


# ---------------------------------------------------------------------------
# Read mappings
# ---------------------------------------------------------------------------


def test_platform_tool_mapping_matches_table_shape():
    assert PlatformTool.__tablename__ == "ai_PlatformTools"
    assert {column.name for column in PlatformTool.__table__.columns} == {
        "Id",
        "Name",
        "Description",
        "OpenApiSpec",
        "ParsedSchema",
        "IsPopular",
        "IsDisabled",
    }


def test_tenant_platform_tool_mapping_matches_table_shape():
    assert TenantPlatformTool.__tablename__ == "ai_TenantPlatformTools"
    assert {column.name for column in TenantPlatformTool.__table__.columns} == {
        "Id",
        "TenantId",
        "PlatformToolId",
        "CreatedByUserId",
        "CreatedOn",
    }


# ---------------------------------------------------------------------------
# Plugin derivation
# ---------------------------------------------------------------------------


def test_derive_plugin_id_from_corsair_path():
    schema = {"paths": {"/corsair/slack/messages": {"get": {"operationId": "messages.list"}}}}

    assert derive_plugin_id(schema) == "slack"


def test_derive_plugin_id_from_operation_id_prefix():
    schema = {"operations": [{"operationId": "github.issues.list"}]}

    assert derive_plugin_id(schema) == "github"


def test_derive_plugin_id_without_catalog_markers_is_none():
    assert derive_plugin_id(None) is None
    assert derive_plugin_id({}) is None
    assert derive_plugin_id({"operations": [{"operationId": "noseparator"}]}) is None


# ---------------------------------------------------------------------------
# Tenant gate and precedence
# ---------------------------------------------------------------------------


def test_mapped_enabled_row_resolves_unmarked_entry():
    row = _row("Slack", {"paths": {"/corsair/slack/messages": {}}})
    entry = _entry("Slack")

    _resolve([_mapped(row)], [entry])

    assert entry["tool"] == "slack"


def test_mapped_enabled_row_resolves_explicit_platform_entry():
    row = _row("Slack", {"paths": {"/corsair/slack/messages": {}}})
    entry = _entry("Slack", source="platform")

    _resolve([_mapped(row)], [entry])

    assert entry["tool"] == "slack"


def test_plugin_id_matches_when_display_name_differs():
    row = _row("Slack for Teams", {"paths": {"/corsair/slack/messages": {}}})
    entry = _entry("SLACK")

    _resolve([_mapped(row)], [entry])

    assert entry["tool"] == "slack"


def test_unmapped_entry_is_withheld():
    entry = _entry("Slack", source="platform")

    _resolve([], [entry])

    assert entry["tool"] == ""


def test_unmarked_unknown_entry_is_left_for_the_custom_store():
    entry = _entry("Slack")

    _resolve([], [entry])

    assert entry["tool"] == "Slack"


def test_custom_claimed_name_wins():
    row = _row("Slack", {"paths": {"/corsair/slack/messages": {}}})
    entry = _entry("slack", source="platform")

    _resolve([_mapped(row)], [entry], claimed={"slack"})

    assert entry["tool"] == ""


def test_unmarked_custom_claimed_name_stays_with_custom():
    row = _row("Slack", {"paths": {"/corsair/slack/messages": {}}})
    entry = _entry("slack")

    _resolve([_mapped(row)], [entry], claimed={"slack"})

    assert entry["tool"] == "slack"


def test_underivable_plugin_is_withheld():
    row = _row("Slack", {"operations": [{"operationId": "no-dot"}]})
    entry = _entry("Slack", source="platform")

    _resolve([_mapped(row)], [entry])

    assert entry["tool"] == ""


def test_underivable_unmarked_entry_is_withheld():
    row = _row("Slack", {"operations": [{"operationId": "no-dot"}]})
    entry = _entry("Slack")

    _resolve([_mapped(row)], [entry])

    assert entry["tool"] == ""


def test_unmapped_catalog_row_is_reserved_and_withheld():
    row = _row("Slack", {"paths": {"/corsair/slack/messages": {}}})
    entry = _entry("Slack")

    _resolve([_unmapped(row)], [entry])

    assert entry["tool"] == ""


def test_disabled_catalog_row_is_reserved_and_withheld():
    row = _row("Slack", {"paths": {"/corsair/slack/messages": {}}}, is_disabled=True)
    entry = _entry("slack", source="platform")

    _resolve([_mapped(row)], [entry])

    assert entry["tool"] == ""


def test_catalog_statement_outer_joins_tenant_mapping():
    tenant_id = uuid4()

    sql = str(
        catalog_statement(tenant_id).compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )

    assert "LEFT OUTER JOIN" in sql
    assert '"ai_TenantPlatformTools"."Id"' in sql
    assert f"\"ai_TenantPlatformTools\".\"TenantId\" = '{tenant_id}'" in sql


def test_withhold_blank_entries():
    model_entry = SimpleNamespace(tool="Slack")
    dict_entry = _entry("Slack")

    withhold_platform_entries([model_entry, dict_entry])

    assert model_entry.tool == ""
    assert dict_entry["tool"] == ""


@pytest.mark.parametrize("schema", [None, {}, {"paths": "not-a-dict"}])
def test_malformed_schema_is_ignored(schema):
    row = _row("Slack", schema)
    entry = _entry("Slack", source="platform")

    _resolve([_mapped(row)], [entry])

    assert entry["tool"] == ""
