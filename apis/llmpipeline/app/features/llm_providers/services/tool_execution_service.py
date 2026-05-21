import json
import importlib

from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.auth.authenticated_user import User
from app.core.logger import logger


class ToolExecutionService:

    @classmethod
    async def execute_tool_calls(
        cls,
        tool_calls,
        llm_request: LLMRequest,
        user: User
    ):

        outputs = []

        for tool_call in tool_calls:

            tool_name = tool_call.get("name")
            arguments = tool_call.get("arguments", {})
            call_id = tool_call.get("call_id")

            result = await cls.execute_tool(
                tool_name=tool_name,
                arguments=arguments,
                user=user,
                llm_request= llm_request
            )

            outputs.append({
                "type": "function_call_output",
                "call_id": call_id,
                "output": result
            })

        return outputs

    @classmethod
    async def execute_tool(
        cls,
        tool_name: str,
        arguments: dict,
        user: User,
        llm_request: LLMRequest
    ):

        try:

            # gmail_send_email
            parts = tool_name.split("_", 1)

            if len(parts) != 2:
                raise Exception(
                    f"Invalid tool name: {tool_name}"
                )

            platform = parts[0]
            capability = parts[1]

            # app.features.llm_providers.tools.gmail.send_email_executor
            module_path = (
                f"app.features.llm_providers.tools."
                f"{platform}."
                f"{capability}_executor"
            )

            module = importlib.import_module(
                module_path
            )

            # GmailSendEmailExecutor
            class_name = (
                f"{platform.capitalize()}"
                f"{''.join(word.capitalize() for word in capability.split('_'))}"
                f"Executor"
            )

            executor_class = getattr(
                module,
                class_name
            )

            executor_instance = executor_class()

            return await executor_instance.execute(
                arguments,
                user,
                llm_request
            )

        except Exception as e:

            logger.exception(
                f"Tool execution failed: {tool_name}"
            )

            return {
                "success": False,
                "error": str(e)
            }