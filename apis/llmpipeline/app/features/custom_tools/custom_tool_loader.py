from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.tools import tool

from app.core.env_utils import normalize_env_type
from app.core.space_utils import normalize_space_id
from app.features.custom_tools.custom_tool_executor import execute_operation
from app.features.custom_tools.models import Tool
from app.features.custom_tools.schemas import ToolOperation


async def load_custom_tools(
    session: AsyncSession,
    tenant_id: UUID,
    tool_names: list[str] | None = None,
    workspace_api: str | None = None,
    access_token: str | None = None,
    env_type: str = "dev",
    space_id: str | UUID | None = None,
) -> list[dict]:
    """
    Load the tenant's active custom tools for an environment.

    Tools are resolved by root name (``ws_Tools.Name``) so only the actions
    explicitly configured on the agent are loaded. An empty/omitted
    ``tool_names`` loads nothing: custom tools are never bound unless the agent
    configures them.
    """

    normalized_tool_names = [
        name.strip() for name in (tool_names or []) if (name or "").strip()
    ]
    if not normalized_tool_names:
        return []

    normalized_env = normalize_env_type(env_type)
    normalized_space_id = normalize_space_id(space_id)
    space_order = case(
        (Tool.space_id == normalized_space_id, 0),
        (Tool.space_id.is_(None), 1),
        else_=2,
    )
    # Verification is tracked per operation, so unverifed tools are not filtered
    # out here; each operation is filtered below (with a legacy tool-level fallback).
    stmt = (
        select(Tool)
        .where(Tool.tenant_id == tenant_id)
        .where(func.lower(Tool.env_type) == normalized_env)
        .where(Tool.name.in_(normalized_tool_names))
        .where(Tool.type == "Custom")
        .where(Tool.is_active == True)
        .where(Tool.is_disabled == False)
        # Prefer the request space, then Central, then the oldest other-space row.
        .order_by(space_order, Tool.created_on.asc(), Tool.id.asc())
    )

    result = await session.execute(stmt)
    tools = result.scalars().all()

    langchain_tools = []
    selected_tool_names: set[str] = set()
    for tool in tools:
        normalized_name = tool.name.casefold()
        if normalized_name in selected_tool_names:
            continue
        selected_tool_names.add(normalized_name)
        if not tool.parsed_schema:
            continue

        operations_data = tool.parsed_schema
        if isinstance(operations_data, dict) and "paths" in operations_data:
            from app.features.custom_tools.openapi_parser import parse_openapi_spec
            operations = parse_openapi_spec(operations_data)
        elif isinstance(operations_data, list):
            operations = [_coerce_operation(op) for op in operations_data if isinstance(op, dict)]
        elif isinstance(operations_data, dict) and isinstance(operations_data.get("operations"), list):
            operations = [
                _coerce_operation(op)
                for op in operations_data["operations"]
                if isinstance(op, dict)
            ]
        else:
            continue

        for operation in operations:
            # Per-operation verification, with the tool-level flag as a legacy
            # fallback for records saved before operation-level tracking existed.
            if not operation.is_verified and not tool.is_verified:
                continue

            langchain_tools.append(
                _build_langchain_tool(
                    tool=tool,
                    operation=operation,
                    workspace_api=workspace_api,
                    access_token=access_token,
                    env_type=normalized_env,
                )
            )

    return langchain_tools


def _coerce_operation(operation: dict) -> ToolOperation:
    """Normalizes an operation dict (camelCase or snake_case) into a ToolOperation."""
    return ToolOperation(
        operation_id=operation.get("operationId") or operation.get("operation_id") or "",
        method=(operation.get("method") or "GET").upper(),
        path=operation.get("path") or "/",
        summary=operation.get("summary"),
        description=operation.get("description"),
        parameters=operation.get("parameters") or [],
        request_body=operation.get("requestBody") or operation.get("request_body"),
        response_schema=operation.get("response_schema"),
        is_verified=bool(operation.get("isVerified", operation.get("is_verified", False))),
    )


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
            credential_name=tool.credential_name,
            workspace_api=workspace_api,
            access_token=access_token,
            env_type=env_type,
        )

    invoke.name = f"{tool.name}_{operation.operation_id}"
    invoke.description = operation.summary or operation.description or f"Execute {operation.operation_id}"
    return invoke
