namespace WorkspaceAPIs.Features.FlowAssistant.DTOs;

/// <summary>
/// Compact reference values the flow assistant may use to fill node configuration.
/// </summary>
public class FlowAssistantReferenceDataDto
{
    public List<string> Queues { get; set; } = new();

    public List<string> Agents { get; set; } = new();

    public List<string> Blocks { get; set; } = new();

    public List<string> ModelProviders { get; set; } = new();

    public List<string> Skills { get; set; } = new();

    public List<string> KnowledgeBases { get; set; } = new();
}
