# API routes for LLM Providers
from fastapi import APIRouter
from .llm_providers_schemas import LLMRequest, LLMResponse
from .llm_providers_factory import get_llm_provider

router = APIRouter()

# Transactional (non-stream) response endpoint
@router.post('/llm/response', response_model=LLMResponse)
async def generate_llm_response(request: LLMRequest):
    llm_provider = get_llm_provider(request.provider)
    return await llm_provider.generate_llm_response(request)
