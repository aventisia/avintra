import json

from pathlib import Path

from app.core.logger import logger

from app.features.llm_providers.llm_providers_schemas import ToolConfig
from app.features.llm_providers.services.corsair_sidecar_service import (
    fetch_corsair_schemas,
    is_corsair_tool,
)


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
        corsair_configs = []

        for config in tool_configs:

            # Corsair tools are identified by dotted tool names (e.g. "github.issues.create")
            # or by tool identifiers matching a Corsair plugin path. Fetch their schemas
            # from the sidecar on demand so the LLM sees live operation definitions.
            #
            # A config is a Corsair tool when either:
            #   - the tool name itself is dotted (e.g. "github.issues.create"), OR
            #   - any of its actions is dotted (e.g. action "api.issues.list" under
            #     tool "github"). The plugin name alone ("github") has no dot, so we
            #     must also inspect the actions to route it to the sidecar.
            if is_corsair_tool(config.tool) or cls._has_corsair_action(config):
                corsair_configs.append(config)
                continue

            actions = (
                config.actions
                if isinstance(config.actions, list)
                else [config.actions]
            )

            for action in actions:

                tool_schema = cls._load_tool_schema(
                    tool=config.tool,
                    action=action.action
                )

                if tool_schema:
                    generated_tools.append(tool_schema)

        if corsair_configs:
            # fetch_corsair_schemas is async but legacy callers call this sync method.
            # We run it through a small event-loop helper so existing provider code does
            # not need to change its signature.
            import asyncio
            try:
                corsair_tools = asyncio.run(fetch_corsair_schemas(corsair_configs))
                generated_tools.extend(corsair_tools)
            except Exception as e:
                logger.exception("Failed to fetch Corsair tool schemas")

        return generated_tools

    @staticmethod
    def _has_corsair_action(config) -> bool:
        """Return True when any action in ``config`` is a dotted Corsair path.

        A config may use the plugin name as ``tool`` (e.g. "github") while the
        action carries the dotted path (e.g. "api.issues.list"). In that case the
        tool name alone has no dot, so we inspect the actions to decide whether
        this is a Corsair tool.
        """
        actions = getattr(config, "actions", None)
        if actions is None and isinstance(config, dict):
            actions = config.get("actions")

        if not actions:
            return False

        if isinstance(actions, list):
            for action in actions:
                action_name = (
                    getattr(action, "action", None)
                    if not isinstance(action, dict)
                    else action.get("action")
                )
                if action_name and "." in str(action_name):
                    return True
        return False

    @classmethod
    def _load_tool_schema(
        cls,
        tool: str,
        action: str
    ) -> dict | None:

        try:

            tool_file = (
                cls.TOOLS_BASE_PATH /
                tool /
                f"{action}.json"
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
                f"{tool}/{action}: {str(e)}"
            )

            return None