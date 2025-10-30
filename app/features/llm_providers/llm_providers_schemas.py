# Schemas for LLM Providers feature
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime, timezone
from typing import Union, List

# LLM message structure for chat-based models
class LLMMessage(BaseModel):
    role: Literal['system', 'developer', 'user', 'assistant']
    content: str

# Request schema to generate LLM response
class LLMRequest(BaseModel):
    provider: Literal['openai','ollama']
    model: str
    input: Union[str, List[LLMMessage]]  # Accepts string or list of messages
    files: Optional[List[str]] = None  # List of base64-encoded files for OCR/text extraction
    is_json_output: Optional[bool] = False # Try to extract JSON from response and sends no streaming response in one go even if streaming is true
    json_schema: Optional[str] = None
    max_output_tokens: Optional[int] 
    is_byok_enabled: Optional[bool] = False # TODO: Implement BYOK support
    credential_id: Optional[str] = None # TODO: Implement BYOK support
    temperature: Optional[float] = 1.0
    top_p: Optional[float] = 1.0
    stream: Optional[bool] = False
    
# Chunk response schema for streaming LLM response
class LLMChunkResponse(BaseModel):
    provider: Literal['openai','ollama']
    model: str
    output: str
    
# Response schema for LLM full response or last chunk in streaming
class LLMResponse(BaseModel):
    provider: Literal['openai','ollama']
    model: str
    output: str
    status: Optional[Literal['completed', 'failed', 'in_progress', 'cancelled', 'queued', 'incomplete']] = None
    finish_reason: Optional[str] = None
    created_on: datetime = datetime.now(timezone.utc)
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
    is_byok_enabled: Optional[bool] = False # TODO: Implement BYOK support
    credential_id: Optional[str] = None # TODO: Implement BYOK support
    error: Optional[str] = None
