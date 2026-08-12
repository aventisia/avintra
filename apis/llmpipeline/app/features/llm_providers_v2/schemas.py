# Dedicated request/response DTOs for the LLM Providers v2 feature (LiteLLM).
#
# IMPORTANT: These schemas are intentionally self-contained and MUST NOT import from
# the legacy `app.features.llm_providers.llm_providers_schemas` module. Keeping the
# provider-specific contracts isolated here allows future changes (routing, fallback,
# usage tracking, rate limiting, provider-specific options) without impacting existing
# integrations.
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# Provider name accepted by this feature. Extensible: add new providers here.
ProviderLiteral = Literal[
    "openai",
    "azure",
    "anthropic",
    "gemini",
    "ollama",
    "openrouter",
    "deepinfra",
]


class ProviderCapability(str, Enum):
    TEXT = "text"
    EMBEDDING = "embedding"
    TTS = "tts"
    STT = "stt"


class V2ChatMessage(BaseModel):
    """A single chat message. Supports OpenAI-style roles plus Anthropic 'model' role."""

    role: Literal["system", "developer", "user", "assistant", "model"]
    content: str


class LLMGenerationRequest(BaseModel):
    provider: str
    model: str
    input: Union[str, list[V2ChatMessage]]
    max_output_tokens: Optional[int] = Field(default=None, ge=0)
    temperature: Optional[float] = Field(default=1.0, ge=0.0, le=2.0)
    top_p: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)
    stream: Optional[bool] = False
    is_json_output: Optional[bool] = False
    json_schema: Optional[Union[str, dict]] = None
    # LiteLLM / OpenAI-compatible extras
    stop: Optional[Union[str, list[str]]] = None
    seed: Optional[int] = None
    reasoning_effort: Optional[str] = None
    # File attachments (URL, local path, or base64 data URI). Images are sent as
    # image_url content blocks; other files as input_file content blocks.
    files: Optional[list[str]] = None
    # BYOK
    is_byok_enabled: Optional[bool] = False
    credential_id: Optional[str] = None
    # KB augmentation
    kb_names: Optional[list[str]] = None
    top_k: Optional[int] = Field(default=5, ge=1, le=100)
    # Credit / reference metadata (mirrors legacy payload expectations)
    ref_type: str = ""
    ref_id: str = ""
    ref_name: str = ""
    action: str = ""
    agent_name: Optional[str] = None
    # Conversation tracking
    conversation_id: Optional[str] = None
    is_temp_chat: bool = False


class LLMGenerationResponse(BaseModel):
    provider: str
    model: str
    output: Union[str, dict, list, Any]
    status: Literal[
        "completed", "failed", "in_progress", "cancelled", "queued", "incomplete"
    ] = "completed"
    finish_reason: Optional[str] = None
    created_on: datetime = Field(default_factory=_utc_now)
    max_output_tokens: Optional[int] = None
    temperature: float = 1.0
    top_p: float = 1.0
    stream: bool = False
    time_taken: Optional[float] = 0.0
    input_tokens: Optional[int] = 0
    input_cached_tokens: Optional[int] = 0
    output_tokens: Optional[int] = 0
    output_reasoning_tokens: Optional[int] = 0
    is_json_output: Optional[bool] = False
    is_byok_enabled: Optional[bool] = False
    credential_id: Optional[str] = None
    error: Optional[str] = None
    conversation_id: Optional[str] = None
    is_temp_chat: bool = False


class LLMGenerationChunk(BaseModel):
    provider: str
    model: str
    output: str
    conversation_id: Optional[str] = None
    # Indicates whether this is the final chunk of the stream.
    done: Optional[bool] = False


class EmbeddingRequest(BaseModel):
    provider: str
    model: str
    input: Union[str, list[str]]
    dimensions: Optional[int] = None
    encoding_format: Literal["float", "base64"] = "float"
    is_byok_enabled: bool = False
    credential_id: Optional[str] = None
    # Credit / reference metadata
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    reference_name: Optional[str] = None
    action: str = ""


class EmbeddingResponse(BaseModel):
    provider: str
    model: str
    embeddings: list[list[float]]
    created_on: datetime = Field(default_factory=_utc_now)
    time_taken: Optional[float] = 0.0
    input_tokens: Optional[int] = 0
    is_byok_enabled: Optional[bool] = False
    credential_id: Optional[str] = None
    status: Literal["completed", "failed"] = "completed"
    error: Optional[str] = None


class ProviderInfo(BaseModel):
    """A provider as reported by LiteLLM (dynamic)."""
    name: str


class ProvidersResponse(BaseModel):
    providers: list[str]
    count: int = 0


class ModelInfo(BaseModel):
    """Per-model metadata resolved from LiteLLM's cost/model catalog.

    `capability` is the normalized capability ('text'/'embedding'/'tts'/'stt')
    derived from LiteLLM's raw `mode`. `metadata` carries the full raw
    `litellm.model_cost` entry so no provider info is lost.
    """
    id: str
    provider: Optional[str] = None
    capability: Optional[str] = None
    mode: Optional[str] = None
    max_input_tokens: Optional[int] = None
    max_output_tokens: Optional[int] = None
    max_tokens: Optional[int] = None
    input_cost_per_token: Optional[float] = None
    output_cost_per_token: Optional[float] = None
    cache_read_input_token_cost: Optional[float] = None
    supports_function_calling: Optional[bool] = None
    supports_parallel_function_calling: Optional[bool] = None
    supports_vision: Optional[bool] = None
    supports_system_messages: Optional[bool] = None
    supports_response_schema: Optional[bool] = None
    supports_prompt_caching: Optional[bool] = None
    supports_pdf_input: Optional[bool] = None
    metadata: dict = Field(default_factory=dict)


class ModelsResponse(BaseModel):
    provider: str
    models: list[ModelInfo]
    count: int = 0
