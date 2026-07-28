"""Tool node that normalizes tool calls before invoking the LangGraph ToolNode."""

from langchain_core.messages import AIMessage
from langchain_core.tools import BaseTool
from langgraph.prebuilt import ToolNode

from app.core.logger import logger
from app.features.langgraph.schemas.graph_state import ChatState


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


def create_tool_node(tools: list[BaseTool]):
    """
    Build an async tool execution node for a LangGraph workflow.

    The returned node inspects the latest ``AIMessage`` in the state,
    executes the requested tool calls using LangGraph's prebuilt
    ``ToolNode``, and returns the produced ``ToolMessage`` values.

    Args:
        tools: List of LangChain tools available to the agent.
    """

    tool_node = ToolNode(tools)

    async def execute_tools(state: ChatState):
        messages = state["messages"]
        last_message = messages[-1]

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            logger.info(
                "Executing tools: %s",
                [
                    tool_call["name"]
                    for tool_call in last_message.tool_calls
                ],
            )

        normalized_state = dict(state)
        if isinstance(last_message, AIMessage):
            normalized_message = _normalize_tool_calls(last_message)
            normalized_state["messages"] = messages[:-1] + [normalized_message]

        return await tool_node.ainvoke(normalized_state)

    return execute_tools
