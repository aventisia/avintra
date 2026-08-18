import json
from dataclasses import dataclass

from app.core.credit_manager import CreditManagerService
from app.core.logger import logger
from app.features.llm_providers.llm_providers_schemas import LLMRequest, LLMResponse


@dataclass(frozen=True)
class TokenUsage:
    """Normalized token counts extracted from an LLM response."""

    input: int
    output: int
    cached: int
    cache_write: int = 0
    reasoning: int = 0


@dataclass(frozen=True)
class CreditServiceMap:
    """Maps a token category to the backend credit-service type name."""

    input: str
    output: str
    cache: str
    cache_write: str | None = None
    reasoning: str | None = None


# ---------------------------------------------------------------------------
# Provider/model → credit service type mappings.
# These names must match the backend enum values exactly.
# ---------------------------------------------------------------------------

GPT_MODEL_MAP: dict[str, CreditServiceMap] = {
    "gpt-4o-mini": CreditServiceMap(
        input="Gpt4oMiniInput",
        output="Gpt4oMiniOutput",
        cache="Gpt4oMiniCached",
    ),
    "gpt-4o": CreditServiceMap(
        input="Gpt4oInput",
        output="Gpt4oOutput",
        cache="Gpt4oCached",
    ),
    "gpt-5.1": CreditServiceMap(
        input="Gpt51Input",
        output="Gpt51Output",
        cache="Gpt51Cached",
    ),
    "gpt-5-mini": CreditServiceMap(
        input="Gpt5MiniInput",
        output="Gpt5MiniOutput",
        cache="Gpt5MiniCached",
    ),
    "gpt-5-nano": CreditServiceMap(
        input="Gpt5NanoInput",
        output="Gpt5NanoOutput",
        cache="Gpt5NanoCached",
    ),
}

OPENROUTER_MODEL_MAP: dict[str, CreditServiceMap] = {
    "claude-4.5-sonnet": CreditServiceMap(
        input="Claude45SonnetInput",
        output="Claude45SonnetOutput",
        cache="Claude45SonnetCached",
    ),
    "claude-4.5-haiku": CreditServiceMap(
        input="Claude45HaikuInput",
        output="Claude45HaikuOutput",
        cache="Claude45HaikuCached",
    ),
    "grok-3-mini": CreditServiceMap(
        input="Grok3MiniInput",
        output="Grok3MiniOutput",
        cache="Grok3MiniCached",
    ),
    "qwen3-vl-32b-instruct": CreditServiceMap(
        input="Qwen3Vl32bInstructInput",
        output="Qwen3Vl32bInstructOutput",
        cache="Qwen3Vl32bInstructCached",
    ),
}

GEMINI_MODEL_MAP: dict[str, CreditServiceMap] = {
    "gemini-2.5-flash": CreditServiceMap(
        input="Gemini25FlashInput",
        output="Gemini25FlashOutput",
        cache="Gemini25FlashCached",
    ),
    "gemini-2.5-flash-lite": CreditServiceMap(
        input="Gemini25FlashLiteInput",
        output="Gemini25FlashLiteOutput",
        cache="Gemini25FlashLiteCached",
    ),
}

ANTHROPIC_FALLBACK_MAP = CreditServiceMap(
    input="CustomInputService",
    output="CustomOutputService",
    cache="CustomCacheReadService",
    cache_write="CustomCacheWriteService",
)


def _normalize_model_name(model: str) -> str:
    """Strip provider prefixes and whitespace from a model identifier."""

    cleaned = (model or "").strip().lower()
    return cleaned.split("/")[-1]


def _resolve_service_map(provider: str, model_name: str) -> CreditServiceMap:
    """Pick the right credit-service map for a provider/model pair."""

    normalized_provider = provider.strip().lower()

    if normalized_provider == "openai":
        mapping = GPT_MODEL_MAP
    elif normalized_provider == "openrouter":
        mapping = OPENROUTER_MODEL_MAP
    elif normalized_provider == "googlegemini":
        mapping = GEMINI_MODEL_MAP
    elif normalized_provider == "anthropic":
        return ANTHROPIC_FALLBACK_MAP
    else:
        mapping = {}

    service_map = mapping.get(model_name)

    if not service_map:
        for key, value in mapping.items():
            if model_name.startswith(key):
                service_map = value
                break

    if not service_map:
        normalized = "".join(
            part.capitalize() for part in model_name.split("-")
        )
        service_map = CreditServiceMap(
            input=f"{normalized}Input",
            output=f"{normalized}Output",
            cache=f"{normalized}Cached",
        )

    return service_map


def _extract_token_usage(response: LLMResponse) -> TokenUsage:
    """Pull safe, non-negative token counts from an ``LLMResponse``."""

    input_tokens = max(getattr(response, "input_tokens", 0) or 0, 0)
    output_tokens = max(getattr(response, "output_tokens", 0) or 0, 0)
    cached_tokens = max(getattr(response, "input_cached_tokens", 0) or 0, 0)
    cache_write_tokens = max(
        getattr(response, "cache_write_tokens", 0) or 0, 0
    )
    reasoning_tokens = max(
        getattr(response, "output_reasoning_tokens", 0) or 0, 0
    )

    return TokenUsage(
        input=input_tokens,
        output=output_tokens,
        cached=cached_tokens,
        cache_write=cache_write_tokens,
        reasoning=reasoning_tokens,
    )


def _build_credit_usage_entries(
    request: LLMRequest,
    service_map: CreditServiceMap,
    usage: TokenUsage,
    space_id: str | None = None,
) -> list[dict]:
    """Create credit-usage entries for consumed tokens."""

    entries: list[dict] = []

    def add_entry(service_type: str | None, tokens: int) -> None:
        if not service_type or tokens <= 0:
            return

        entries.append(
            {
                "ServiceType": service_type,
                "ConsumedUnit": tokens,
                "RefType": request.ref_type,
                "RefId": request.ref_id,
                "RefName": request.ref_name,
                "Action": request.action,
                "TriggeredByAgent": request.agent_name,
                "SpaceId": space_id,
            }
        )

    add_entry(service_map.input, usage.input)
    add_entry(service_map.cache, usage.cached)
    add_entry(service_map.output, usage.output)

    if service_map.cache_write:
        add_entry(service_map.cache_write, usage.cache_write)

    if service_map.reasoning:
        add_entry(service_map.reasoning, usage.reasoning)

    return entries


class CreditUsageService:
    """Build and send credit usage for LangGraph chat requests."""

    def __init__(self) -> None:
        self._credit_manager = CreditManagerService()

    def post_usage(
        self,
        request: LLMRequest,
        response: LLMResponse,
        jwt: str,
        space_id: str | None = None,
    ) -> None:
        """
        Build a credit-usage payload from the request/response and post it.

        This is a best-effort operation: failures are logged but not raised,
        so a credit-posting problem does not break chat responses.
        """

        try:
            usage = _extract_token_usage(response)

            if not any((usage.input, usage.output, usage.cached)):
                logger.debug(
                    "No token usage to report. conversation_id=%s",
                    request.conversation_id,
                )
                return

            model_name = _normalize_model_name(request.model)
            service_map = _resolve_service_map(request.provider, model_name)
            credit_usage = _build_credit_usage_entries(
                request,
                service_map,
                usage,
                space_id,
            )

            if not credit_usage:
                logger.debug(
                    "No credit entries generated. conversation_id=%s",
                    request.conversation_id,
                )
                return

            logger.info(
                "Posting credit usage for %s/%s: %s",
                request.provider,
                model_name,
                json.dumps(credit_usage, default=str),
            )

            self._credit_manager.post_credit_usage(
                task=request.provider,
                request=credit_usage,
                jwt=jwt,
            )
        except Exception:
            logger.exception(
                "Failed to post credit usage for conversation_id=%s",
                request.conversation_id,
            )


credit_usage_service = CreditUsageService()
