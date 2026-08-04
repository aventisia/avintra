from app.features.auth.authenticated_user import User
from fastapi import APIRouter, Depends

from app.dependencies.authorize import authorize
from app.core.logger import logger
from app.features.custom_tools.schemas import TestToolRequest, TestToolResponse
from app.features.custom_tools.service import execute_tool_test

router = APIRouter()


@router.post("/custom-tools/test", response_model=TestToolResponse)
async def test_custom_tool(
    payload: TestToolRequest,
    user: User = Depends(authorize()),
):
    logger.info(
        "Testing custom tool: operation_id=%s base_url=%s",
        payload.operation_id,
        payload.base_url,
    )
    result = await execute_tool_test(
        base_url=payload.base_url,
        operation_id=payload.operation_id,
        parameters=payload.parameters,
        credential_id=payload.credential_id,
        access_token=user.access_token,
        open_api_spec=payload.open_api_spec,
    )
    return TestToolResponse(**result)
