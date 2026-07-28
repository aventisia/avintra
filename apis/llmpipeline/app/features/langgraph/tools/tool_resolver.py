from langchain_core.tools import BaseTool

from app.core.logger import logger
from app.features.langgraph.tools.tool_registry import ToolRegistry


class ToolResolver:
    """
    Resolves tools that should be available to the LLM agent.
    """

    def __init__(
        self,
        registry: ToolRegistry,
        tool_names: list[str] | None = None,
    ):
        # Store tool registry reference.
        self.registry = registry
        self.tool_names = tool_names

    def resolve(self) -> list[BaseTool]:
        """
        Select tools for the current LLM request.

        Rules:
            - If a list of ``tool_names`` was provided during construction:
                Load only those requested tools.

            - Otherwise:
                Load all registered tools.
        """

        if self.tool_names:
            tools = self.registry.get_by_names(self.tool_names)
        else:
            tools = self.registry.get_all()

        return tools

    def resolve_from_request(
        self,
        tool_config: list | None,
    ) -> list[BaseTool]:
        """
        Backwards-compatible resolver used when the caller already knows the
        requested tool names from the request payload.
        """

        if tool_config:
            tool_names = [
                config.tool
                for config in tool_config
            ]
            tools = self.registry.get_by_names(tool_names)
        else:
            tools = self.registry.get_all()

        return tools
