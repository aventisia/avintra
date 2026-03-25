# Schemas for LLM Providers feature
from pydantic import BaseModel, Field
from typing import Optional, Literal, TypeAlias, Any
from datetime import datetime, timezone
from typing import Union, List

# Centralized provider literal for all schemas
ProviderLiteral: TypeAlias = Literal['openai', 'ollama', 'deepinfra', 'googlegemini', 'openrouter']

# LLM message structure for chat-based models
class LLMMessage(BaseModel):
    role: Literal['system', 'developer', 'user', 'assistant', 'model']
    content: str

class LLMEncodedFile(BaseModel):
    mime_type: Literal[
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-rar-compressed',
        'application/csv',
        'text/csv',
        'text/plain',
        'application/json',
        'application/xml',
    ]
    encoded_content: str

# Request schema to generate LLM response
class LLMRequest(BaseModel):
    provider: ProviderLiteral
    model: str
    input: Union[str, List[LLMMessage]]  # Accepts string or list of messages
    files: Optional[Union[List[str], List[LLMEncodedFile]]] = None  
    is_json_output: Optional[bool] = False # Try to extract JSON from response and sends no streaming response in one go even if streaming is true
    json_schema: Optional[Union[str, dict]] = None  # Can be JSON string or dict object
    max_output_tokens: Optional[int] = Field(default=None, ge=0) # None or 0 means no limit
    is_byok_enabled: Optional[bool] = False # TODO: Implement BYOK support
    credential_id: Optional[str] = None # TODO: Implement BYOK support
    temperature: Optional[float] = 1.0
    top_p: Optional[float] = 1.0
    stream: Optional[bool] = False,
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow", "AIProject")
    ref_id: str # Identifier to link back to Agent/Workflow/AIProject
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow/AIProject)
    action: str # Action being performed (e.g., "AgentExecution", "AIModelExecution", "WorkflowExecution")
    agent_name: Optional[str] = None
    
# Chunk response schema for streaming LLM response
class LLMChunkResponse(BaseModel):
    provider: ProviderLiteral
    model: str
    output: Union[str, dict, list]  # String for text/markdown, dict/list for JSON responses
    
# Response schema for LLM full response or last chunk in streaming
class LLMResponse(BaseModel):
    provider: ProviderLiteral
    model: str
    output: Union[str, dict, list]  # String for text/markdown, dict/list for JSON responses
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
