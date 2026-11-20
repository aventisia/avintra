from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime

from app.features.litellm.core.legacy_byok import LegacyByokWarningModel

# Request and response schemas for TTS providers
class TTSProviderRequest(LegacyByokWarningModel):
    """
    Standard request schema for all TTS providers.
    """
    model_config = ConfigDict(extra="ignore")

    provider: str
    input: str
    model: str
    voice_id: Optional[str] = Field(None)
    language: Optional[str] = Field(None)
    speed: Optional[float] = 1.0
    stream: bool = Field(False)
    credential_name: Optional[str] = Field(None, validation_alias='credential_name', serialization_alias='credential_name')
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow")
    ref_id: str # Identifier to link back to Agent/Workflow
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow)
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution")

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
    credential_name: Optional[str] = Field(None, validation_alias='credential_name', serialization_alias='credential_name')
    ref_id: Optional[str] = Field(None)
    ref_type: Optional[str] = Field(None)
    ref_name: Optional[str] = Field(None)
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
