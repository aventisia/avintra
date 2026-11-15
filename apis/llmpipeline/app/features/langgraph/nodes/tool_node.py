"""Tool node that normalizes tool calls before invoking the LangGraph ToolNode."""

from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from langgraph.prebuilt import ToolNode

from app.core.logger import logger
from app.features.langgraph.schemas.graph_state import ChatState
from app.features.langgraph.services.request_context import restore_request
from app.features.langgraph.services.tool_approval import (
    approval_key,
    denial_tool_message,
    request_tool_approvals,
)
from app.features.langgraph.tools.tool_executor import ToolExecutor
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def _normalize_tool_calls(message: AIMessage) -> AIMessage:
    """
    Ensure tool calls on ``message`` are in the OpenAI-style shape expected by
    LangGraph's ``ToolNode``.

    Anthropic may return ``function.name``/``function.arguments`` instead of
    ``name``/``args``. This helper creates a clean copy when needed.
    """

    tool_calls = getattr(message, "tool_calls", None)
    if not tool_calls:
        return message

    normalized_tool_calls: list[dict] = []
    needs_rebuild = False

    for tool_call in tool_calls:
        if isinstance(tool_call, dict):
            normalized = dict(tool_call)
            function = normalized.pop("function", None)
            if isinstance(function, dict):
                needs_rebuild = True
                normalized["name"] = function.get("name", normalized.get("name", ""))
                raw_args = function.get("arguments")
                if isinstance(raw_args, str):
                    try:
                        import json

                        normalized["args"] = json.loads(raw_args)
                    except Exception:
                        normalized["args"] = {"arguments": raw_args}
                else:
                    normalized["args"] = raw_args or {}
            elif "args" not in normalized:
                needs_rebuild = True
                normalized["args"] = {}

            normalized.setdefault("id", "")
            normalized.setdefault("name", "")
            normalized_tool_calls.append(normalized)
        else:
            normalized_tool_calls.append(tool_call)

    if not needs_rebuild:
        return message

    rebuilt = AIMessage(
        content=message.content,
        tool_calls=normalized_tool_calls,
        id=message.id,
        response_metadata=message.response_metadata or {},
        usage_metadata=message.usage_metadata,
    )
    return rebuilt


def create_tool_node(tools: list[BaseTool], request: LLMRequest | None = None):
    """
    Build an async tool execution node for a LangGraph workflow.

    The returned node inspects the latest ``AIMessage`` in the state,
    executes the requested tool calls using LangGraph's prebuilt
    ``ToolNode``, and returns the produced ``ToolMessage`` values.

    Connector-backed tools (e.g. ``outlook_send_email``) are executed through
    ``ToolExecutor`` using credentials from ``request.tool_config`` instead of
    running a placeholder implementation.

    Args:
        tools: List of LangChain tools available to the agent.
        request: Original LLM request with tool/credential configuration.
    """

    tool_node = ToolNode(tools)

    async def execute_tools(state: ChatState):
        messages = state["messages"]
        last_message = messages[-1]

        if not isinstance(last_message, AIMessage):
            return await tool_node.ainvoke(state)

        tool_calls = getattr(last_message, "tool_calls", None) or []
        if not tool_calls:
            return await tool_node.ainvoke(state)

        logger.debug(
            "Executing tools: %s",
            [tool_call.get("name") for tool_call in tool_calls],
        )

        metadata = state.get("metadata") or {}
        user = metadata.get("user")
        # Endpoint-seeded live request; the build-time request is the fallback
        # (checkpoint round-trips deserialize the live one to a dict).
        current_request = restore_request(metadata, request)
        executor = ToolExecutor(tools, current_request, user)

        # IMPORTANT NOTE: Interactive chat turns pause for human approval
        # before executing ANY call in the batch (auto + human together), so a
        # resume never re-runs a call that already had side effects. The pause
        # invariant: no tool executes until every human-approval call in the
        # batch has an explicit decision.
        approval_decisions: dict[str, str] = {}
        if (
            metadata.get("approval_enabled")
            and current_request is not None
            and getattr(current_request, "is_chat_agent", False)
        ):
            approval_decisions = request_tool_approvals(
                tool_calls, current_request, executor.corsair_paths
            )

        # Connector-backed tools are handled outside of ToolNode so we can pass
        # request context (credentials, user token) to the implementation.
        precomputed_results: dict[str, ToolMessage] = {}
        remaining_tool_calls: list[dict] = []

        for index, tool_call in enumerate(tool_calls):
            tool_name = tool_call.get("name", "")
            # Approval-keyed so unnamed calls cannot collide on the empty id;
            # for calls that have one this is the tool_call_id unchanged.
            tool_call_id = approval_key(tool_call, index)
            args = tool_call.get("args", {})

            # A denied human-approval call short-circuits: the model receives a
            # denial ToolMessage and the turn continues without the action.
            if approval_decisions.get(tool_call_id) == "deny":
                precomputed_results[tool_call_id] = denial_tool_message(
                    tool_name, tool_call_id
                )
                continue

            connector_result = await executor.try_connector(
                tool_name,
                args,
                tool_call_id=tool_call_id,
            )
            if connector_result is not None:
                precomputed_results[tool_call_id] = connector_result
                continue

            remaining_tool_calls.append(tool_call)

        # Rebuild the last message with only the remaining non-connector calls.
        if remaining_tool_calls:
            normalized_last = _normalize_tool_calls(last_message)
            # Replace tool_calls list
            normalized_last.tool_calls = remaining_tool_calls
            normalized_state = dict(state)
            normalized_state["messages"] = messages[:-1] + [normalized_last]
            tool_node_result = await tool_node.ainvoke(normalized_state)
            new_messages = tool_node_result.get("messages", [])
        else:
            new_messages = []

        # Merge connector results in the same order as the original tool_calls.
        merged_messages = []
        consumed: set[int] = set()
        for index, tool_call in enumerate(tool_calls):
            tool_call_id = approval_key(tool_call, index)
            if tool_call_id in precomputed_results:
                merged_messages.append(precomputed_results[tool_call_id])
                continue

            # Find the matching ToolMessage produced by ToolNode. Real ids are
            # matched exactly; unnamed calls consume the first unclaimed
            # unnamed result so two of them cannot share one message.
            real_id = tool_call.get("id", "")
            matching = next(
                (
                    (position, msg)
                    for position, msg in enumerate(new_messages)
                    if position not in consumed
                    and isinstance(msg, ToolMessage)
                    and (
                        (
                            bool(real_id)
                            and getattr(msg, "tool_call_id", None) == real_id
                        )
                        or (
                            not real_id
                            and not (getattr(msg, "tool_call_id", None) or "")
                        )
                    )
                ),
                None,
            )
            if matching:
                position, msg = matching
                consumed.add(position)
                merged_messages.append(msg)

        return {"messages": merged_messages}

    return execute_tools
