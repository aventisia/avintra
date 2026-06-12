# Schemas for LLM Providers feature
from pydantic import BaseModel, Field
from typing import Dict, Optional, Literal, TypeAlias, Any
from datetime import datetime, timezone
from typing import Union, List

# Centralized provider literal for all schemas
ProviderLiteral: TypeAlias = Literal['openai', 'ollama', 'deepinfra', 'googlegemini', 'openrouter', "anthropic"]

# LLM message structure for chat-based models
class LLMMessage(BaseModel):
    role: Literal['system', 'developer', 'user', 'assistant', 'model']
    content: str

class ToolAction(BaseModel):
    action: str    # Action that the tool is permitted to perform (e.g. "send_email")
    approval: Literal["auto", "human"]    # Determines whether execution is automatic or requires approval


class ToolConfig(BaseModel):
    tool: str    # Name of the tool or external service (e.g. "gmail")
    credential_id: str    # Identifier for the credentials used to access the tool
    actions: List[ToolAction]    # List of permitted actions for this tool


# Request schema to generate LLM response
class LLMRequest(BaseModel):
    provider: ProviderLiteral
    model: str
    input: Union[str, List[LLMMessage]]  # Accepts string or list of messages
    files: Optional[List[str]] = None  
    tool_config: Optional[List[ToolConfig]] = None # Optional list of tool/service configurations
    is_json_output: Optional[bool] = False # Try to extract JSON from response and sends no streaming response in one go even if streaming is true
    json_schema: Optional[Union[str, dict]] = None  # Can be JSON string or dict object
    max_output_tokens: Optional[int] = Field(default=None, ge=0) # None or 0 means no limit
    is_byok_enabled: Optional[bool] = False # TODO: Implement BYOK support
    credential_id: Optional[str] = None # TODO: Implement BYOK support
    temperature: Optional[float] = 1.0
    top_p: Optional[float] = 1.0
    stream: Optional[bool] = False,
    is_chat_agent: Optional[bool] = False   # Whether the request originates from a chat agent
    is_dynamic_action: Optional[bool] = False   # Indicates that the request was triggered by a dynamic action/workflow.
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow")
    ref_id: str # Identifier to link back to Agent/Workflow
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow)
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution")
    agent_name: Optional[str] = None  # Knowledge base retrieval (optional)
    kb_names: Optional[List[str]] = None  # Knowledge base names used to scope KB chunk retrieval
    top_k: Optional[int] = Field(default=5, ge=1, le=100)  # Number of top chunks to retrieve from the knowledge base

# Chat agent response schema
class ChatAgentResponse(BaseModel):
    text: str    # Message to display
    tools: Optional[List[dict]] = []    # Tool actions
    recommended_actions: Optional[List[dict]] = []  # User action suggestions

# Chunk response schema for streaming LLM response
class LLMChunkResponse(BaseModel):
    provider: ProviderLiteral
    model: str
    output: Union[str, dict, list, ChatAgentResponse]  # Text, JSON, or structured chat-agent response

# Response schema for LLM full response or last chunk in streaming
class LLMResponse(BaseModel):
    provider: ProviderLiteral
    model: str
    output: Union[str, dict, list, ChatAgentResponse]  # Text, JSON, or structured chat-agent response
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
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution")
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


class ToolParameter(BaseModel):
    type: str
    description: Optional[str] = None
    enum: Optional[List[str]] = None


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]


class ProviderTool(BaseModel):
    type: Literal["function"] = "function"
    function: ToolDefinition