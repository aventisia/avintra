# API routes for LLM Providers
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from .llm_providers_schemas import LLMRequest
from .llm_providers_factory import get_llm_provider

router = APIRouter()


@router.post('/llm/generate')
async def generate_llm_response(request: LLMRequest):
    llm_provider = get_llm_provider(request.provider)
    if request.stream:
        # Use StreamingResponse for streaming
        return StreamingResponse(llm_provider.stream_llm_response(request), media_type="text/event-stream")
    else:
        # Use await for non-streaming
        return await llm_provider.generate_llm_response(request)