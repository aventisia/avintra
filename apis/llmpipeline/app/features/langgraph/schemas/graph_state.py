from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from typing import Any, Annotated
from typing_extensions import TypedDict


def merge_metadata(
    left: dict[str, Any] | None,
    right: dict[str, Any] | None,
) -> dict[str, Any]:
    """Merge metadata writes instead of replacing them.

    Different writers own different keys: the seed/resume updates carry the
    live ``request`` and ``user``, while the agent selector stores per-turn
    routing (``selected_tool_names``/``selected_skills``). A replace reducer
    drops the routing state on approval resumes, so the tool node resolves no
    tools. Merging keeps every writer's keys intact.
    """

    return {**(left or {}), **(right or {})}


class ChatState(TypedDict):
    """
    Shared state carried through the chat LangGraph.

    Fields:
        messages:
            Conversation history. LangGraph's ``add_messages`` reducer
            appends new messages instead of replacing the list.

        metadata:
            Optional extra context that nodes can read/write, such as the
            original ``LLMRequest``, resolved tool configuration, or skill
            routing decisions. Uses ``merge_metadata`` so partial updates
            (e.g. approval resumes) do not drop other keys.
    """
    messages: Annotated[list[BaseMessage], add_messages]
    metadata: Annotated[dict[str, Any], merge_metadata]
