namespace WorkspaceAPIs.Features.FlowAssistant.DTOs;

/// <summary>
/// Current canvas nodes and edges sent with a flow-assistant request.
/// </summary>
public class FlowAssistantGraphContextDto
{
    public List<JsonElement> Nodes { get; set; } = new();

    public List<JsonElement> Edges { get; set; } = new();
}
