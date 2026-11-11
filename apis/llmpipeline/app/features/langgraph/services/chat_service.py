"""High-level service that runs LangGraph chat workflows."""

import asyncio
import json
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import time
from collections import OrderedDict

from langchain_core.messages import AIMessage, BaseMessage, ToolMessage
from langgraph.types import Command
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.checkpoint.memory import graph_memory
from app.features.langgraph.graphs.graph_factory import build_chat_graph
from app.features.langgraph.services.request_context import restore_request
from app.features.langgraph.services.tool_approval import (
    APPROVAL_EXPIRED,
    APPROVAL_MARKER_KEY,
    pending_approval_tool_calls,
    verify_pause_owner,
)
from app.features.langgraph.services.conversation_service import (
    ConversationService,
    conversation_service,
)
from app.features.langgraph.services.credit_usage_service import (
    CreditUsageService,
    credit_usage_service,
)
from app.features.langgraph.skills.skill_loader import (
    load_custom_skills,
    load_platform_skills,
)
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_loader import load_platform_tools
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.langgraph.tools.tool_config_utils import (
    configured_tool_roots,
    expand_tool_config,
)
from app.features.custom_tools.custom_tool_loader import load_custom_tools
from app.core.config import settings
from app.features.llm_providers.llm_providers_schemas import (
    ChatAgentResponse,
    LLMChunkResponse,
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
        # Compiled-graph cache (MRU at the end). Pause/resume routing uses
        # _conversation_graph_key to find the LATEST graph built for a
        # conversation, since editing an agent's config creates a second cache
        # key for the same thread.
        self._graphs: "OrderedDict[tuple, Any]" = OrderedDict()
        self._graph_cache_limit = 512
        self._conversation_graph_key: dict[str, tuple] = {}
        # Conversations with an outstanding approval pause; their graphs are
        # never evicted (a missing graph turns a pending approval into a 409).
        self._pending_approval_conversations: set[str] = set()

        self.tool_registry = tool_registry
        self.skill_registry = skill_registry
        self.conversation_service = conversation_service
        self.credit_usage_service = credit_usage_service

        # Load platform tools and skills
        load_platform_tools(self.tool_registry)
        load_platform_skills(self.skill_registry)

    async def invoke(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession | None = None,
    ) -> LLMResponse:
        """Execute a chat request and return the complete response."""

        start_time = time.perf_counter()
        langgraph_response = self._create_initial_response(request)

        # Load custom tools and custom skills from DB before building the graph
        if db_session is not None:
            await self._load_custom_tools(request, user, db_session)
            await self._load_custom_skills(user, db_session)

        graph = self._graph(
            request=request,
            user=user,
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

        response = await graph.ainvoke(
            {
                "messages": messages,
                # The compiled graph is cached per conversation, so the request
                # captured at build time goes stale. Seed each invocation with
                # the current request/user for per-message planner gating.
                "metadata": {"request": request, "user": user},
            },
            config,
        )
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
            space_id=user.space_id,
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

        # Load custom tools and custom skills from DB before building the graph
        if db_session is not None:
            await self._load_custom_tools(request, user, db_session)
            await self._load_custom_skills(user, db_session)

        graph = self._graph(
            request=request,
            user=user,
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
            {
                "messages": messages,
                # Seed the current request so per-message planner gating sees
                # this turn's input rather than the graph-build-time request.
                "metadata": {"request": request, "user": user},
            },
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
            space_id=user.space_id,
        )

    async def stream_normalized(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession | None = None,
        resume_decisions: dict[str, str] | None = None,
    ) -> AsyncIterator[Any]:
        """Stream chat responses, persisting a replayable UI transcript.

        Delegates to :meth:`_stream_normalized_impl` and records every yielded
        normalized frame so the conversation can be rehydrated with the same
        structured content on reload. The transcript row is written when the
        terminal ``done`` frame is reached but before it is yielded, because the
        SSE route commits the shared session right after each frame.
        """

        transcript_frames: list[dict[str, Any]] = []
        transcript_text: list[str] = []

        async for chunk in self._stream_normalized_impl(
            request=request,
            user=user,
            db_session=db_session,
            resume_decisions=resume_decisions,
        ):
            chunk_type = getattr(chunk, "type", None)
            output = getattr(chunk, "output", None)

            if chunk_type == "delta" and isinstance(output, str):
                transcript_text.append(output)

            try:
                frame = json.loads(chunk.model_dump_json())
            except Exception:
                frame = None

            if chunk_type == "done":
                if frame is not None:
                    transcript_frames.append(frame)

                conversation_id = getattr(request, "conversation_id", None)
                if (
                    not request.is_temp_chat
                    and db_session is not None
                    and conversation_id
                ):
                    content = "".join(transcript_text)
                    if not content and isinstance(output, str):
                        content = output
                    await self.conversation_service.save_transcript(
                        db_session=db_session,
                        request=request,
                        user=user,
                        conversation_id=conversation_id,
                        content=content,
                        frames=transcript_frames,
                        decisions=resume_decisions,
                    )

                yield chunk
                continue

            if frame is not None:
                transcript_frames.append(frame)

            yield chunk

    async def _stream_normalized_impl(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession | None = None,
        resume_decisions: dict[str, str] | None = None,
    ) -> AsyncIterator[Any]:
        """Stream chat responses as a normalized, frontend-friendly protocol.

        Unlike :meth:`stream` (which emits raw LangGraph ``astream_events``),
        this yields clean ``LLMChunkResponse``-shaped dicts that the browser
        chat client can consume directly:

        - ``{"type": "delta", "output": "<partial text>"}`` token deltas
        - ``{"type": "tool_call", "output": {tool payload}}`` tool invocations
        - ``{"type": "approval_required", "output": {...}}`` pending approvals
        - ``{"type": "followup", "output": [...]}`` suggested follow-ups
        - ``{"type": "done", "output": "<final text>"}`` final completion

        ``conversation_id`` is set on every chunk so the client can persist it.

        When ``resume_decisions`` is provided, the paused tool approval for
        ``request.conversation_id`` is resumed instead of starting a new turn.
        """

        start_time = time.perf_counter()
        langgraph_response = self._create_initial_response(request)
        conversation_id = request.conversation_id or str(uuid4())
        request.conversation_id = conversation_id

        if resume_decisions is not None:
            # Resume a paused turn: approved calls execute, denied calls return
            # denial ToolMessages, then the model continues the same turn.
            graph = self._graph_for_conversation(conversation_id)
            if graph is None:
                raise ValueError(
                    "No paused conversation found for this approval request."
                )
            config = self._thread_config(conversation_id)
            request_messages: list[BaseMessage] = []
            persisted_ids: set[str | None] = set()
            # ``Command(resume={})`` is treated by LangGraph as "no resume" and
            # re-interrupts, so always send a truthy payload; unknown/missing
            # decisions fail closed to denial inside the tool node.
            resume_payload = resume_decisions or {"__no_decision__": "deny"}
            graph_input: Any = Command(
                resume=resume_payload,
                # Checkpoint deserialization strips live objects (and the user's
                # access token), so re-seed them for the resumed nodes.
                update={
                    "metadata": {
                        "request": request,
                        "user": user,
                        "approval_enabled": True,
                    }
                },
            )
        else:
            if db_session is not None:
                await self._load_custom_tools(request, user, db_session)
                await self._load_custom_skills(user, db_session)

            graph = self._graph(
                request=request,
                user=user,
            )
            config = self._thread_config(conversation_id)

            if (
                request.keep_user_turns is not None
                and not request.is_temp_chat
                and db_session is not None
            ):
                # The checkpoint holds the replaced turns too; dropping it makes
                # the turn below reload the truncated history from the DB.
                await self.conversation_service.truncate_history(
                    db_session=db_session,
                    conversation_id=conversation_id,
                    keep_user_turns=request.keep_user_turns,
                )
                await graph_memory.adelete_thread(conversation_id)

            # A new message while an approval is pending cannot be processed
            # until the pause is cleared: auto-deny the stale requests first.
            cancel_frames, cleared = await self._clear_stale_approvals(
                graph=graph,
                config=config,
                request=request,
                user=user,
                conversation_id=conversation_id,
                db_session=db_session,
            )
            for chunk in cancel_frames:
                yield chunk
            if not cleared:
                return

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

            graph_input = {
                "messages": messages,
                # Seed the current request so per-message planner gating sees
                # this turn's input rather than the graph-build-time request.
                "metadata": {
                    "request": request,
                    "user": user,
                    # IMPORTANT NOTE: Approval pauses are enforced only on
                    # this interactive, streaming chat path. Workflow and
                    # non-normalized action-execution endpoints run without
                    # human approval gating by design.
                    "approval_enabled": True,
                },
            }

        text_buffer: list[str] = []
        graph_response = None
        persisted_tool_call_ids: set[str] = set()
        # Track tool name/args per tool_call_id so the UI can render the tool
        # widget (with human-in-loop approval) before execution.
        tool_call_meta: dict[str, dict] = {}
        # Ids whose completion frame has already been emitted (on_tool_end for
        # ToolNode tools; the tools node output below for connector tools).
        completed_tool_call_ids: set[str] = set()
        # When a chat agent is configured to emit JSON (e.g. from a custom
        # prompt/template), the streamed deltas are raw JSON tokens. We buffer
        # them and suppress the raw token frames, then parse the JSON at the end.
        suppress_raw_deltas = request.is_chat_agent

        async for event in graph.astream_events(
            graph_input,
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
                # The planner's token deltas are routing metadata
                # ({"tool_names": [...], "skill_names": [...]}), never user
                # text, so they stay out of the stream and the buffer.
                if node_name == "agent_selector":
                    continue
                chunk = data.get("chunk")
                if chunk is not None:
                    # Reasoning/thinking deltas (when the model emits them).
                    reasoning = self._extract_reasoning_delta(chunk)
                    if reasoning:
                        yield LLMChunkResponse(
                            provider=request.provider,
                            model=request.model,
                            output=reasoning,
                            type="reasoning",
                            conversation_id=conversation_id,
                        )
                    text = self._extract_text_delta(chunk)
                    if text:
                        text_buffer.append(text)
                        # For chat-agent JSON-mode output, suppress raw JSON
                        # deltas; the final parsed text/followups are emitted at
                        # the end as proper typed frames.
                        if not suppress_raw_deltas:
                            yield LLMChunkResponse(
                                provider=request.provider,
                                model=request.model,
                                output=text,
                                type="delta",
                                conversation_id=conversation_id,
                            )
                continue

            # Tools node starting: surface every pending call as a preliminary
            # tool-call frame so the UI can render it as running. The AIMessage's
            # tool_calls are the only reliable source of the ids/names/args:
            # LangGraph invokes tools with their args (no id on on_tool_start),
            # and connector-backed tools bypass the tool runnable entirely, so
            # neither on_tool_start nor on_tool_end can carry them.
            if event_type == "on_chain_start" and node_name == "tools":
                state_input = data.get("input") or {}
                input_messages = state_input.get("messages") or []
                last_message = input_messages[-1] if input_messages else None
                for tool_call in getattr(last_message, "tool_calls", None) or []:
                    tool_call_id = (
                        tool_call.get("id")
                        if isinstance(tool_call, dict)
                        else getattr(tool_call, "id", None)
                    )
                    if not tool_call_id:
                        continue
                    tool_name = (
                        tool_call.get("name", "")
                        if isinstance(tool_call, dict)
                        else getattr(tool_call, "name", "")
                    )
                    tool_args = (
                        tool_call.get("args", {})
                        if isinstance(tool_call, dict)
                        else getattr(tool_call, "args", {})
                    )
                    tool_call_meta[tool_call_id] = {
                        "name": tool_name,
                        "args": tool_args,
                    }
                    yield LLMChunkResponse(
                        provider=request.provider,
                        model=request.model,
                        output={
                            "tool_call_id": tool_call_id,
                            "name": tool_name,
                            "args": tool_args,
                        },
                        type="tool_call",
                        conversation_id=conversation_id,
                    )
                continue

            # Completed tool call (result available). Connector-backed tools are
            # completed from the tools node output below instead.
            if event_type == "on_tool_end":
                output = data.get("output")
                if isinstance(output, ToolMessage):
                    graph_response = self._latest_ai_message(
                        [output],
                        fallback=graph_response,
                    )
                    tool_call_id = getattr(output, "tool_call_id", None)
                    if tool_call_id:
                        completed_tool_call_ids.add(tool_call_id)
                    meta = tool_call_meta.get(tool_call_id, {})
                    yield LLMChunkResponse(
                        provider=request.provider,
                        model=request.model,
                        output={
                            "tool_call_id": tool_call_id,
                            "name": event.get("name") or meta.get("name", ""),
                            "args": meta.get("args", {}),
                            "content": getattr(output, "content", ""),
                            "status": getattr(output, "status", "success"),
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
                    # Connector-backed tools bypass the tool runnable, so their
                    # results only appear in this node output. Emit a completion
                    # frame for every ToolMessage not already completed above.
                    if node_name == "tools":
                        for message in output_messages:
                            if not isinstance(message, ToolMessage):
                                continue
                            tool_call_id = getattr(message, "tool_call_id", None)
                            if (
                                not tool_call_id
                                or tool_call_id in completed_tool_call_ids
                            ):
                                continue
                            completed_tool_call_ids.add(tool_call_id)
                            meta = tool_call_meta.get(tool_call_id, {})
                            yield LLMChunkResponse(
                                provider=request.provider,
                                model=request.model,
                                output={
                                    "tool_call_id": tool_call_id,
                                    "name": meta.get("name", "")
                                    or getattr(message, "name", "")
                                    or "",
                                    "args": meta.get("args", {}),
                                    "content": getattr(message, "content", ""),
                                    "status": getattr(
                                        message, "status", "success"
                                    ),
                                },
                                type="tool_call",
                                conversation_id=conversation_id,
                            )
                    # Surface the skills the planner actually selected for this
                    # request. Unlike mere configuration, a selection means the
                    # skill instructions were injected into the model prompt.
                    if node_name == "agent_selector":
                        selected_skills = (output.get("metadata") or {}).get(
                            "selected_skills"
                        ) or []
                        for skill in selected_skills:
                            skill_name = (
                                skill.get("name")
                                if isinstance(skill, dict)
                                else getattr(skill, "name", None)
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

        # Read the final snapshot once: it drives persistence and surfaces any
        # human approvals the graph paused on during this turn.
        state = None
        try:
            state = await graph.aget_state(config)
        except Exception:
            logger.exception(
                "Failed to retrieve graph state after streaming. "
                "conversation_id=%s",
                conversation_id,
            )

        final_messages = (
            state.values.get("messages", []) if state is not None else []
        )
        if not request.is_temp_chat and db_session is not None and final_messages:
            graph_response = self._latest_ai_message(
                final_messages, fallback=graph_response
            )
            await self.conversation_service.save_message(
                db_session=db_session,
                request=request,
                user=user,
                conversation_id=conversation_id,
                message=final_messages[-1],
                persisted_ids=persisted_ids,
                persisted_tool_call_ids=persisted_tool_call_ids,
            )

        # Surface pending human-approval tool calls so the client can render the
        # confirmation UI. The graph remains paused until /approvals resumes it.
        pending_calls = pending_approval_tool_calls(state)
        if pending_calls:
            self._pending_approval_conversations.add(conversation_id)
        else:
            self._pending_approval_conversations.discard(conversation_id)
        for pending_call in pending_calls:
            yield LLMChunkResponse(
                provider=request.provider,
                model=request.model,
                output=pending_call,
                type="approval_required",
                conversation_id=conversation_id,
            )

        final_response = self._create_final_response(
            request=request,
            response=langgraph_response,
            graph_response=graph_response,
            start_time=start_time,
            jwt=user.access_token,
            space_id=user.space_id,
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
            # Recommended actions are surfaced as follow-up suggestions.
            if final_output.recommended_actions:
                yield LLMChunkResponse(
                    provider=request.provider,
                    model=request.model,
                    output=final_output.recommended_actions,
                    type="followup",
                    conversation_id=conversation_id,
                )
            final_text = final_output.text
        elif isinstance(final_output, str):
            final_text = final_output
        else:
            final_text = str(final_output or "")

        # If the model emitted raw JSON text deltas (common when a chat-agent
        # prompt asks for JSON), the text_buffer will contain the raw JSON while
        # final_text is likely empty. Parse the buffered JSON to recover the
        # real assistant text and any follow-up suggestions. The model may emit
        # multiple concatenated JSON objects (e.g. tool metadata then the chat
        # payload), so find the object that contains a ``text`` field.
        if not final_text and suppress_raw_deltas and text_buffer:
            buffered = "".join(text_buffer)
            parsed_response = self._extract_chat_agent_json_response(buffered)
            if isinstance(parsed_response, dict):
                final_text = parsed_response.get("text") or ""
                recommended = parsed_response.get("recommended_actions") or []
                followups = parsed_response.get("followup_messages") or []
                if followups:
                    yield LLMChunkResponse(
                        provider=request.provider,
                        model=request.model,
                        output=followups,
                        type="followup",
                        conversation_id=conversation_id,
                    )
                if recommended:
                    yield LLMChunkResponse(
                        provider=request.provider,
                        model=request.model,
                        output=recommended,
                        type="followup",
                        conversation_id=conversation_id,
                    )
            else:
                final_text = buffered

        # For chat agents whose model emitted a structured JSON payload, the
        # whole answer was produced in one conceptual chunk. Replay the final
        # text as word-by-word deltas so the UI renders streaming text instead
        # of dumping the full message at once. Non-JSON chat agents already see
        # real deltas during ``on_chat_model_stream``.
        if final_text and suppress_raw_deltas:
            for chunk in self._word_streaming_chunks(final_text, words_per_chunk=2):
                yield LLMChunkResponse(
                    provider=request.provider,
                    model=request.model,
                    output=chunk,
                    type="delta",
                    conversation_id=conversation_id,
                )
                # Delay between chunks so the user perceives progressive typing.
                await asyncio.sleep(0.06)
            final_text = ""

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

    @staticmethod
    def _extract_reasoning_delta(chunk: Any) -> str:
        """Extract a reasoning/thinking delta from a LangChain chat message chunk.

        Reasoning content is surfaced by "thinking" models (e.g. Gemini 3
        thinking, OpenAI o-series) either via ``additional_kwargs``
        (``reasoning_content``) or as a dedicated ``thinking`` block inside the
        content list. Returns an empty string when the chunk carries none.
        """
        try:
            # OpenAI-style reasoning content in additional_kwargs.
            additional_kwargs = getattr(chunk, "additional_kwargs", None) or {}
            reasoning = additional_kwargs.get("reasoning_content")
            if isinstance(reasoning, str) and reasoning:
                return reasoning

            # Thinking blocks embedded in the content list.
            content = chunk.content
            if isinstance(content, list):
                parts: list[str] = []
                for part in content:
                    if not isinstance(part, dict):
                        continue
                    if part.get("type") == "thinking":
                        # Gemini's LangChain provider stores the thought text
                        # under the ``thinking`` key (NOT ``text``):
                        #   {"type": "thinking", "thinking": part.text, ...}
                        text = part.get("thinking") or part.get("text") or ""
                        if isinstance(text, str) and text:
                            parts.append(text)
                    elif part.get("type") == "text":
                        # Some providers stream reasoning as a text block with
                        # a ``reasoning`` flag; Gemini 3 marks thought-bearing
                        # text blocks with ``extras.signature``.
                        if part.get("reasoning"):
                            text = part.get("text", "")
                            if isinstance(text, str) and text:
                                parts.append(text)
                        else:
                            extras = part.get("extras") or {}
                            if extras.get("signature"):
                                text = part.get("text", "")
                                if isinstance(text, str) and text:
                                    parts.append(text)
                return "".join(parts)
            return ""
        except Exception:
            return ""

    async def _load_custom_tools(
        self,
        request: LLMRequest,
        user: User,
        db_session: AsyncSession,
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
            for ct in custom_tools:
                self.tool_registry.register(ct)
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

    async def _load_custom_skills(
        self,
        user: User,
        db_session: AsyncSession,
    ) -> None:
        """Load tenant-specific skills so the planner can route to them.

        Runs before the graph starts streaming. Skill loading emits SQL, and the
        SSE routes commit the shared session after every chunk; loading inside a
        graph node (which runs in a concurrent task) would race that commit and
        fail with a "session is in 'prepared' state" error.
        """

        try:
            await load_custom_skills(
                registry=self.skill_registry,
                db_session=db_session,
                tenant_id=str(user.tenant_id),
                env_type=user.env_type,
                space_id=user.space_id,
            )
        except Exception as exc:
            logger.warning(
                "Failed to load custom skills for tenant %s: %s",
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
        # Restart-expired approval pauses can leave assistant tool calls without
        # responses in persisted history; close them before replaying the turn.
        persisted = self._sanitize_tool_history(persisted)
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
    ) -> Any:
        """Retrieve or create a compiled LangGraph instance."""

        explicit_tool_names = expand_tool_config(request.tool_config or [])
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
            logger.debug(
                "Creating new LangGraph. key=%s",
                cache_key,
            )

            self._graphs[cache_key] = build_chat_graph(
                request=request,
                user=user,
                tool_registry=self.tool_registry,
                skill_registry=self.skill_registry,
                tool_names=explicit_tool_names or None,
                skill_names=explicit_skill_names or None,
            )
        else:
            logger.debug(
                "Using cached LangGraph. key=%s",
                cache_key,
            )

        self._graphs.move_to_end(cache_key)
        if request.conversation_id:
            # Last graph built for this conversation wins; a config edit
            # mid-conversation replaces the index entry on purpose.
            self._conversation_graph_key[request.conversation_id] = cache_key
        self._evict_graph_cache()

        return self._graphs[cache_key]

    def _evict_graph_cache(self) -> None:
        """Trim the graph cache to its limit, oldest entries first.

        Conversations with an outstanding approval pause are never evicted:
        dropping their graph would strand a live pause in the checkpointer with
        no way to resume it. If nothing is evictable the cache is allowed to
        exceed its soft limit rather than corrupt pending approvals.
        """

        while len(self._graphs) > self._graph_cache_limit:
            evicted = False
            for key in list(self._graphs.keys()):
                conversation_id = key[2]
                if conversation_id in self._pending_approval_conversations:
                    continue
                self._graphs.pop(key)
                if self._conversation_graph_key.get(conversation_id) == key:
                    del self._conversation_graph_key[conversation_id]
                evicted = True
                break
            if not evicted:
                break

    def _graph_for_conversation(self, conversation_id: str) -> Any | None:
        """Return the compiled graph cached for ``conversation_id``, if any.

        Uses the conversation index (latest cache key wins) instead of scanning
        insertion order, so a mid-conversation config edit cannot strand the
        resume on a stale compiled graph.
        """

        key = self._conversation_graph_key.get(conversation_id)
        if key is None:
            return None
        return self._graphs.get(key)

    async def get_pending_approval(
        self,
        conversation_id: str,
        user: User,
    ) -> tuple[LLMRequest, list[dict]] | None:
        """Return the paused request and pending calls for a conversation.

        Returns ``None`` when the conversation has no cached graph, no pending
        approval, or belongs to a different user/tenant. The paused request is
        rebuilt from checkpoint state because InMemorySaver deserializes the
        original pydantic object into a dict.
        """

        graph = self._graph_for_conversation(conversation_id)
        if graph is None:
            return None

        try:
            state = await graph.aget_state(self._thread_config(conversation_id))
        except Exception:
            logger.exception(
                "Failed to read pending approval state. conversation_id=%s",
                conversation_id,
            )
            return None

        pending = pending_approval_tool_calls(state)
        if not pending:
            return None

        metadata = state.values.get("metadata") or {}
        paused_request = restore_request(metadata, None)
        if not isinstance(paused_request, LLMRequest):
            return None

        # Only the owner of the paused conversation may decide on its approvals.
        # Unverifiable ownership fails closed (C1/C2 in the #235 review).
        if not verify_pause_owner(metadata, user):
            logger.warning(
                "Approval resume rejected for conversation %s: owner could not "
                "be verified.",
                conversation_id,
            )
            return None

        return paused_request, pending

    async def _clear_stale_approvals(
        self,
        graph: Any,
        config: dict[str, Any],
        request: LLMRequest,
        user: User,
        conversation_id: str,
        db_session: AsyncSession | None,
    ) -> tuple[list[LLMChunkResponse], bool]:
        """Auto-deny pending approvals when a new message arrives.

        A client that lost the approval widget must not dead-end the thread:
        pending calls are denied (never executed) and the new message proceeds.
        Returns the frames to emit and whether the pause was cleared. When it
        was not cleared the caller MUST abort the new turn — invoking a graph
        with a pending interrupt re-enters the pause.

        IMPORTANT NOTE: the auto-deny continuation is persisted silently (it
        exists in the checkpoint and DB, but is not streamed to the UI), so
        persisted history keeps an assistant acknowledgement the live UI never
        showed. Repeats are capped at 3 rounds.
        """

        frames: list[LLMChunkResponse] = []

        for _ in range(3):
            try:
                state = await graph.aget_state(config)
            except Exception:
                logger.exception(
                    "Failed to inspect pending approvals. conversation_id=%s",
                    conversation_id,
                )
                frames.append(
                    LLMChunkResponse(
                        provider=request.provider,
                        model=request.model,
                        output=(
                            "A previous tool approval could not be inspected. "
                            "Please retry this request."
                        ),
                        type="error",
                        conversation_id=conversation_id,
                    )
                )
                return frames, False

            pending = pending_approval_tool_calls(state)
            if not pending:
                return frames, True

            logger.info(
                "Cancelling %d pending tool approval(s) for conversation_id=%s",
                len(pending),
                conversation_id,
            )

            deny_decisions = {
                item["tool_call_id"]: "deny" for item in pending
            }
            try:
                await graph.ainvoke(
                    Command(
                        resume=deny_decisions,
                        # Re-seed live objects dropped by checkpoint
                        # deserialization (see stream_normalized).
                        update={
                            "metadata": {
                                "request": request,
                                "user": user,
                                "approval_enabled": True,
                            }
                        },
                    ),
                    config,
                )
            except Exception:
                logger.exception(
                    "Failed to cancel pending approvals. conversation_id=%s",
                    conversation_id,
                )
                frames.append(
                    LLMChunkResponse(
                        provider=request.provider,
                        model=request.model,
                        output=(
                            "A previous tool approval could not be cancelled. "
                            "Please retry this request."
                        ),
                        type="error",
                        conversation_id=conversation_id,
                    )
                )
                return frames, False

            # Persist the denial continuation so DB history matches the
            # checkpoint. Silent by design (see IMPORTANT NOTE above).
            if db_session is not None and not request.is_temp_chat:
                try:
                    post_state = await graph.aget_state(config)
                    post_messages = post_state.values.get("messages", []) or []
                    final_ai = self._latest_ai_message(post_messages)
                    if final_ai is not None:
                        await self.conversation_service.save_message(
                            db_session=db_session,
                            request=request,
                            user=user,
                            conversation_id=conversation_id,
                            message=final_ai,
                        )
                except Exception:
                    logger.exception(
                        "Failed to persist cancelled-approval continuation. "
                        "conversation_id=%s",
                        conversation_id,
                    )

        logger.error(
            "Pending approvals could not be cleared after retries. "
            "conversation_id=%s",
            conversation_id,
        )
        frames.append(
            LLMChunkResponse(
                provider=request.provider,
                model=request.model,
                output=(
                    "A previous tool approval could not be cancelled. "
                    "Please retry this request."
                ),
                type="error",
                conversation_id=conversation_id,
            )
        )
        return frames, False

    @staticmethod
    def _sanitize_tool_history(
        messages: list[BaseMessage],
    ) -> list[BaseMessage]:
        """Close assistant tool calls that have no persisted responses.

        A paused approval that outlives the in-memory checkpoint (e.g. restart)
        leaves an AIMessage with tool_calls but no ToolMessages in the persisted
        history. Providers reject such sequences, so append a synthetic denial
        result for every unanswered call.
        """

        sanitized: list[BaseMessage] = []
        index = 0

        while index < len(messages):
            message = messages[index]
            sanitized.append(message)

            tool_calls = getattr(message, "tool_calls", None) or []
            if not isinstance(message, AIMessage) or not tool_calls:
                index += 1
                continue

            answered: set[str] = set()
            lookahead = index + 1
            while lookahead < len(messages) and isinstance(
                messages[lookahead], ToolMessage
            ):
                answered.add(
                    getattr(messages[lookahead], "tool_call_id", "") or ""
                )
                sanitized.append(messages[lookahead])
                lookahead += 1

            for tool_call in tool_calls:
                call_id = (
                    tool_call.get("id", "")
                    if isinstance(tool_call, dict)
                    else getattr(tool_call, "id", "")
                )
                if not call_id or call_id in answered:
                    continue
                name = (
                    tool_call.get("name", "")
                    if isinstance(tool_call, dict)
                    else getattr(tool_call, "name", "")
                )
                sanitized.append(
                    ToolMessage(
                        content=(
                            "Action not executed: the approval session "
                            "expired or was cancelled."
                        ),
                        tool_call_id=call_id,
                        name=name,
                        status="error",
                        # Machine-readable marker (mirrors tool_node denials);
                        # detection must never parse prose.
                        additional_kwargs={APPROVAL_MARKER_KEY: APPROVAL_EXPIRED},
                    )
                )

            index = lookahead

        return sanitized

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
            credential_name=request.credential_name,
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
        space_id: str | None = None,
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
            and not request.credential_name
        ):
            self.credit_usage_service.post_usage(
                request=request,
                response=response,
                jwt=jwt,
                space_id=space_id,
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
        recommended_actions: list[str] = []

        if isinstance(output, dict):
            text_value = output.get("text")
            text = (
                text_value
                if isinstance(text_value, str)
                else json.dumps(
                    text_value if text_value is not None else output,
                    ensure_ascii=False,
                    default=str,
                )
            )
            tools = output.get("tools", [])

            if include_followups:
                followup_messages = output.get("followup_messages", [])
                recommended_actions = output.get("recommended_actions", [])

        elif isinstance(output, str):
            # Chat agents sometimes return JSON strings even when the request
            # does not explicitly set ``is_json_output`` (custom prompt).
            parsed = self._extract_chat_agent_json_response(output)
            if isinstance(parsed, dict):
                text_value = parsed.get("text")
                text = (
                    text_value
                    if isinstance(text_value, str)
                    else json.dumps(
                        text_value if text_value is not None else parsed,
                        ensure_ascii=False,
                        default=str,
                    )
                )
                if include_followups:
                    followup_messages = parsed.get("followup_messages", [])
                    recommended_actions = parsed.get("recommended_actions", [])
            else:
                text = output

        elif isinstance(output, list):
            tools = output

        return ChatAgentResponse(
            text=text,
            tools=tools,
            followup_messages=followup_messages,
            recommended_actions=recommended_actions,
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

    @staticmethod
    def _extract_chat_agent_json_response(text: str) -> Any:
        """Parse all JSON objects in ``text`` and return the chat payload.

        Some chat-agent prompts cause the model to emit multiple concatenated
        JSON objects, e.g. metadata (``{"tool_names": [...]}``) followed by the
        actual response object (``{"text": "...", "recommended_actions": [...]}``).
        This helper walks the text, decodes every top-level JSON object, and
        returns the object that contains a ``text`` key (the chat payload).
        """
        import json

        text = text.strip()
        if not text:
            return None

        decoder = json.JSONDecoder()
        idx = 0
        objects: list[Any] = []
        while idx < len(text):
            char = text[idx]
            if char not in ("{", "["):
                idx += 1
                continue
            try:
                parsed, end = decoder.raw_decode(text, idx)
                objects.append(parsed)
                idx += end
            except ValueError:
                idx += 1

        # Prefer the object that carries the assistant message text.
        for obj in objects:
            if isinstance(obj, dict) and "text" in obj:
                return obj

        # Fall back to the first object/array if no text-bearing object exists.
        return objects[0] if objects else None

    @staticmethod
    def _word_streaming_chunks(text: str, words_per_chunk: int = 1):
        """Yield ``text`` in small chunks to simulate streaming output.

        Splits on whitespace boundaries so words stay intact. The chunk size
        can be increased if the message feels too slow.
        """
        words = text.split(" ")
        for i in range(0, len(words), words_per_chunk):
            chunk = " ".join(words[i : i + words_per_chunk])
            # Preserve the trailing space between chunks (except at the end).
            if i + words_per_chunk < len(words):
                chunk += " "
            yield chunk

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
