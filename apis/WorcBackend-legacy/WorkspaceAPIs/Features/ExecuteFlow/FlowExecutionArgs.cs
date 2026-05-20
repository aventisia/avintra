using ExecutorLibrary.Models;

namespace WorkspaceAPIs.DTOs;

public class FlowExecutionArgs
{
    public required Guid TenantId { get; set; }
    public required Guid JobId { get; set; }
    public required Guid FlowVersionId { get; set; }
    public required string FlowName { get; set; }
    public required ReactFlowDataModel FlowData { get; set; }
    public required Guid UserId { get; set; }
    public string? AccessToken { get; set; }
}