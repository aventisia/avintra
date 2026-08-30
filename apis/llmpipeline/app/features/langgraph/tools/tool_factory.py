from langchain_core.tools import BaseTool, Tool, tool

from app.core.logger import logger
from app.features.langgraph.schemas.tool_schema import ToolConfig


def create_tool_from_callable(
    name: str,
    func: callable,
    description: str | None = None,
    args_schema: type | None = None,
) -> BaseTool:
    """
    Wrap an arbitrary callable as a LangChain ``Tool``.

    This is useful for registering integration methods (e.g. Gmail
    send/receive) without requiring the ``@tool`` decorator.
    """

    tool_instance = Tool(
        name=name,
        func=func,
        description=description or f"Execute the {name} action.",
        args_schema=args_schema,
    )

    logger.debug(
        "Created tool from callable: %s",
        name,
    )

    return tool_instance


def create_tools_from_config(
    config: ToolConfig,
    action_handlers: dict[str, callable],
) -> list[BaseTool]:
    """
    Build one LangChain tool per configured action.

    Args:
        config: Tool configuration containing the integration name and
            allowed actions.
        action_handlers: Mapping from action name to implementation.

    Returns:
        A list of LangChain tools ready to be registered.
    """

    tools = []

    for action_config in config.actions:
        action_name = action_config.action
        handler = action_handlers.get(action_name)

        if handler is None:
            logger.warning(
                "No handler for action %s in tool %s",
                action_name,
                config.tool,
            )
            continue

        tool_name = f"{config.tool}_{action_name}"
        tool_instance = create_tool_from_callable(
            name=tool_name,
            func=handler,
            description=f"Execute {action_name} on {config.tool}.",
        )

        tools.append(tool_instance)

    return tools


def wrap_schema_tool(schema: dict) -> BaseTool:
    """
    Convert a JSON schema definition into a no-op tool for LLM prompting.

    This is helpful during early development to expose a tool interface
    before the real integration is implemented.
    """

    name = schema.get("name", "placeholder_tool")
    description = schema.get("description", "Placeholder tool.")

    @tool
    def placeholder(**kwargs):
        return {
            "status": "not_implemented",
            "tool": name,
            "args": kwargs,
        }

    placeholder.name = name
    placeholder.description = description

    return placeholder
