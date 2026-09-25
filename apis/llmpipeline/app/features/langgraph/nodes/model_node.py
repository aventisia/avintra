from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.language_models.chat_models import BaseChatModel

from app.core.logger import logger
from app.features.langgraph.schemas.graph_state import ChatState


def create_model_node(
    model: BaseChatModel,
    skill_prompt: str | None = None,
    max_short_term_turns: int | None = None,
):
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
        max_short_term_turns: Optional cap on the number of most recent
            conversation turns (user+assistant) sent to the model. All system
            messages are always retained. ``None`` or ``0`` means no limit.
    """

    async def call_model(state: ChatState):
        messages = _apply_short_term_window(state["messages"], max_short_term_turns)

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


def _apply_short_term_window(messages, max_short_term_turns: int | None) -> list:
    """
    Return a message list limited to the most recent ``max_short_term_turns`` turns.

    A turn starts at a user (``HumanMessage``) message. System messages are always
    kept but de-duplicated by content, because the system prompt is re-sent on every
    request and would otherwise accumulate in the checkpoint. Older turns are
    dropped without summarization. ``None`` or ``0`` means no limit and the original
    list is returned unchanged.
    """

    if not max_short_term_turns or max_short_term_turns <= 0:
        return messages

    messages = list(messages)

    # Keep each distinct system message once, in first-seen order.
    system_messages = []
    seen_system_contents = set()
    for message in messages:
        if not isinstance(message, SystemMessage):
            continue
        content_key = (
            message.content if isinstance(message.content, str) else str(message.content)
        )
        if content_key in seen_system_contents:
            continue
        seen_system_contents.add(content_key)
        system_messages.append(message)

    conversation = [m for m in messages if not isinstance(m, SystemMessage)]

    user_indices = [
        index for index, message in enumerate(conversation) if isinstance(message, HumanMessage)
    ]

    # Nothing to trim when the conversation already fits within the window.
    if len(user_indices) <= max_short_term_turns:
        return system_messages + conversation

    start = user_indices[-max_short_term_turns]

    return system_messages + conversation[start:]
