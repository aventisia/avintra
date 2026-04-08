using System.Text.Json.Nodes;

namespace WorkspaceAPIs.DTOs;

public class ExecuteFlowRequestDto
{
    [RequiredGuid]
    public Guid FlowVersionId { get; set; }

    public JsonNode? InputArgumentsJson { get; set; }
}
