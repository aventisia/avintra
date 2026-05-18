import json

from pathlib import Path

from app.core.logger import logger

from app.features.llm_providers.llm_providers_schemas import ToolConfig


class ToolSchemaGeneratorService:

    # app/features/llm_providers/tools
    TOOLS_BASE_PATH = (
        Path(__file__)
        .resolve()
        .parent.parent / "tools"
    )

    @classmethod
    def generate_tools(
        cls,
        tool_configs: list[ToolConfig]
    ) -> list[dict]:

        generated_tools = []

        for config in tool_configs:

            permissions = (
                config.permissions
                if isinstance(config.permissions, list)
                else [config.permissions]
            )

            for capability in permissions:

                tool_schema = cls._load_tool_schema(
                    platform=config.platform,
                    capability=capability.capability
                )

                if tool_schema:
                    generated_tools.append(tool_schema)

        return generated_tools

    @classmethod
    def _load_tool_schema(
        cls,
        platform: str,
        capability: str
    ) -> dict | None:

        try:

            tool_file = (
                cls.TOOLS_BASE_PATH /
                platform /
                f"{capability}.json"
            )

            if not tool_file.exists():

                logger.warning(
                    f"Tool schema not found: {tool_file}"
                )

                return None

            with open(
                tool_file,
                "r",
                encoding="utf-8"
            ) as file:

                tool_schema = json.load(file)

            # Normalize old ChatCompletion format
            if (
                "function" in tool_schema
                and isinstance(tool_schema["function"], dict)
            ):

                function_data = tool_schema["function"]

                tool_schema = {
                    "type": "function",
                    "name": function_data.get("name"),
                    "description": function_data.get(
                        "description",
                        ""
                    ),
                    "parameters": function_data.get(
                        "parameters",
                        {
                            "type": "object",
                            "properties": {}
                        }
                    )
                }

            # Validate required Responses API fields
            required_fields = [
                "type",
                "name",
                "description",
                "parameters"
            ]

            missing_fields = [
                field
                for field in required_fields
                if field not in tool_schema
            ]

            if missing_fields:

                logger.error(
                    f"Invalid tool schema "
                    f"{tool_file}. "
                    f"Missing fields: {missing_fields}"
                )

                return None

            return tool_schema

        except Exception as e:

            logger.exception(
                f"Failed loading tool schema "
                f"{platform}/{capability}: {str(e)}"
            )

            return None