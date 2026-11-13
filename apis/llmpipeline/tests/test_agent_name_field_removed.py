"""Guard: the llmpipeline contract carries the agent name once (``ref_name``).

The duplicated ``agent_name`` field must stay out of every request/response
model in the generation, STT/TTS and document-lookup contracts, while a stale
sender that still transmits the removed key keeps working (pydantic ignores
unknown fields by default; this test stops anyone adding ``extra="forbid"``).

Run from ``apis/llmpipeline``:

    ./venv/bin/python -m pytest tests/test_agent_name_field_removed.py -q
"""

from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.litellm.core.schemas import (
    LLMGenerationRequest,
    STTRequest,
    STTResponse,
    TTSRequest,
    TTSResponse,
)
from app.features.stt_providers.stt_providers_schema import (
    STTProviderRequest,
    STTProviderResponse,
)
from app.features.tts_providers.tts_providers_schema import (
    TTSProviderRequest,
    TTSProviderResponse,
)
from app.features.vector_stores.vector_stores_schemas import (
    IngestDocRequest,
    QueryDocRequest,
)

REQUEST_AND_RESPONSE_MODELS = (
    LLMGenerationRequest,
    LLMRequest,
    STTRequest,
    STTResponse,
    TTSRequest,
    TTSResponse,
    STTProviderRequest,
    STTProviderResponse,
    TTSProviderRequest,
    TTSProviderResponse,
    IngestDocRequest,
    QueryDocRequest,
)

RESPONSE_MODELS = (STTResponse, TTSResponse, STTProviderResponse, TTSProviderResponse)


def test_no_contract_model_declares_the_duplicate_field():
    offenders = [
        model.__name__
        for model in REQUEST_AND_RESPONSE_MODELS
        if "agent_name" in model.model_fields
    ]

    assert offenders == []


def test_response_models_echo_the_surviving_field():
    missing = [model.__name__ for model in RESPONSE_MODELS if "ref_name" not in model.model_fields]

    assert missing == []


def test_stale_sender_field_is_ignored_not_rejected():
    request = STTRequest(
        provider="elevenlabs",
        model="scribe_v2",
        input="data:audio/wav;base64,AA==",
        ref_name="Transcription Agent",
        agent_name="Transcription Agent",
    )

    assert request.ref_name == "Transcription Agent"
