from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Literal, Dict, Any, Union
from datetime import datetime

from app.features.litellm.core.legacy_byok import LegacyByokWarningModel

# standard request schema for STT providers
class STTProviderRequest(LegacyByokWarningModel):
    """
    Standard request schema for all STT providers.
    """
    model_config = ConfigDict(extra="ignore")

    input: str  # URL, local file path, or data URI
    provider: str
    model: str
    language: Optional[str] = Field(None)
    stream: bool = Field(False)
    credential_name: Optional[str] = Field(None, validation_alias='credential_name', serialization_alias='credential_name')
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow")
    ref_id: str # Identifier to link back to Agent/Workflow
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow)
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution")


# standard response schema for STT providers (non-streaming)
class STTProviderResponse(BaseModel):
    """
    Standard response schema for STT providers.
    """

    provider: str
    model: str
    status: Literal["pending", "processing", "completed", "failed"]
    output: Optional[str] = Field(None)
    error: Optional[str] = None
    stream: bool = Field(False)
    credential_name: Optional[str] = Field(None, validation_alias='credential_name', serialization_alias='credential_name')
    duration_seconds: Optional[float] = Field(None)
    token_count: Optional[float] = Field(None)
    time_taken: Optional[float] = Field(None)
    created_on: datetime = Field(default_factory=datetime.utcnow)
    ref_id: Optional[str] = Field(None)
    ref_type: Optional[str] = Field(None)
    ref_name: Optional[str] = Field(None)
    action: Optional[str] = Field(None)

# Streaming chunk schema for STT providers

class STTProviderStreamChunk(BaseModel):
    """
    Streaming chunk for STT providers.
    """

    provider: str
    output: str
    request_id: Optional[str] = Field(None)
    is_final: Optional[bool] = Field(False)
    created_on: datetime = Field(default_factory=datetime.utcnow)