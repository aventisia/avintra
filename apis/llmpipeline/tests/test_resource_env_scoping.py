"""Environment-scoping regression tests for issue #273 (Prod clone resource integrity).

Covers the llmpipeline half of the fix: the shared env normalizer, Studio
``tool_config`` root extraction, the ``EnvType``/``SpaceId`` mappings added to
the Skill/Tool ORM models, and the env + name-scoped queries used by the chat
custom-tool and user-skill loaders.

Statements are captured from a fake async session and compiled with literal
binds, so the tests assert on the emitted SQL without a database.

Run from ``apis/llmpipeline`` (``ENV`` defaults to ``local``):

    ./venv/bin/python -m pytest tests/test_resource_env_scoping.py -q
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from sqlalchemy import UniqueConstraint

from app.core.env_utils import normalize_env_type
from app.core.space_utils import normalize_space_id
from app.features.auth.authenticated_user import User
from app.features.custom_tools.custom_tool_loader import load_custom_tools
from app.features.custom_tools.models import Tool
from app.features.langgraph.schemas.skill_registry_models import Skill
from app.features.langgraph.services.chat_service import ChatService
from app.features.langgraph.skills.skill_loader import load_custom_skills
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_config_utils import (
    configured_tool_roots,
    expand_tool_config,
)
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import (
    LLMRequest,
    ToolAction,
    ToolConfig,
)


# ---------------------------------------------------------------------------
# Doubles
# ---------------------------------------------------------------------------


class _FakeResult:
    """Mimics the chained ``Result`` API used by the loaders."""

    def __init__(self, rows=None):
        self._rows = rows or []

    def scalars(self):
        return self

    def unique(self):
        return self

    def all(self):
        return self._rows


class _FakeSession:
    """Captures the statements passed to ``execute`` and returns fixed rows."""

    def __init__(self, rows=None):
        self.rows = rows or []
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _FakeResult(self.rows)


def _sql(statement) -> str:
    return str(statement.compile(compile_kwargs={"literal_binds": True}))


def _user(env_type: str = "prod", space_id: str | None = None) -> User:
    return User(
        user_id=uuid4(),
        username="u",
        roles=["r"],
        tenant_id=uuid4(),
        access_token="x",
        env_type=env_type,
        space_id=space_id,
    )


def _request(tool_config=None) -> LLMRequest:
    return LLMRequest(provider="openai", model="gpt-4o-mini", input="hi", tool_config=tool_config)


# ---------------------------------------------------------------------------
# Shared env normalizer
# ---------------------------------------------------------------------------


class TestNormalizeEnvType:
    def test_missing_or_blank_defaults_to_dev(self):
        assert normalize_env_type(None) == "dev"
        assert normalize_env_type("") == "dev"
        assert normalize_env_type("   ") == "dev"

    def test_case_and_whitespace_normalized(self):
        assert normalize_env_type("  PROD ") == "prod"
        assert normalize_env_type("Dev") == "dev"
        assert normalize_env_type("prod") == "prod"


class TestNormalizeSpaceId:
    def test_missing_or_invalid_defaults_to_central(self):
        assert normalize_space_id(None) is None
        assert normalize_space_id("") is None
        assert normalize_space_id("not-a-uuid") is None

    def test_valid_space_id_is_parsed(self):
        space_id = uuid4()
        assert normalize_space_id(str(space_id)) == space_id


# ---------------------------------------------------------------------------
# Studio tool_config root extraction
# ---------------------------------------------------------------------------


class TestConfiguredToolRoots:
    def test_dict_entries_preserve_order_and_dedupe(self):
        config = [
            {"tool": "outlook", "actions": [{"action": "send_email"}]},
            {"tool": "github", "actions": []},
            {"tool": "outlook", "actions": [{"action": "list"}]},
        ]
        assert configured_tool_roots(config) == ["outlook", "github"]
        # The roots are what ai_Tools.Name stores; expand_tool_config builds the
        # bindable langchain names from the same field.
        assert expand_tool_config(config) == [
            "outlook_send_email",
            "github",
            "outlook_list",
        ]

    def test_pydantic_entries(self):
        config = [
            ToolConfig(
                tool="slack",
                credential_name="c",
                actions=[ToolAction(action="post_message", approval="auto")],
            )
        ]
        assert configured_tool_roots(config) == ["slack"]

    def test_empty_and_blank(self):
        assert configured_tool_roots([]) == []
        assert configured_tool_roots(None) == []
        assert configured_tool_roots([{"tool": "  "}]) == []


# ---------------------------------------------------------------------------
# ORM env mapping
# ---------------------------------------------------------------------------


class TestModelEnvMapping:
    def test_tool_maps_env_space_and_created_on(self):
        columns = {column.name for column in Tool.__table__.columns}
        assert {"EnvType", "SpaceId", "CreatedOn"} <= columns

    def test_skill_maps_env_and_space(self):
        columns = {column.name for column in Skill.__table__.columns}
        assert {"EnvType", "SpaceId"} <= columns

    def test_skill_unique_constraint_matches_db(self):
        unique = [
            constraint
            for constraint in Skill.__table__.constraints
            if isinstance(constraint, UniqueConstraint)
        ]
        assert unique, "expected a unique constraint on Skill"
        columns = {column.name for column in unique[0].columns}
        assert columns == {"TenantId", "SpaceId", "EnvType", "Name"}


# ---------------------------------------------------------------------------
# Custom tool loader: env + configured-name scoping
# ---------------------------------------------------------------------------


class TestLoadToolsForTenant:
    def test_empty_names_load_nothing(self):
        session = _FakeSession()
        result = asyncio.run(
            load_custom_tools(session=session, tenant_id=uuid4(), tool_names=[])
        )
        assert result == []
        assert session.statements == []

    def test_scoped_by_env_and_name(self):
        session = _FakeSession()
        asyncio.run(
            load_custom_tools(
                session=session,
                tenant_id=uuid4(),
                tool_names=["outlook"],
                env_type="PROD",
                workspace_api="https://example.test/workspace",
                access_token="x",
                space_id=str(uuid4()),
            )
        )
        assert len(session.statements) == 1
        sql = _sql(session.statements[0])
        assert '"EnvType"' in sql and "lower" in sql
        assert "'prod'" in sql
        assert '"Name" IN' in sql and "'outlook'" in sql
        assert '"CreatedOn"' in sql
        assert "CASE" in sql


# ---------------------------------------------------------------------------
# Custom skill loader: env scoping
# ---------------------------------------------------------------------------


class TestLoadCustomSkillsFromDb:
    def test_scoped_by_env(self):
        session = _FakeSession()
        loaded = asyncio.run(
            load_custom_skills(
                registry=SkillRegistry(),
                db_session=session,
                tenant_id=str(uuid4()),
                env_type="Prod",
                space_id=str(uuid4()),
            )
        )
        assert loaded == []
        assert len(session.statements) == 1
        sql = _sql(session.statements[0])
        assert '"EnvType"' in sql and "lower" in sql
        assert "'prod'" in sql
        assert '"CreatedOn"' in sql
        assert "CASE" in sql

    def test_invalid_tenant_id_skips_query(self):
        session = _FakeSession()
        loaded = asyncio.run(
            load_custom_skills(
                registry=SkillRegistry(),
                db_session=session,
                tenant_id="not-a-uuid",
                env_type="dev",
            )
        )
        assert loaded == []
        assert session.statements == []


# ---------------------------------------------------------------------------
# Chat wiring: configured custom tools by root name + env
# ---------------------------------------------------------------------------


class TestChatLoadCustomTools:
    def _service(self) -> ChatService:
        return ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)

    def test_no_configured_tools_skips_loading(self):
        service = self._service()
        session = _FakeSession()
        with patch(
            "app.features.langgraph.tools.tool_resolver.load_custom_tools",
            new=AsyncMock(),
        ) as loader:
            asyncio.run(service._load_custom_tools(_request(), _user(), session))
        loader.assert_not_awaited()

    def test_configured_tools_loaded_by_root_and_env(self):
        service = self._service()
        request = _request(
            tool_config=[
                ToolConfig(
                    tool="outlook",
                    credential_name="c",
                    actions=[ToolAction(action="send_email", approval="auto")],
                )
            ]
        )
        fake_tools = [SimpleNamespace(name="outlook_send_email")]
        session = _FakeSession()
        with patch(
            "app.features.langgraph.tools.tool_resolver.load_custom_tools",
            new=AsyncMock(return_value=fake_tools),
        ) as loader:
            asyncio.run(
                service._load_custom_tools(
                    request,
                    _user(env_type="prod", space_id=str(uuid4())),
                    session,
                )
            )

        loader.assert_awaited_once()
        kwargs = loader.await_args.kwargs
        assert kwargs["tool_names"] == ["outlook"]
        assert kwargs["env_type"] == "prod"
        assert kwargs["space_id"] is not None
        # The workspace base URL must be built from settings, not left as a
        # literal "{settings.APP_BASE_URL}" placeholder.
        assert kwargs["workspace_api"].startswith("https://")
        assert kwargs["workspace_api"].endswith("/workspace")
        assert "{settings" not in kwargs["workspace_api"]
        assert service.tool_registry.exists("outlook_send_email")
