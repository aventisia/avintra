from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from langchain_core.tools import tool

from app.core.logger import logger
from app.features.custom_tools.custom_tool_executor import execute_operation
from app.features.custom_tools.models import Tool
from app.features.custom_tools.schemas import ToolDefinition, ToolOperation


async def load_tools_for_tenant(
    session: AsyncSession,
    tenant_id: UUID,
    flow_version_id: UUID | None = None,
    workspace_api: str | None = None,
    access_token: str | None = None,
    env_type: str = "dev",
) -> list[dict]:
    stmt = (
        select(Tool)
        .where(Tool.tenant_id == tenant_id)
        .where(Tool.type == "Custom")
        .where(Tool.is_active == True)
        .where(Tool.is_verified == True)
        .where(Tool.is_disabled == False)
    )

    if flow_version_id:
        from app.features.custom_tools.models import FlowVersion_Tool
        stmt = stmt.join(FlowVersion_Tool, Tool.id == FlowVersion_Tool.tool_id).where(
            FlowVersion_Tool.flow_version_id == flow_version_id
        )

    result = await session.execute(stmt)
    tools = result.scalars().all()

    langchain_tools = []
    for tool in tools:
        if not tool.parsed_schema:
            continue

        operations_data = tool.parsed_schema
        if isinstance(operations_data, dict) and "paths" in operations_data:
            from app.features.custom_tools.openapi_parser import parse_openapi_spec
            operations = parse_openapi_spec(operations_data)
        elif isinstance(operations_data, list):
            operations = [ToolOperation(**op) if isinstance(op, dict) else op for op in operations_data]
        else:
            continue

        for operation in operations:
            langchain_tools.append(
                _build_langchain_tool(
                    tool=tool,
                    operation=operation,
                    workspace_api=workspace_api,
                    access_token=access_token,
                    env_type=env_type,
                )
            )

    return langchain_tools


def _build_langchain_tool(
    tool: Tool,
    operation: ToolOperation,
    workspace_api: str | None = None,
    access_token: str | None = None,
    env_type: str = "dev",
):

    @tool
    async def invoke(**kwargs) -> dict:
        return await execute_operation(
            base_url=tool.base_url,
            operation=operation,
            parameters=kwargs,
            authentication_type=tool.authentication_type,
            credential_id=tool.credential_id,
            workspace_api=workspace_api,
            access_token=access_token,
            env_type=env_type,
        )

    invoke.name = f"{tool.name}_{operation.operation_id}"
    invoke.description = operation.summary or operation.description or f"Execute {operation.operation_id}"
    return invoke
