from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from app.core.logger import logger
from app.features.langgraph.schemas.graph_state import ChatState


def create_model_node(model: BaseChatModel, skill_prompt: str | None = None):
    """
    Build an async model invocation node for a LangGraph chat workflow.

    The returned node reads ``state["messages"]``, calls the model, and
    appends the resulting ``AIMessage`` to the conversation. When tools
    are bound to ``model`` the response may contain ``tool_calls`` and
    the graph can route the result to a tool execution node.

    Args:
        model: The chat model to invoke.
        skill_prompt: Optional system prompt fragment describing selected
            skills. It is merged with the first system message or prepended
            so the model always sees it, including on checkpoint resumes.
    """

    async def call_model(state: ChatState):
        messages = state["messages"]

        if skill_prompt:
            messages = _inject_skill_prompt(messages, skill_prompt)

        logger.debug(
            "Calling LLM. message_count=%d",
            len(messages),
        )

        response = await model.ainvoke(messages)

        if isinstance(response, AIMessage):
            logger.debug(
                "LLM response generated. tool_calls=%s",
                bool(response.tool_calls),
            )

        return {
            "messages": [response],
        }

    return call_model


def _inject_skill_prompt(messages, skill_prompt: str) -> list:
    """
    Return a new message list that includes the skill system prompt.

    The prompt is merged with an existing leading system message when one
    exists, or prepended as a new system message otherwise. The operation is
    idempotent so checkpointed conversations do not duplicate the prompt.
    """

    messages = list(messages)

    if not messages or not isinstance(messages[0], SystemMessage):
        messages.insert(0, SystemMessage(content=skill_prompt))
        return messages

    existing = messages[0].content or ""

    if isinstance(existing, str):
        existing_text = existing.strip()
        skill_text = skill_prompt.strip()

        if skill_text in existing_text:
            return messages

        merged = f"{existing_text}\n\n{skill_text}".strip()
        messages[0] = SystemMessage(content=merged)
        return messages

    # Non-string system content (e.g., structured blocks) - prepend a new
    # system message so the skill metadata is still visible to the model.
    messages.insert(0, SystemMessage(content=skill_prompt))
    return messages
