using System.Text.Json.Nodes;

namespace WorkspaceAPIs.DTOs;

public class ExecuteFlowRequestDto
{
    [RequiredGuid]
    public Guid FlowVersionId { get; set; }

    public JsonNode? InputArgumentsJson { get; set; }

    /// <summary>
    /// When true, the API will wait for the flow execution to complete and return the output inline.
    /// When false (default), the API returns immediately with a job ID and execution happens in the background.
    /// </summary>
    public bool WaitForCompletion { get; set; } = false;
}
