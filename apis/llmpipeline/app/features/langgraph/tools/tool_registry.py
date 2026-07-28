from langchain_core.tools import BaseTool

from app.core.logger import logger


class ToolRegistry:
    """
    Stores and manages LangGraph tools.
    """

    def __init__(self):
        # Store tools using tool name as the key.
        self._tools: dict[str, BaseTool] = {}


    def register(
        self,
        tool: BaseTool,
    ) -> None:
        """
        Register a single tool.
        """

        # LangChain tools expose their name property.
        tool_name = tool.name

        # Warn if replacing an existing tool.
        if tool_name in self._tools:
            logger.warning(
                "Replacing existing tool: %s",
                tool_name,
            )

        # Save tool in registry.
        self._tools[tool_name] = tool

        logger.info(
            "Registered tool: %s",
            tool_name,
        )


    def register_many(
        self,
        tools: list[BaseTool],
    ) -> None:
        """
        Register multiple tools.
        """

        # Register each tool individually.
        for tool in tools:
            self.register(tool)



    def get(
        self,
        name: str,
    ) -> BaseTool | None:
        """
        Get a tool by name.
        """

        # Return tool if available, otherwise None.
        return self._tools.get(name)



    def get_all(
        self,
    ) -> list[BaseTool]:
        """
        Get all registered tools.
        """

        # Return all tools for full agent access.
        return list(self._tools.values())



    def get_by_names(
        self,
        names: list[str],
    ) -> list[BaseTool]:
        """
        Get tools by provided names.
        """

        selected_tools = []

        # Resolve each requested tool name.
        for name in names:

            tool = self.get(name)

            if tool:

                selected_tools.append(tool)

            else:

                # Log invalid tool requests.
                logger.warning(
                    "Tool not found: %s",
                    name,
                )

        return selected_tools



    def exists(
        self,
        name: str,
    ) -> bool:
        """
        Check if tool exists.
        """

        # Check tool registration status.
        return name in self._tools



    def names(
        self,
    ) -> list[str]:
        """
        Get all registered tool names.
        """

        # Return available tool identifiers.
        return list(self._tools.keys())



    def remove(
        self,
        name: str,
    ) -> bool:
        """
        Remove a registered tool.
        """

        # Do nothing if tool does not exist.
        if name not in self._tools:
            logger.warning(
                "Tool not found for removal: %s",
                name,
            )
            return False

        # Delete tool from registry.
        del self._tools[name]

        logger.info(
            "Removed tool: %s",
            name,
        )

        return True