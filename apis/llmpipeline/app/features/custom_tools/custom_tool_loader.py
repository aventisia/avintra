from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.tools import tool

from app.core.env_utils import normalize_env_type
from app.core.space_utils import normalize_space_id
from app.features.custom_tools.custom_tool_executor import execute_operation
from app.features.custom_tools.models import Tool
from app.features.custom_tools.openapi_parser import parse_openapi_spec
from app.features.custom_tools.schemas import ToolOperation


async def load_custom_tools(
    session: AsyncSession,
    tenant_id: UUID,
    tool_names: list[str] | None = None,
    workspace_api: str | None = None,
    access_token: str | None = None,
    env_type: str = "dev",
    space_id: str | UUID | None = None,
    claimed_roots: set[str] | None = None,
) -> list[dict]:
    """
    Load the tenant's active custom tools for an environment.

    Tools are resolved by root name (``ai_Tools.Name``) so only the actions
    explicitly configured on the agent are loaded. An empty/omitted
    ``tool_names`` loads nothing: custom tools are never bound unless the agent
    configures them.

    When ``claimed_roots`` is passed, the casefolded names of the store rows
    that were selected are added to it, so platform resolution can let a
    tenant custom tool win a shared name.
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
    stmt = (
        select(Tool)
        .where(Tool.tenant_id == tenant_id)
        .where(func.lower(Tool.env_type) == normalized_env)
        .where(func.lower(Tool.name).in_([name.lower() for name in normalized_tool_names]))
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
        if claimed_roots is not None:
            claimed_roots.add(normalized_name)
        if not tool.parsed_schema:
            continue

        operations_data = tool.parsed_schema
        if isinstance(operations_data, dict) and "paths" in operations_data:
            operations = parse_openapi_spec(operations_data)
            raw_operations = [
                operation
                for methods in (operations_data.get("paths") or {}).values()
                if isinstance(methods, dict)
                for operation in methods.values()
                if isinstance(operation, dict)
            ]
        elif isinstance(operations_data, list):
            raw_operations = [op for op in operations_data if isinstance(op, dict)]
            operations = [_coerce_operation(op) for op in raw_operations]
        elif isinstance(operations_data, dict) and isinstance(operations_data.get("operations"), list):
            raw_operations = [op for op in operations_data["operations"] if isinstance(op, dict)]
            operations = [_coerce_operation(op) for op in raw_operations]
        else:
            continue

        backfill_is_verified = tool.is_verified and not _has_operation_verification_flags(raw_operations)
        for operation in operations:
            if not operation.is_verified and not backfill_is_verified:
                continue

            langchain_tools.append(
                _build_langchain_tool(
                    tool_record=tool,
                    operation=operation,
                    workspace_api=workspace_api,
                    access_token=access_token,
                    env_type=normalized_env,
                )
            )

    return langchain_tools


def _has_operation_verification_flags(raw_operations: list[dict]) -> bool:
    return any(
        "isVerified" in operation or "is_verified" in operation
        for operation in raw_operations
    )


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
        response_schema=operation.get("responseSchema") or operation.get("response_schema"),
        is_verified=bool(operation.get("isVerified", operation.get("is_verified", False))),
    )


def _build_langchain_tool(
    tool_record: Tool,
    operation: ToolOperation,
    workspace_api: str | None = None,
    access_token: str | None = None,
    env_type: str = "dev",
):

    @tool
    async def invoke(**kwargs) -> dict:
        """Invokes this operation against the custom tool's endpoint."""
        return await execute_operation(
            base_url=tool_record.base_url,
            operation=operation,
            parameters=kwargs,
            authentication_type=tool_record.authentication_type,
            credential_name=tool_record.credential_name,
            workspace_api=workspace_api,
            access_token=access_token,
            env_type=env_type,
        )

    invoke.name = f"{tool_record.name}_{operation.operation_id}"
    invoke.description = operation.summary or operation.description or f"Execute {operation.operation_id}"
    return invoke
