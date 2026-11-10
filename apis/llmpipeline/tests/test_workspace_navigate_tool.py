from app.features.langgraph.tools.tool_config_utils import expand_tool_config
from app.features.langgraph.tools.tool_loader import load_platform_tools
from app.features.langgraph.tools.tool_registry import ToolRegistry


def test_landing_tool_config_binds_workspace_navigate():
    # Mirrors StreamingChatService.LandingNavigateToolConfig in WorkspaceAPIs.
    names = expand_tool_config(
        [{"tool": "workspace", "actions": [{"action": "navigate", "approval": "auto"}]}]
    )
    registry = ToolRegistry()
    load_platform_tools(registry)

    assert names == ["workspace_navigate"]
    assert registry.exists("workspace_navigate")
    assert "/configure/queues" in registry.get("workspace_navigate").invoke({"route": "/configure/queues"})
