"""LiveKit function tools for one realtime voice session.

A realtime provider runs the whole conversation itself, so it never reaches the
LangGraph tool node. This bridge exposes the configured ``approval == "auto"``
actions as LiveKit function tools and runs every call through the shared
``ToolExecutor``, which keeps credentials, Corsair, Outlook, and custom OpenAPI
behaviour identical to the pipeline. Human-approval actions are omitted because
a call has no approval UI.
"""

from __future__ import annotations

import json
import time
from typing import Any, Callable

from langchain_core.tools import BaseTool
from livekit.agents import RunContext, llm

from app.core.config import settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.features.langgraph.tools.tool_config_utils import APPROVAL_AUTO
from app.features.langgraph.services.tool_approval import (
    build_tool_approval_map,
    canonical_tool_name,
)
from app.features.langgraph.tools.tool_executor import (
    TOOL_STATUS_ERROR,
    TOOL_STATUS_SUCCESS,
    ToolExecutor,
)
from app.features.langgraph.tools.tool_loader import load_platform_tools
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.langgraph.tools.tool_resolver import resolve_configured_tools
from app.features.llm_providers.llm_kb_retrieval import search_knowledge

from .chat_bridge import build_voice_llm_request
from .events import VoiceSessionEvents
from .metadata import VoiceJobClaims
from .stt_adapter import build_user

KNOWLEDGE_TOOL_NAME = "search_knowledge"
KNOWLEDGE_TOOL_DESCRIPTION = (
    "Search the knowledge bases configured for this agent. Call it before "
    "answering product, policy, or account questions so the answer is grounded."
)
KNOWLEDGE_SYSTEM_INSTRUCTION = (
    "Call search_knowledge before answering product, policy, or account questions."
)
KNOWLEDGE_EMPTY_RESULT = "No matching knowledge base content was found."


def _as_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    return json.dumps(content, default=str) if content is not None else ""


def _tool_request(claims: VoiceJobClaims, agent_settings: dict):
    """Build the request that carries tool and knowledge-base configuration.

    A realtime agent may have no chat-model selection: the provider generates
    the speech, so only the tool/KB fields of the request are read here.
    """

    effective_settings = agent_settings
    llm_settings = agent_settings.get("llm") or {}
    if not llm_settings.get("provider"):
        effective_settings = {**agent_settings, "llm": {**llm_settings, "provider": "openai"}}
    return build_voice_llm_request(claims, effective_settings, "")


def _parameters(tool: BaseTool) -> dict[str, Any]:
    """Return the tool's JSON schema parameters for the provider."""

    schema = getattr(tool, "args", None)
    if isinstance(schema, dict) and isinstance(schema.get("properties"), dict):
        return schema

    args_schema = getattr(tool, "args_schema", None)
    if isinstance(args_schema, type) and hasattr(args_schema, "model_json_schema"):
        return args_schema.model_json_schema()

    return {"type": "object", "properties": {}}


class RealtimeToolBridge:
    """Build the realtime function tools and execute their calls."""

    def __init__(
        self,
        claims: VoiceJobClaims,
        agent_settings: dict,
        events: VoiceSessionEvents,
        *,
        registry: ToolRegistry | None = None,
        on_tool_call: Callable[[dict], None] | None = None,
    ) -> None:
        self._claims = claims
        self._agent_settings = agent_settings
        self._events = events
        self._on_tool_call = on_tool_call
        self._registry = registry or ToolRegistry()
        self._request = _tool_request(claims, agent_settings)
        self._user = build_user(claims)
        self._executor = ToolExecutor([], None, None)
        self.has_knowledge_search = bool(
            (agent_settings.get("knowledgeBase") or {}).get("names")
            or []
        )

    async def build(self) -> list[llm.Tool]:
        """Return the tools a realtime session may call."""

        load_platform_tools(self._registry)

        configured: list[BaseTool] = []
        if self._request.tool_config:
            configured = await self._configured_tools()

        self._executor = ToolExecutor(configured, self._request, self._user)

        approval_map = build_tool_approval_map(self._request.tool_config)
        tools: list[llm.Tool] = []
        seen: set[str] = set()
        for tool in configured:
            canonical_name = canonical_tool_name(
                tool.name,
                self._executor.corsair_paths,
            )
            if approval_map.get(canonical_name) != APPROVAL_AUTO:
                continue
            if tool.name in seen:
                continue
            seen.add(tool.name)
            tools.append(self._function_tool(tool))

        if self.has_knowledge_search:
            tools.append(self._knowledge_tool())
        return tools

    async def _configured_tools(self) -> list[BaseTool]:
        try:
            async with get_db_session_context(
                settings.POSTGRESQL_WORKSPACE_DB_NAME
            ) as session:
                return await resolve_configured_tools(
                    self._request,
                    self._user,
                    self._registry,
                    session,
                )
        except Exception:
            logger.exception(
                "[voice-agent] configured tool load failed conversation=%s",
                self._claims.conversation_id,
            )
            try:
                return await resolve_configured_tools(
                    self._request,
                    self._user,
                    self._registry,
                )
            except Exception:
                logger.exception(
                    "[voice-agent] configured tool resolve failed conversation=%s",
                    self._claims.conversation_id,
                )
                return []

    def _function_tool(self, tool: BaseTool) -> llm.Tool:
        tool_name = tool.name

        async def invoke(
            raw_arguments: dict[str, Any],
            ctx: RunContext,
        ) -> str:
            return await self._call(
                tool_name,
                raw_arguments,
                ctx.function_call.call_id,
            )

        return llm.function_tool(
            invoke,
            raw_schema={
                "name": tool_name,
                "description": tool.description or tool_name,
                "parameters": _parameters(tool),
            },
        )

    def _knowledge_tool(self) -> llm.Tool:
        async def invoke(
            raw_arguments: dict[str, Any],
            ctx: RunContext,
        ) -> str:
            query = str(raw_arguments.get("query") or "")
            return await self._search_knowledge(
                query,
                ctx.function_call.call_id,
            )

        return llm.function_tool(
            invoke,
            raw_schema={
                "name": KNOWLEDGE_TOOL_NAME,
                "description": KNOWLEDGE_TOOL_DESCRIPTION,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "What to look up in the knowledge bases.",
                        }
                    },
                    "required": ["query"],
                },
            },
        )

    async def _call(
        self,
        tool_name: str,
        args: dict[str, Any],
        call_id: str,
    ) -> str:
        started_at = time.perf_counter()
        try:
            message = await self._executor.execute(
                tool_name,
                args,
                tool_call_id=call_id,
            )
            status = message.status or TOOL_STATUS_SUCCESS
            content = _as_text(message.content)
        except Exception:
            logger.exception(
                "[voice-agent] tool failed name=%s conversation=%s",
                tool_name,
                self._claims.conversation_id,
            )
            status = TOOL_STATUS_ERROR
            content = f"The tool '{tool_name}' could not complete."

        self._publish_tool_call(
            tool_name=tool_name,
            args=args,
            call_id=call_id,
            content=content,
            status=status,
            started_at=started_at,
        )
        return content

    async def _search_knowledge(self, query: str, call_id: str) -> str:
        started_at = time.perf_counter()
        content = ""
        status = TOOL_STATUS_SUCCESS
        try:
            content = await search_knowledge(query, self._request, self._user)
        except Exception:
            logger.exception(
                "[voice-agent] knowledge search failed conversation=%s",
                self._claims.conversation_id,
            )
            status = TOOL_STATUS_ERROR

        content = content or KNOWLEDGE_EMPTY_RESULT
        self._publish_tool_call(
            tool_name=KNOWLEDGE_TOOL_NAME,
            args={"query": query},
            call_id=call_id,
            content=content,
            status=status,
            started_at=started_at,
        )
        return content

    def _publish_tool_call(
        self,
        *,
        tool_name: str,
        args: dict[str, Any],
        call_id: str,
        content: str,
        status: str,
        started_at: float,
    ) -> None:
        payload = {
            "tool_call_id": call_id,
            "name": tool_name,
            "args": args,
            "content": content,
            "status": status,
            "duration_ms": max(
                0,
                round((time.perf_counter() - started_at) * 1000),
            ),
        }
        self._events.tool_call(payload)
        if self._on_tool_call is not None:
            self._on_tool_call(payload)
