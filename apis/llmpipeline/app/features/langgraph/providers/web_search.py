import re

from langchain_core.messages import AIMessage, HumanMessage

from app.features.langgraph.providers.anthropic_provider import (
    HOME_CHAT_ACTION,
    claude_version,
)
from app.features.litellm.core.credentials import is_byok
from app.features.llm_providers.llm_providers_schemas import LLMRequest

MAX_SEARCHES_PER_REPLY = 5

_OPENAI_SEARCH_MODELS = re.compile(r"^(gpt-4o|gpt-4\.1|gpt-5|o3|o4)")

WEB_SEARCH_INSTRUCTION = (
    "You can search the web. The app marks the sources of your claims itself, so do not write "
    "citation numbers, links or a list of sources in your answer; write the answer in plain prose."
)


def supports_web_search(provider: str, model: str) -> bool:
    """Whether the provider's built-in web search can run for this model."""
    provider_name = (provider or "").strip().lower()
    if provider_name == "anthropic":
        version = claude_version(model)
        return version is not None and (version[0] in ("fable", "mythos") or version[1] >= 4)
    if provider_name == "openai":
        model_id = (model or "").strip().lower().rsplit("/", 1)[-1]
        return bool(_OPENAI_SEARCH_MODELS.match(model_id)) and not (
            "nano" in model_id or "chat" in model_id
        )
    return False


def web_search_enabled(llm_request: LLMRequest) -> bool:
    """Search runs only when Home chat asked for it on a model that supports it, on the caller's own key."""
    return bool(
        llm_request.web_search
        and llm_request.action == HOME_CHAT_ACTION
        # IMPORTANT NOTE: credit usage bills tokens only, so a provider's per-search fee is never charged on platform credits.
        and is_byok(llm_request.credential_name)
        and supports_web_search(llm_request.provider, llm_request.model)
    )


def web_search_tool(provider: str) -> dict:
    """The provider's built-in search tool definition."""
    if (provider or "").strip().lower() == "anthropic":
        return {
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": MAX_SEARCHES_PER_REPLY,
        }
    return {"type": "web_search"}


_SEARCH_BLOCK_TYPES = {"server_tool_use", "web_search_tool_result", "web_search_call"}


def without_search_blocks(messages: list) -> list:
    """Earlier replies that searched, reduced to their text so any model and search setting accept them."""
    # IMPORTANT NOTE: a provider's built-in search leaves blocks in the checkpoint that only that
    # provider's search request accepts back, so a later turn with search off, or on another model,
    # fails with a 400. Earlier searched replies are therefore sent as their plain text.
    last_user = max(
        (index for index, message in enumerate(messages) if isinstance(message, HumanMessage)),
        default=-1,
    )
    return [
        _plain_text(message) if index < last_user and _has_search_blocks(message) else message
        for index, message in enumerate(messages)
    ]


def _has_search_blocks(message) -> bool:
    return (
        isinstance(message, AIMessage)
        and isinstance(message.content, list)
        and any(
            isinstance(block, dict) and block.get("type") in _SEARCH_BLOCK_TYPES
            for block in message.content
        )
    )


def _plain_text(message: AIMessage) -> AIMessage:
    blocks = [
        {key: value for key, value in block.items() if key not in ("citations", "annotations", "index", "id")}
        for block in message.content
        if isinstance(block, dict) and block.get("type") == "text"
    ]
    return message.model_copy(update={"content": blocks})
