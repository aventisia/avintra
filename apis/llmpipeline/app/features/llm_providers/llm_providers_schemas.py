# Schemas for LLM Providers feature
from pydantic import BaseModel, Field
from typing import Optional, Literal, TypeAlias, Any
from datetime import datetime, timezone
from typing import Union, List

# Centralized provider literal for all schemas
ProviderLiteral: TypeAlias = Literal['openai', 'ollama', 'deepinfra', 'googlegemini', 'openrouter', "anthropic"]

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
    files: Optional[List[str]] = None  
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
    # Knowledge base retrieval (optional)
    kb_names: Optional[List[str]] = None  # Knowledge base names used to scope KB chunk retrieval
    top_k: Optional[int] = Field(default=5, ge=1, le=100)  # Number of top chunks to retrieve from the knowledge base

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


class EmbeddingRequest(BaseModel):
    provider: ProviderLiteral  # Embedding provider (e.g., openai, azure, etc.)
    model: str  # Model name used for generating embeddings
    input: Union[str, List[str]]  # Text or list of texts to embed
    dimensions: Optional[int] = None  # Output vector size (if supported)
    encoding_format: Literal['float', 'base64'] = 'float'  # Output format of embeddings
    reference_id: Optional[str] = None  # ID of related object (doc, record, etc.)
    reference_type: Optional[str] = None  # Type of reference (e.g., "document")
    reference_name: Optional[str] = None  # Human-readable name
    action: str # Action being performed (e.g., "AgentExecution", "AIModelExecution", "WorkflowExecution")
    is_byok_enabled: bool = False  # Whether custom credentials are used
    credential_id: Optional[str] = None  # ID of the credential

class EmbeddingResponse(BaseModel):
    provider: ProviderLiteral  # Provider used for embedding
    model: str  # Model used
    embeddings: List[List[float]]  # List of embedding vectors (one per input)
    created_on: datetime = datetime.now(timezone.utc)  # Timestamp of response creation
    time_taken: Optional[float] = 0.0  # Time taken to generate embeddings (in seconds)
    is_byok_enabled: Optional[bool] = False  # Whether BYOK was used
    credential_id: Optional[str] = None  # Credential identifier
    input_tokens: Optional[int] = 0  # Number of tokens processed
    status: Literal['completed', 'failed'] = 'completed'  # Execution status
    error: Optional[str] = None  # Error message if failed