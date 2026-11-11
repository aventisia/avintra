"""Shared tool execution and realtime tool bridge tests (#373, Phase 5, slice 4).

The realtime bridge and the LangGraph tool node must run one implementation of
a tool call, so the parity test drives the same tool through both. The
knowledge retrieval tests fake the vector store, so no database is required.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_voice_tool_bridge.py -q
"""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.graph import END, START, StateGraph

from app.features.langgraph.nodes.tool_node import create_tool_node
from app.features.langgraph.schemas.graph_state import ChatState
from app.features.langgraph.tools import tool_resolver
from app.features.langgraph.tools.tool_executor import ToolExecutor
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.langgraph.tools.tool_resolver import resolve_configured_tools
from app.features.llm_providers import llm_kb_retrieval
from app.features.llm_providers.llm_kb_retrieval import (
    retrieve_and_inject_kb_context,
    search_knowledge,
)
from app.features.llm_providers.llm_providers_schemas import (
    LLMRequest,
    ToolAction,
    ToolConfig,
)
from voice_agent import tool_bridge
from voice_agent.metadata import VoiceJobClaims
from voice_agent.stt_adapter import build_user
from voice_agent.tool_bridge import (
    KNOWLEDGE_TOOL_NAME,
    RealtimeToolBridge,
)
from .voice_test_helpers import FLOW_ID, voice_claims


def _claims(*, mode: str = "test") -> VoiceJobClaims:
    return voice_claims(mode=mode)


def _request(
    *,
    tool_config: list[ToolConfig] | None = None,
    kb_names: list[str] | None = None,
) -> LLMRequest:
    return LLMRequest(
        provider="openai",
        model="gpt-4o-mini",
        input="hello",
        tool_config=tool_config,
        kb_names=kb_names,
        ref_type="Agent",
        ref_id=str(FLOW_ID),
        ref_name="Support Agent",
        action="AgentExecution",
        agent_name="Support Agent",
    )


def _agent_settings(
    *,
    tools: list[dict] | None = None,
    knowledge_base: dict | None = None,
) -> dict:
    return {
        "agentName": "Support Agent",
        "engineMode": "realtime",
        "llm": {"provider": "openai", "model": "gpt-4o-mini"},
        "tools": tools or [],
        "knowledgeBase": knowledge_base or {"names": []},
    }


class _Events:
    def __init__(self) -> None:
        self.tool_calls: list[dict] = []

    def tool_call(self, payload, *, turn_id=None) -> None:
        self.tool_calls.append(payload)


class _FakeSessionContext:
    async def __aenter__(self):
        return SimpleNamespace(info={})

    async def __aexit__(self, *args) -> None:
        return None


def _patch_tool_context(monkeypatch) -> None:
    monkeypatch.setattr(
        tool_bridge,
        "get_db_session_context",
        lambda _name: _FakeSessionContext(),
    )
    monkeypatch.setattr(
        tool_resolver,
        "load_custom_tools",
        AsyncMock(return_value=[]),
    )


def _demo_tool(calls: list[str]):
    @tool
    def demo_lookup(query: str) -> str:
        """Look up a demo value."""
        calls.append(query)
        return "demo-result"

    return demo_lookup


def _tool_call(name: str, args: dict, call_id: str = "call-1") -> dict:
    return {"id": call_id, "name": name, "args": args, "type": "tool_call"}


# ---------------------------------------------------------------------------
# Shared executor
# ---------------------------------------------------------------------------


class TestSharedToolExecutor:
    def test_node_and_executor_return_the_same_result(self):
        calls: list[str] = []
        tool = _demo_tool(calls)
        request = _request()
        message = AIMessage(content="", tool_calls=[_tool_call(tool.name, {"query": "x"})])

        graph = StateGraph(ChatState)
        graph.add_node("tools", create_tool_node([tool], request))
        graph.add_edge(START, "tools")
        graph.add_edge("tools", END)
        node_result = asyncio.run(
            graph.compile().ainvoke(
                {"messages": [message], "metadata": {"request": request}}
            )
        )
        [node_message] = [
            item for item in node_result["messages"] if isinstance(item, ToolMessage)
        ]

        executor_message = asyncio.run(
            ToolExecutor([tool], request, build_user(_claims())).execute(
                tool.name,
                {"query": "x"},
                tool_call_id="call-1",
            )
        )

        assert isinstance(node_message, ToolMessage)
        assert node_message.content == executor_message.content == "demo-result"
        assert node_message.status == executor_message.status == "success"
        assert node_message.tool_call_id == executor_message.tool_call_id == "call-1"
        assert calls == ["x", "x"]

    def test_unconfigured_tool_returns_an_error_message(self):
        message = asyncio.run(
            ToolExecutor([], _request(), build_user(_claims())).execute(
                "missing_tool",
                {},
                tool_call_id="call-9",
            )
        )

        assert message.status == "error"
        assert "not configured" in message.content
        assert message.tool_call_id == "call-9"

    def test_outlook_without_a_credential_fails_before_any_send(self, monkeypatch):
        send = AsyncMock()
        monkeypatch.setattr(
            "app.features.langgraph.tools.tool_executor.send_email_via_outlook",
            send,
        )
        request = _request(
            tool_config=[
                ToolConfig(
                    tool="outlook",
                    actions=[ToolAction(action="send_email", approval="auto")],
                )
            ]
        )

        message = asyncio.run(
            ToolExecutor([], request, build_user(_claims())).execute(
                "outlook_send_email",
                {"to": "a@example.com"},
                tool_call_id="call-2",
            )
        )

        assert message.status == "error"
        assert message.content == "No Outlook credential configured for this agent."
        send.assert_not_awaited()

    def test_corsair_runs_through_the_sidecar_with_the_dotted_path(self, monkeypatch):
        invoke = AsyncMock(return_value={"success": True, "data": {"ok": True}})
        monkeypatch.setattr(
            "app.features.langgraph.tools.tool_executor.invoke_corsair_tool",
            invoke,
        )
        user = build_user(_claims())
        request = _request()

        message = asyncio.run(
            ToolExecutor([], request, user).execute(
                "github.api.issues.create",
                {"title": "Bug"},
                tool_call_id="call-3",
            )
        )

        assert message.status == "success"
        assert message.content == '{"ok": true}'
        invoke.assert_awaited_once_with(
            tool_name="github.api.issues.create",
            arguments={"title": "Bug"},
            llm_request=request,
            user=user,
        )


class TestConfiguredTools:
    def test_resolves_the_configured_platform_and_custom_tools(self):
        calls: list[str] = []
        registry = ToolRegistry()
        platform = _demo_tool(calls)

        @tool
        def custom_get_weather(city: str) -> str:
            """Return the weather for a city."""
            return f"sunny in {city}"

        registry.register_many([platform, custom_get_weather])
        request = _request(
            tool_config=[
                ToolConfig(
                    tool="demo",
                    actions=[ToolAction(action="lookup", approval="auto")],
                ),
                ToolConfig(
                    tool="custom",
                    actions=[ToolAction(action="get_weather", approval="auto")],
                ),
            ]
        )

        tools = asyncio.run(
            resolve_configured_tools(request, build_user(_claims()), registry)
        )

        assert [item.name for item in tools] == [
            "demo_lookup",
            "custom_get_weather",
        ]


# ---------------------------------------------------------------------------
# Realtime tool bridge
# ---------------------------------------------------------------------------


class TestRealtimeToolBridge:
    def test_only_auto_approval_actions_become_function_tools(self, monkeypatch):
        _patch_tool_context(monkeypatch)
        calls: list[str] = []
        registry = ToolRegistry()
        registry.register(_demo_tool(calls))

        @tool
        def demo_delete(record: str) -> str:
            """Delete a demo record."""
            return "deleted"

        registry.register(demo_delete)
        settings = _agent_settings(
            tools=[
                {
                    "tool": "demo",
                    "actions": [
                        {"action": "lookup", "approval": "auto"},
                        {"action": "delete", "approval": "human"},
                    ],
                }
            ]
        )
        events = _Events()
        bridge = RealtimeToolBridge(_claims(), settings, events, registry=registry)

        tools = asyncio.run(bridge.build())

        assert [tool.info.name for tool in tools] == ["demo_lookup"]

    def test_auto_tool_runs_and_publishes_its_duration(self, monkeypatch):
        _patch_tool_context(monkeypatch)
        calls: list[str] = []
        registry = ToolRegistry()
        registry.register(_demo_tool(calls))
        settings = _agent_settings(
            tools=[
                {
                    "tool": "demo",
                    "actions": [{"action": "lookup", "approval": "auto"}],
                }
            ]
        )
        events = _Events()
        bridge = RealtimeToolBridge(_claims(), settings, events, registry=registry)
        [function_tool] = asyncio.run(bridge.build())
        ctx = SimpleNamespace(function_call=SimpleNamespace(call_id="call-7"))

        content = asyncio.run(function_tool({"query": "order status"}, ctx))

        assert content == "demo-result"
        assert calls == ["order status"]
        [event] = events.tool_calls
        assert event["tool_call_id"] == "call-7"
        assert event["name"] == "demo_lookup"
        assert event["args"] == {"query": "order status"}
        assert event["content"] == "demo-result"
        assert event["status"] == "success"
        assert isinstance(event["duration_ms"], int)
        assert event["duration_ms"] >= 0

    def test_custom_openapi_tool_runs_from_realtime(self, monkeypatch):
        _patch_tool_context(monkeypatch)
        executed: list[str] = []

        @tool
        def custom_get_weather(city: str) -> str:
            """Return the weather for a city."""
            executed.append(city)
            return f"sunny in {city}"

        registry = ToolRegistry()
        registry.register(custom_get_weather)
        settings = _agent_settings(
            tools=[
                {
                    "tool": "custom",
                    "actions": [{"action": "get_weather", "approval": "auto"}],
                }
            ]
        )
        bridge = RealtimeToolBridge(
            _claims(), settings, _Events(), registry=registry
        )
        [function_tool] = asyncio.run(bridge.build())
        ctx = SimpleNamespace(function_call=SimpleNamespace(call_id="call-8"))

        content = asyncio.run(function_tool({"city": "Jakarta"}, ctx))

        assert content == "sunny in Jakarta"
        assert executed == ["Jakarta"]

    def test_knowledge_tool_is_registered_only_when_kbs_are_configured(
        self, monkeypatch
    ):
        _patch_tool_context(monkeypatch)
        search = AsyncMock(return_value="[Knowledge Base Context]\nReturns take 30 days.")
        monkeypatch.setattr(tool_bridge, "search_knowledge", search)
        settings = _agent_settings(knowledge_base={"names": ["kb-one"], "topK": 3})
        events = _Events()
        bridge = RealtimeToolBridge(_claims(), settings, events)

        [function_tool] = asyncio.run(bridge.build())
        ctx = SimpleNamespace(function_call=SimpleNamespace(call_id="call-9"))
        content = asyncio.run(function_tool({"query": "return policy"}, ctx))

        assert function_tool.info.name == KNOWLEDGE_TOOL_NAME
        assert "[Knowledge Base Context]" in content
        search.assert_awaited_once()
        assert search.await_args.args[0] == "return policy"
        [event] = events.tool_calls
        assert event["name"] == KNOWLEDGE_TOOL_NAME
        assert event["args"] == {"query": "return policy"}

    def test_no_tools_skips_the_database(self, monkeypatch):
        def reject_database(_name):
            raise AssertionError("database used")

        monkeypatch.setattr(
            tool_bridge,
            "get_db_session_context",
            reject_database,
        )
        bridge = RealtimeToolBridge(
            _claims(),
            _agent_settings(),
            _Events(),
        )

        assert asyncio.run(bridge.build()) == []


# ---------------------------------------------------------------------------
# Knowledge retrieval
# ---------------------------------------------------------------------------


class _VectorStore:
    def __init__(self, chunk: str) -> None:
        self._chunk = chunk
        self.queries: list[object] = []

    async def query_document(self, request, user):
        self.queries.append(request)
        return SimpleNamespace(
            error=None,
            chunks=[
                SimpleNamespace(content=self._chunk, similarity_score=0.9)
            ],
        )


def _patch_kb(monkeypatch, store: _VectorStore) -> None:
    async def configs(**_kwargs):
        return [
            {
                "kb_name": "kb-one",
                "embedding_provider": "openai",
                "embedding_model": "text-embedding-3-small",
                "embedding_credential_id": None,
                "store_credential_id": None,
                "vector_store": "pgvector",
            }
        ]

    monkeypatch.setattr(llm_kb_retrieval, "_resolve_kb_embedding_configs", configs)
    monkeypatch.setattr(
        llm_kb_retrieval,
        "get_db_session_context",
        lambda _name: _FakeSessionContext(),
    )
    monkeypatch.setattr(
        llm_kb_retrieval,
        "TenantDB",
        lambda *, session, tenant_id: SimpleNamespace(
            session=session,
            tenant_id=tenant_id,
        ),
    )
    monkeypatch.setattr(
        llm_kb_retrieval,
        "get_vector_store",
        lambda _store, _db: store,
    )


class TestSearchKnowledge:
    def test_returns_the_grounded_context_block(self, monkeypatch):
        store = _VectorStore("Refunds are accepted within 30 days.")
        _patch_kb(monkeypatch, store)
        request = _request(kb_names=["kb-one"])

        context = asyncio.run(
            search_knowledge("return policy", request, build_user(_claims()))
        )

        assert context.startswith("[Knowledge Base Context]")
        assert "Refunds are accepted within 30 days." in context
        assert context.endswith("[/Knowledge Base Context]")
        assert store.queries[0].query == "return policy"
        assert store.queries[0].kb_names == ["kb-one"]

    def test_retrieve_and_inject_uses_the_same_retrieval(self, monkeypatch):
        store = _VectorStore("Refunds are accepted within 30 days.")
        _patch_kb(monkeypatch, store)
        request = _request(kb_names=["kb-one"])

        asyncio.run(retrieve_and_inject_kb_context(request, build_user(_claims())))

        assert request.input.startswith("[Knowledge Base Context]")
        assert "Refunds are accepted within 30 days." in request.input
        assert request.input.endswith("hello")

    def test_retrieval_failure_returns_no_context(self, monkeypatch):
        async def fail(**_kwargs):
            raise RuntimeError("vector store down")

        monkeypatch.setattr(
            llm_kb_retrieval, "_resolve_kb_embedding_configs", fail
        )
        request = _request(kb_names=["kb-one"])

        context = asyncio.run(
            search_knowledge("return policy", request, build_user(_claims()))
        )
        asyncio.run(retrieve_and_inject_kb_context(request, build_user(_claims())))

        assert context == ""
        assert request.input == "hello"
