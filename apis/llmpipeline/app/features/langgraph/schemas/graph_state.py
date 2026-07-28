from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

from typing import Any, Annotated
from typing_extensions import TypedDict

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
            routing decisions.
    """
    messages: Annotated[list[BaseMessage], add_messages]
    metadata: dict[str, Any]