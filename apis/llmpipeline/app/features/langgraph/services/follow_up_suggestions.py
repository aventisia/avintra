"""Suggested next questions for a finished Home chat reply."""

import asyncio
import json

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.providers.anthropic_provider import supports_anthropic_effort
from app.features.langgraph.providers.openai_provider import _supports_reasoning_effort
from app.features.langgraph.services.model_factory import create_chat_model
from app.features.llm_providers.llm_providers_schemas import LLMMessage, LLMRequest

MAX_SUGGESTIONS = 3
MAX_SUGGESTION_CHARS = 200
QUESTION_CHARS = 2000
REPLY_CHARS = 4000
OUTPUT_TOKENS = 1024

SYSTEM_PROMPT = (
    "You suggest what the user might ask next in a chat. "
    "Given the user's question and the assistant's answer, write exactly three short "
    "follow-up messages the user could send next, phrased as the user, in the user's "
    "language, each under 80 characters. Make them specific to the answer and different "
    "from each other. Reply with only a JSON array of three strings."
)


def suggestion_request(request: LLMRequest) -> LLMRequest:
    """The chat's own request, reshaped for one short suggestion call."""
    provider = request.provider.strip().lower()
    reasoning_low = (provider == "openai" and _supports_reasoning_effort(request.model)) or (
        provider == "anthropic" and supports_anthropic_effort(request.model)
    )
    return request.model_copy(
        update={
            "max_output_tokens": OUTPUT_TOKENS,
            "reasoning_effort": "low" if reasoning_low else None,
            "generate_followup_messages": False,
            "web_search": False,
        }
    )


def latest_user_text(request_input: str | list[LLMMessage]) -> str:
    if isinstance(request_input, str):
        return request_input
    for message in reversed(request_input):
        if message.role == "user":
            return message.content
    return ""


def parse_suggestions(text: str) -> list[str]:
    start = text.find("[")
    end = text.rfind("]")
    if start < 0 or end <= start:
        return []
    try:
        items = json.loads(text[start : end + 1])
    except ValueError:
        return []
    if not isinstance(items, list):
        return []
    kept = [
        item.strip()
        for item in items
        if isinstance(item, str) and item.strip() and len(item.strip()) <= MAX_SUGGESTION_CHARS
    ]
    return kept[:MAX_SUGGESTIONS]


def _message_text(message: AIMessage) -> str:
    content = message.content
    if isinstance(content, str):
        return content
    return "".join(
        block.get("text", "")
        for block in content
        if isinstance(block, dict) and block.get("type") == "text"
    )


async def generate_follow_up_suggestions(
    request: LLMRequest, user: User, reply: str, timeout: float = 10.0
) -> tuple[list[str], AIMessage | None]:
    """Returns the suggestions and the model message (for usage), or ([], None) on failure."""
    question = latest_user_text(request.input)[:QUESTION_CHARS]
    prompt = f"Question:\n{question}\n\nAnswer:\n{reply[:REPLY_CHARS]}"
    try:
        model = create_chat_model(suggestion_request(request), user)
        message = await asyncio.wait_for(
            model.ainvoke([SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=prompt)]),
            timeout=timeout,
        )
    except Exception as error:
        logger.warning(
            "Follow-up suggestions failed for conversation %s: %s",
            request.conversation_id,
            error,
        )
        return [], None
    return parse_suggestions(_message_text(message)), message
