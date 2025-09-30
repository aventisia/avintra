# Schemas for LLM Providers feature
from pydantic import BaseModel
from typing import Optional, Literal

class LLMRequest(BaseModel):
    provider: Literal['openai']
    model: str
    input: str # User input or prompt for the LLM
    instructions: Optional[str] = None # System-level instructions for the LLM
    is_json_output: Optional[bool] = False
    json_schema: Optional[str] = None
    is_byok_enabled: Optional[bool] = False # TODO: Implement BYOK support
    credential_id: Optional[str] = None # TODO: Implement BYOK support
    temperature: Optional[float] = 1.0
    top_p: Optional[float] = 1.0
    stream: Optional[bool] = False

class LLMResponse(BaseModel):
    provider: Literal['openai']
    model: str
    output: str
    temperature: float = 1.0
    top_p: float = 1.0
    time_taken: Optional[float] = 0.0
    input_tokens: Optional[int] = 0
    input_cached_tokens: Optional[int] = 0
    output_tokens: Optional[int] = 0
    output_reasoning_tokens: Optional[int] = 0
    is_json_output: Optional[bool] = False
    is_byok_enabled: Optional[bool] = False # TODO: Implement BYOK support
    credential_id: Optional[str] = None # TODO: Implement BYOK support
    error: Optional[str] = None
