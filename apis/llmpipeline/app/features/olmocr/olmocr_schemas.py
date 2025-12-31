from typing import Optional
from pydantic import BaseModel

class OlmocrRequest(BaseModel):
    file_name: str
    file_data: str  # base64 encoded
    ref_type: str # Type of the reference (e.g., "Agent", "Workflow", "AIProject")
    ref_id: str # Identifier to link back to Agent/Workflow/AIProject
    ref_name: str # Name of the reference (e.g., name of the Agent/Workflow/AIProject)
    action: str # Action being performed (e.g., "AgentExecution", "AIModelExecution", "WorkflowExecution")
    agent_name: Optional[str] = None

class OlmocrResponse(BaseModel):
    markdown: str
