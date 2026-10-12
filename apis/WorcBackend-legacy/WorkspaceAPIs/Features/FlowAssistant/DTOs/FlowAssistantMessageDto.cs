namespace WorkspaceAPIs.Features.FlowAssistant.DTOs;

/// <summary>
/// A single role/content message in a flow-assistant thread.
/// </summary>
public class FlowAssistantMessageDto
{
    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;
}
