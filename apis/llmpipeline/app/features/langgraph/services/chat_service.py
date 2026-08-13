"""High-level service that runs LangGraph chat workflows."""

from collections.abc import AsyncIterator
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

import time
from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.graphs.graph_factory import build_chat_graph
from app.features.langgraph.services.conversation_service import (
    ConversationService,
    conversation_service,
)
from app.features.langgraph.services.credit_usage_service import (
    CreditUsageService,
    credit_usage_service,
)
from app.features.langgraph.skills.skill_loader import load_default_skills
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_loader import load_default_tools
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.custom_tools.custom_tool_loader import load_tools_for_tenant as load_custom_tools
from app.core.config import settings
from app.features.llm_providers.llm_providers_schemas import (
    ChatAgentResponse,
    LLMRequest,
    LLMResponse,
)
from app.features.llm_providers.llm_providers_utils import (
    extract_json_from_llm_response,
)


class ChatService:
    """Execute and stream LangGraph chat requests."""

    def __init__(
        self,
        tool_registry: ToolRegistry,
        skill_registry: SkillRegistry,
        conversation_service: ConversationService,
        credit_usage_service: CreditUsageService | None = None,
    ):
        # Store compiled graph cache
        self._graphs: dict[tuple, Any] = {}

        self.tool_registry = tool_registry
        self.skill_registry = skill_registry
        self.conversation_service = conversation_service
        self.credit_usage_service = credit_usage_service

        # Load default tools and skills
        load_default_tools(self.tool_registry)
        load_default_skills(self.skill_registry)

    async def invoke(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession | None = None,
    ) -> LLMResponse:
        """Execute a chat request and return the complete response."""

        start_time = time.perf_counter()
        langgraph_response = self._create_initial_response(request)

        # Load custom tools from DB before building the graph
        if db_session is not None:
            await self._load_custom_tools(request, user, db_session)

        graph = self._graph(
            request=request,
            user=user,
            db_session=db_session,
        )
        conversation_id = request.conversation_id or str(uuid4())
        config = self._thread_config(conversation_id)

        messages, request_messages, persisted_ids = await self._prepare_input(
            request=request,
            graph=graph,
            config=config,
            db_session=db_session,
        )
        persisted_tool_call_ids: set[str] = set()

        if not request.is_temp_chat and db_session is not None and request_messages:
            await self.conversation_service.save_message(
                db_session=db_session,
                request=request,
                user=user,
                conversation_id=conversation_id,
                message=request_messages[-1],
                persisted_ids=persisted_ids,
                persisted_tool_call_ids=persisted_tool_call_ids,
            )

        response = await graph.ainvoke({"messages": messages}, config)
        response_messages = response.get("messages", []) or []

        graph_response = self._latest_ai_message(response_messages)

        if not request.is_temp_chat and db_session is not None and response_messages:
            await self.conversation_service.save_message(
                db_session=db_session,
                request=request,
                user=user,
                conversation_id=conversation_id,
                message=response_messages[-1],
                persisted_ids=persisted_ids,
                persisted_tool_call_ids=persisted_tool_call_ids,
            )

        return self._create_final_response(
            request=request,
            response=langgraph_response,
            graph_response=graph_response,
            start_time=start_time,
            jwt=user.access_token,
        )

    async def stream(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession | None = None,
    ) -> AsyncIterator[Any]:
        """Stream chat responses."""

        start_time = time.perf_counter()
        langgraph_response = self._create_initial_response(request)

        # Load custom tools from DB before building the graph
        if db_session is not None:
            await self._load_custom_tools(request, user, db_session)

        graph = self._graph(
            request=request,
            user=user,
            db_session=db_session,
        )
        conversation_id = request.conversation_id or str(uuid4())
        config = self._thread_config(conversation_id)

        messages, request_messages, persisted_ids = await self._prepare_input(
            request=request,
            graph=graph,
            config=config,
            db_session=db_session,
        )

        graph_response = None
        persisted_tool_call_ids: set[str] = set()

        if not request.is_temp_chat and db_session is not None and request_messages:
            await self.conversation_service.save_message(
                db_session=db_session,
                request=request,
                user=user,
                conversation_id=conversation_id,
                message=request_messages[-1],
                persisted_ids=persisted_ids,
                persisted_tool_call_ids=persisted_tool_call_ids,
            )

        async for event in graph.astream_events(
            {"messages": messages},
            config=config,
            stream_mode="messages",
            version="v2",
        ):
            event_type = event.get("event")
            data = event.get("data", {})
            event_metadata = event.get("metadata", {})

            if event_type == "on_tool_end":
                output = data.get("output")
                if isinstance(output, ToolMessage):
                    graph_response = self._latest_ai_message(
                        [output],
                        fallback=graph_response,
                    )

                    if not request.is_temp_chat and db_session is not None:
                        await self.conversation_service.save_message(
                            db_session=db_session,
                            request=request,
                            user=user,
                            conversation_id=conversation_id,
                            message=output,
                            persisted_ids=persisted_ids,
                            persisted_tool_call_ids=persisted_tool_call_ids,
                        )

            elif event_type == "on_chain_end":
                output = data.get("output")
                if isinstance(output, dict):
                    output_messages = output.get("messages", [])
                    graph_response = self._latest_ai_message(
                        output_messages,
                        fallback=graph_response,
                    )

                    # Only persist per-node completions. The top-level
                    # LangGraph on_chain_end repeats the full message history
                    # and would create duplicate rows.
                    if (
                        not request.is_temp_chat
                        and db_session is not None
                        and event_metadata.get("langgraph_node")
                        and output_messages
                    ):
                        await self.conversation_service.save_message(
                            db_session=db_session,
                            request=request,
                            user=user,
                            conversation_id=conversation_id,
                            message=output_messages[-1],
                            persisted_ids=persisted_ids,
                            persisted_tool_call_ids=persisted_tool_call_ids,
                        )

            yield event

        response_messages: list[BaseMessage] = []

        if not request.is_temp_chat and db_session is not None:
            try:
                state = await graph.aget_state(config)
                response_messages = state.values.get("messages", [])
            except Exception:
                logger.exception(
                    "Failed to retrieve graph state after streaming. "
                    "conversation_id=%s",
                    conversation_id,
                )

            if response_messages:
                await self.conversation_service.save_message(
                    db_session=db_session,
                    request=request,
                    user=user,
                    conversation_id=conversation_id,
                    message=response_messages[-1],
                    persisted_ids=persisted_ids,
                    persisted_tool_call_ids=persisted_tool_call_ids,
                )

        yield self._create_final_response(
            request=request,
            response=langgraph_response,
            graph_response=graph_response,
            start_time=start_time,
            jwt=user.access_token,
        )

    async def stream_normalized(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession | None = None,
    ) -> AsyncIterator[Any]:
        """Stream chat responses as a normalized, frontend-friendly protocol.

        Unlike :meth:`stream` (which emits raw LangGraph ``astream_events``),
        this yields clean ``LLMChunkResponse``-shaped dicts that the browser
        chat client can consume directly:

        - ``{"type": "delta", "output": "<partial text>"}`` token deltas
        - ``{"type": "tool_call", "output": {tool payload}}`` tool invocations
        - ``{"type": "followup", "output": [...]}`` suggested follow-ups
        - ``{"type": "done", "output": "<final text>"}`` final completion

        ``conversation_id`` is set on every chunk so the client can persist it.
        """

        from app.features.llm_providers.llm_providers_schemas import (
            LLMChunkResponse,
        )

        start_time = time.perf_counter()
        langgraph_response = self._create_initial_response(request)
        conversation_id = request.conversation_id or str(uuid4())
        request.conversation_id = conversation_id

        if db_session is not None:
            await self._load_custom_tools(request, user, db_session)

        graph = self._graph(
            request=request,
            user=user,
            db_session=db_session,
        )
        config = self._thread_config(conversation_id)

        messages, request_messages, persisted_ids = await self._prepare_input(
            request=request,
            graph=graph,
            config=config,
            db_session=db_session,
        )

        if not request.is_temp_chat and db_session is not None and request_messages:
            await self.conversation_service.save_message(
                db_session=db_session,
                request=request,
                user=user,
                conversation_id=conversation_id,
                message=request_messages[-1],
                persisted_ids=persisted_ids,
            )

        text_buffer: list[str] = []
        graph_response = None
        persisted_tool_call_ids: set[str] = set()
        # Track tool name/args per tool_call_id so the UI can render the tool
        # widget (with human-in-loop approval) before execution.
        tool_call_meta: dict[str, dict] = {}

        async for event in graph.astream_events(
            {"messages": messages},
            config=config,
            stream_mode="messages",
            version="v2",
        ):
            event_type = event.get("event")
            data = event.get("data", {})
            event_metadata = event.get("metadata", {})
            node_name = event_metadata.get("langgraph_node")

            # Token-level deltas from the chat model.
            if event_type == "on_chat_model_stream":
                chunk = data.get("chunk")
                if chunk is not None:
                    text = self._extract_text_delta(chunk)
                    if text:
                        text_buffer.append(text)
                        yield LLMChunkResponse(
                            provider=request.provider,
                            model=request.model,
                            output=text,
                            type="delta",
                            conversation_id=conversation_id,
                        )
                continue

            # Tool invocation started: capture name + args for the UI.
            if event_type == "on_tool_start":
                tool_name = event.get("name") or ""
                tool_input = data.get("input") or {}
                tool_call_id = (
                    tool_input.get("tool_call_id")
                    if isinstance(tool_input, dict)
                    else None
                )
                if tool_call_id:
                    tool_call_meta[tool_call_id] = {
                        "name": tool_name,
                        "args": tool_input.get("args", {}),
                    }
                continue

            # Completed tool call (result available).
            if event_type == "on_tool_end":
                output = data.get("output")
                if isinstance(output, ToolMessage):
                    graph_response = self._latest_ai_message(
                        [output],
                        fallback=graph_response,
                    )
                    tool_call_id = getattr(output, "tool_call_id", None)
                    meta = tool_call_meta.get(tool_call_id, {})
                    yield LLMChunkResponse(
                        provider=request.provider,
                        model=request.model,
                        output={
                            "tool_call_id": tool_call_id,
                            "name": meta.get("name", ""),
                            "args": meta.get("args", {}),
                            "content": getattr(output, "content", ""),
                        },
                        type="tool_call",
                        conversation_id=conversation_id,
                    )
                    if not request.is_temp_chat and db_session is not None:
                        await self.conversation_service.save_message(
                            db_session=db_session,
                            request=request,
                            user=user,
                            conversation_id=conversation_id,
                            message=output,
                            persisted_ids=persisted_ids,
                            persisted_tool_call_ids=persisted_tool_call_ids,
                        )
                continue

            # Node completion: capture the latest AI message (final text).
            if event_type == "on_chain_end":
                output = data.get("output")
                if isinstance(output, dict):
                    output_messages = output.get("messages", [])
                    graph_response = self._latest_ai_message(
                        output_messages,
                        fallback=graph_response,
                    )
                    # Surface selected skills when the agent_selector node finishes.
                    if node_name == "agent_selector":
                        metadata = output.get("metadata") or {}
                        selected_skills = metadata.get("selected_skills") or []
                        for skill in selected_skills:
                            skill_name = getattr(skill, "name", None) or (
                                skill.get("name") if isinstance(skill, dict) else None
                            )
                            if skill_name:
                                yield LLMChunkResponse(
                                    provider=request.provider,
                                    model=request.model,
                                    output={"name": skill_name},
                                    type="skill",
                                    conversation_id=conversation_id,
                                )
                    if (
                        not request.is_temp_chat
                        and db_session is not None
                        and node_name
                        and output_messages
                    ):
                        await self.conversation_service.save_message(
                            db_session=db_session,
                            request=request,
                            user=user,
                            conversation_id=conversation_id,
                            message=output_messages[-1],
                            persisted_ids=persisted_ids,
                            persisted_tool_call_ids=persisted_tool_call_ids,
                        )

        # Persist the final AI message if not already saved.
        if not request.is_temp_chat and db_session is not None:
            try:
                state = await graph.aget_state(config)
                final_messages = state.values.get("messages", [])
            except Exception:
                final_messages = []
            if final_messages:
                graph_response = self._latest_ai_message(final_messages, fallback=graph_response)
                await self.conversation_service.save_message(
                    db_session=db_session,
                    request=request,
                    user=user,
                    conversation_id=conversation_id,
                    message=final_messages[-1],
                    persisted_ids=persisted_ids,
                    persisted_tool_call_ids=persisted_tool_call_ids,
                )

        final_response = self._create_final_response(
            request=request,
            response=langgraph_response,
            graph_response=graph_response,
            start_time=start_time,
            jwt=user.access_token,
        )

        final_output = final_response.output
        if isinstance(final_output, ChatAgentResponse):
            if final_output.tools:
                yield LLMChunkResponse(
                    provider=request.provider,
                    model=request.model,
                    output=final_output.tools,
                    type="tools",
                    conversation_id=conversation_id,
                )
            if final_output.followup_messages:
                yield LLMChunkResponse(
                    provider=request.provider,
                    model=request.model,
                    output=final_output.followup_messages,
                    type="followup",
                    conversation_id=conversation_id,
                )
            final_text = final_output.text
        elif isinstance(final_output, str):
            final_text = final_output
        else:
            final_text = str(final_output or "")

        yield LLMChunkResponse(
            provider=request.provider,
            model=request.model,
            output=final_text,
            type="done",
            conversation_id=conversation_id,
        )

    @staticmethod
    def _extract_text_delta(chunk: Any) -> str:
        """Extract a plain-text delta from a LangChain chat message chunk."""
        try:
            content = chunk.content
            if isinstance(content, str):
                return content
            if isinstance(content, list):
                return "".join(
                    part.get("text", "")
                    for part in content
                    if isinstance(part, dict)
                )
            return ""
        except Exception:
            return ""

    async def _load_custom_tools(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession,
    ) -> None:
        """Load custom tools from the DB and register them in the tool registry."""
        try:
            custom_tools = await load_custom_tools(
                session=db_session,
                tenant_id=user.tenant_id,
                flow_version_id=(
                    UUID(request.ref_id) if request.ref_type and request.ref_id else None
                ),
                workspace_api="https://{settings.APP_BASE_URL}/workspace",
                access_token=user.access_token,
            )
            for ct in custom_tools:
                self.tool_registry.register(ct)
            if custom_tools:
                logger.info(
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

    def _thread_config(
        self,
        conversation_id: str,
    ) -> dict[str, Any]:
        """Build the LangGraph checkpoint config for a conversation."""

        return {
            "configurable": {
                "thread_id": conversation_id,
            }
        }

    async def _prepare_input(
        self,
        request: LLMRequest,
        graph: Any,
        config: dict[str, Any],
        db_session: AsyncSession | None,
    ) -> tuple[list[BaseMessage], list[BaseMessage], set[str | None]]:
        """Build graph input and return request/persisted id bookkeeping.

        Returns ``(messages_to_send, request_messages, persisted_ids)``.
        When the in-memory checkpointer already holds state, only the new
        request messages are submitted to avoid duplicate history. When the
        checkpoint is empty (e.g., after a server restart) the persisted history
        is loaded from the workspace DB and prepended.
        """

        request_messages = self.conversation_service.build_request_messages(request)

        if request.is_temp_chat or db_session is None:
            return request_messages, request_messages, set()

        persisted = await self.conversation_service.load_history(
            db_session=db_session,
            conversation_id=config["configurable"]["thread_id"],
        )
        persisted_ids = self.conversation_service.extract_persisted_ids(persisted)

        try:
            state = await graph.aget_state(config)
            if state.values.get("messages"):
                return request_messages, request_messages, persisted_ids
        except Exception:
            logger.exception(
                "Failed to read graph state for conversation_id=%s. "
                "Falling back to request messages only.",
                config["configurable"]["thread_id"],
            )
            return request_messages, request_messages, persisted_ids

        return persisted + request_messages, request_messages, persisted_ids

    def _latest_ai_message(
        self,
        messages: list[BaseMessage],
        fallback: AIMessage | None = None,
    ) -> AIMessage | None:
        """Return the most recent ``AIMessage`` from a message list."""

        return next(
            (
                message
                for message in reversed(messages)
                if isinstance(message, AIMessage)
            ),
            fallback,
        )

    def _graph(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession | None = None,
    ) -> Any:
        """Retrieve or create a compiled LangGraph instance."""

        explicit_tool_names = [
            config.tool
            for config in (request.tool_config or [])
        ]
        explicit_skill_names = list(request.skill_names or [])

        tool_config_key = tuple(sorted(explicit_tool_names))
        skill_config_key = tuple(sorted(explicit_skill_names))

        if not tool_config_key and not skill_config_key:
            tool_config_key = ("__agent_select__",)
            skill_config_key = ("__agent_select__",)

        cache_key = (
            request.provider.strip().lower(),
            request.model,
            request.conversation_id,
            tool_config_key,
            skill_config_key,
            request.is_temp_chat,
        )

        if cache_key not in self._graphs:
            logger.info(
                "Creating new LangGraph. key=%s",
                cache_key,
            )

            self._graphs[cache_key] = build_chat_graph(
                request=request,
                user=user,
                tool_registry=self.tool_registry,
                skill_registry=self.skill_registry,
                db_session=db_session,
                tool_names=explicit_tool_names or None,
                skill_names=explicit_skill_names or None,
            )
        else:
            logger.debug(
                "Using cached LangGraph. key=%s",
                cache_key,
            )

        return self._graphs[cache_key]

    def _create_initial_response(self, request: LLMRequest) -> LLMResponse:
        return LLMResponse(
            provider=request.provider,
            model=request.model,
            output="",
            status=None,
            finish_reason=None,
            temperature=request.temperature,
            top_p=request.top_p,
            stream=request.stream,
            max_output_tokens=request.max_output_tokens,
            is_json_output=request.is_json_output,
            is_byok_enabled=request.is_byok_enabled,
            credential_id=request.credential_id,
            error=None,
            conversation_id=request.conversation_id,
            is_temp_chat=request.is_temp_chat,
            skill_names=request.skill_names,
        )

    def _create_final_response(
        self,
        request: LLMRequest,
        response: LLMResponse,
        graph_response: AIMessage,
        start_time: float,
        jwt: str,
    ) -> LLMResponse:
        """Populate an ``LLMResponse`` from the final LangGraph ``AIMessage``."""

        end_time = time.perf_counter()

        if graph_response is None:
            response.status = "failed"
            response.error = "No AI response was generated."
            response.created_on = datetime.now(timezone.utc)
            response.time_taken = round(time.perf_counter() - start_time, 2)
            return response

        response_metadata = graph_response.response_metadata or {}
        usage_metadata = graph_response.usage_metadata or {}
        usage = response_metadata.get("token_usage", {})

        output = self._extract_output_from_response(
            graph_response,
            request,
        )

        if request.is_chat_agent:
            response.output = self._normalize_chat_agent_output(
                output,
                request.generate_followup_messages,
            )
        else:
            response.output = output

        response.finish_reason = response_metadata.get("finish_reason")
        response.status = self._extract_response_status(response.finish_reason)
        response.created_on = datetime.now(timezone.utc)
        response.time_taken = round(end_time - start_time, 2)
        response.input_tokens = usage_metadata.get("input_tokens", 0)
        response.output_tokens = usage_metadata.get("output_tokens", 0)
        response.input_cached_tokens = usage.get(
            "input_token_details", {}
        ).get("cache_read", 0)
        response.output_reasoning_tokens = usage.get(
            "output_token_details", {}
        ).get("reasoning", 0)

        if (
            self.credit_usage_service
            and not request.is_byok_enabled
            and not request.credential_id
        ):
            self.credit_usage_service.post_usage(
                request=request,
                response=response,
                jwt=jwt,
            )

        return response

    def _normalize_chat_agent_output(
        self,
        output: Any,
        include_followups: bool,
    ) -> ChatAgentResponse:
        """Normalize chat-agent responses into ``ChatAgentResponse``."""

        text = ""
        tools: list[dict] = []
        followup_messages: list[str] = []

        if isinstance(output, dict):
            text = output.get("text", "")
            tools = output.get("tools", [])

            if include_followups:
                followup_messages = output.get("followup_messages", [])

        elif isinstance(output, str):
            text = output

        elif isinstance(output, list):
            tools = output

        return ChatAgentResponse(
            text=text,
            tools=tools,
            followup_messages=followup_messages,
        )

    def _extract_output_from_response(
        self,
        ai_message: AIMessage,
        request: LLMRequest,
    ) -> Any:
        """Extract text from an ``AIMessage`` and optionally parse JSON."""

        content = getattr(ai_message, "content", "")

        if isinstance(content, str):
            output = content
        elif isinstance(content, list):
            output = "".join(
                part.get("text", "")
                for part in content
                if isinstance(part, dict)
            )
        else:
            output = str(content)

        if request.is_json_output:
            return extract_json_from_llm_response(output)

        return output

    def _extract_response_status(
        self,
        reason: str | None = None,
    ) -> str:
        """Convert an LLM finish reason into a normalized status."""

        if not reason:
            return "completed"

        if reason == "stop":
            return "completed"

        if reason == "length":
            return "max_tokens_reached"

        if reason == "content_filter":
            return "content_filtered"

        return reason


# Singleton service instance used across the application.
tool_registry = ToolRegistry()
skill_registry = SkillRegistry()

chat_service = ChatService(
    tool_registry=tool_registry,
    skill_registry=skill_registry,
    conversation_service=conversation_service,
    credit_usage_service=credit_usage_service,
)
