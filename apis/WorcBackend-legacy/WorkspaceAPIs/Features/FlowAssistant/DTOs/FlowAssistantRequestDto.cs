namespace WorkspaceAPIs.Features.FlowAssistant.DTOs;

/// <summary>
/// Incoming request for a flow-assistant graph proposal.
/// </summary>
public class FlowAssistantRequestDto
{
    [RequiredGuid]
    public Guid FlowVersionId { get; set; }

    [RequiredGuid]
    public Guid FlowId { get; set; }

    public string? UserInput { get; set; }

    public List<FlowAssistantMessageDto>? ThreadMessages { get; set; }

    public FlowAssistantGraphContextDto GraphContext { get; set; } = new();

    public string? SelectedNodeId { get; set; }

    public FlowAssistantReferenceDataDto? ReferenceData { get; set; }

    /// <summary>
    /// Selected model identifier; defaults to the curated default when omitted or invalid.
    /// </summary>
    public string? ModelId { get; set; }
}
