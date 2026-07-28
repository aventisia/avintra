"""High-level service that runs LangGraph chat workflows."""

from collections.abc import AsyncIterator
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import time
from langchain_core.messages import AIMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.graphs.graph_factory import build_chat_graph
from app.features.langgraph.graphs.message_builder import build_messages
from app.features.langgraph.services.credit_usage_service import (
    CreditUsageService,
    credit_usage_service,
)
from app.features.langgraph.skills.skill_loader import load_default_skills
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_loader import load_default_tools
from app.features.langgraph.tools.tool_registry import ToolRegistry
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
        credit_usage_service: CreditUsageService | None = None,
    ):
        # Store compiled graph cache
        self._graphs: dict[tuple, Any] = {}

        self.tool_registry = tool_registry
        self.skill_registry = skill_registry
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

        # Track request execution time
        start_time = time.perf_counter()

        # Create empty response object
        langgraph_response = self._create_initial_response(request)

        # Create or reuse graph
        graph = self._graph(
            request=request,
            user=user,
        )

        conversation_id = request.conversation_id or str(uuid4())

        # Configure LangGraph checkpoint thread
        config = {
            "configurable": {
                "thread_id": conversation_id,
            }
        }

        # Convert request input into LangChain messages
        messages = build_messages(request)

        # Execute graph workflow
        response = await graph.ainvoke(
            {"messages": messages},
            config,
        )

        # Extract final AI message
        response_messages = response.get("messages", []) or []

        graph_response = next(
            (
                message
                for message in reversed(response_messages)
                if isinstance(message, AIMessage)
            ),
            None,
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

        # Track request execution time
        start_time = time.perf_counter()

        langgraph_response = self._create_initial_response(request)

        # Create or reuse graph
        graph = self._graph(
            request=request,
            user=user,
        )

        conversation_id = request.conversation_id or str(uuid4())

        # Configure checkpoint thread
        config = {
            "configurable": {
                "thread_id": conversation_id,
            }
        }

        messages = build_messages(request)

        graph_response = None

        # Stream graph events
        async for event in graph.astream_events(
            {"messages": messages},
            config=config,
            stream_mode="messages",
            version="v2",
        ):
            event_type = event.get("event")
            data = event.get("data", {})

            # Capture final AI message
            if event_type == "on_chain_end":
                output = data.get("output")

                if isinstance(output, dict):
                    output_messages = output.get("messages", [])

                    graph_response = next(
                        (
                            message
                            for message in reversed(output_messages)
                            if isinstance(message, AIMessage)
                        ),
                        graph_response,
                    )

            yield event

        # Send final response after stream completes
        final_response = self._create_final_response(
            request=request,
            response=langgraph_response,
            graph_response=graph_response,
            start_time=start_time,
            jwt=user.access_token,
        )

        yield final_response

    def _graph(
        self,
        request: LLMRequest,
        user: User,
    ) -> Any:
        """Retrieve or create a compiled LangGraph instance."""

        # Get explicitly selected tools and skills
        explicit_tool_names = [
            config.tool
            for config in (request.tool_config or [])
        ]

        explicit_skill_names = list(
            request.skill_names or []
        )

        tool_config_key = tuple(sorted(explicit_tool_names))
        skill_config_key = tuple(sorted(explicit_skill_names))

        # Use shared graph when selection is dynamic
        if not tool_config_key and not skill_config_key:
            tool_config_key = ("__agent_select__",)
            skill_config_key = ("__agent_select__",)

        # Build cache key from graph configuration
        cache_key = (
            request.provider.strip().lower(),
            request.model,
            request.temperature,
            tool_config_key,
            skill_config_key,
            request.is_temp_chat,
        )

        # Create graph only when not cached
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
    credit_usage_service=credit_usage_service,
)
