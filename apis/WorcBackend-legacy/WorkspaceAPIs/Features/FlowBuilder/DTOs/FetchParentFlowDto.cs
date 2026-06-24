namespace WorkspaceAPIs.DTOs;

public class FetchParentFlowDto
{
    public Guid FlowId { get; set; }
    public Guid VersionId { get; set; }
    public required string FlowName { get; set; }
    public string? ReactFlowObject { get; set; }
    public string? InputOutputObject { get; set; }
}
