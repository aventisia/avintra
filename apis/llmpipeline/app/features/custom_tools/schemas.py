from typing import Any

from pydantic import BaseModel, Field


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
