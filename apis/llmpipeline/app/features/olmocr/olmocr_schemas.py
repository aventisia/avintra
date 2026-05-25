from typing import Optional
from pydantic import BaseModel

class OlmocrRequest(BaseModel):
    file_name: str
    file_data: str  # base64 encoded
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow")
    ref_id: str # Identifier to link back to Agent/Workflow
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow)
    action: str # Action being performed (e.g., "AgentExecution", "WorkflowExecution")
    agent_name: Optional[str] = None

class OlmocrResponse(BaseModel):
    markdown: str
