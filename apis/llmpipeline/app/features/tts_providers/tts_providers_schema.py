from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime

# Request and response schemas for TTS providers
class TTSProviderRequest(BaseModel):
    """
    Standard request schema for all TTS providers.
    """

    provider: str
    input: str
    model: str
    voice_id: Optional[str] = Field(None)
    language: Optional[str] = Field(None)
    speed: Optional[float] = 1.0
    stream: bool = Field(False)
    credentials_id: Optional[str] = Field(None)
    is_byok_enabled: Optional[bool] = Field(False)
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow")
    ref_id: str # Identifier to link back to Agent/Workflow
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow)
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution")
    agent_name: Optional[str] = None

# Standard response schema for TTS providers
class TTSProviderResponse(BaseModel):
    """
    Standard response schema for TTS providers.
    """
    provider: str
    model: str
    status: Literal["pending", "processing", "completed", "failed"]
    output: Optional[str] = Field(None)
    stream: bool = Field(False)
    credentials_id: Optional[str] = Field(None)
    is_byok_enabled: Optional[bool] = Field(False)
    ref_id: Optional[str] = Field(None)
    ref_type: Optional[str] = Field(None)
    agent_name: Optional[str] = Field(None)
    action: Optional[str] = Field(None)
    token_count: Optional[float] = Field(None)
    time_taken: Optional[float] = Field(None)
    created_on: datetime = Field(default_factory=datetime.utcnow)
    error: Optional[str] = None

# TTS streaming chunk schema (used for streaming responses)
class TTSProviderStreamChunk(BaseModel):
    """
    Streaming chunk for TTS providers.
    """

    provider: str
    output: Optional[str] = Field(None)
    request_id: Optional[str] = Field(None)
    is_final: Optional[bool] = Field(False)
    created_on: datetime = Field(default_factory=datetime.utcnow)
