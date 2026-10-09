from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ToolOperation(BaseModel):
    operation_id: str = Field(description="OpenAPI operationId")
    method: str = Field(description="HTTP method, e.g. GET, POST")
    path: str = Field(description="OpenAPI path template, e.g. /users/{id}")
    summary: str | None = Field(default=None)
    description: str | None = Field(default=None)
    parameters: list[dict[str, Any]] = Field(default_factory=list)
    request_body: dict[str, Any] | None = Field(default=None)
    response_schema: dict[str, Any] | None = Field(default=None)
    is_verified: bool = Field(default=False)


class TestToolRequest(BaseModel):

    base_url: str = Field(alias="baseUrl")
    operation_id: str = Field(alias="operationId")
    parameters: dict | None = Field(default=None)
    credential_name: str | None = Field(default=None, alias="credentialName")
    open_api_spec: str | None = Field(default=None, alias="openApiSpec")


class TestToolResponse(BaseModel):
    success: bool
    status_code: int | None = None
    body: str | None = None
    duration_ms: float | None = None


class ExecuteToolRequest(BaseModel):
    tool_id: UUID
    operation_id: str
    parameters: dict[str, Any] = Field(default_factory=dict)
    credential_name: str | None = Field(default=None)


class ToolDefinition(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    base_url: str
    credential_name: str | None = None
    parsed_schema: list[ToolOperation]
