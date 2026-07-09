using System.Text.Json.Nodes;

namespace WorkspaceAPIs.DTOs;

public class ExecuteFlowResponseDto
{
    public Guid JobId { get; set; }

    public Guid FlowVersionId { get; set; }

    public JsonNode? OutputDataJson { get; set; }

    public JobStatusEnum JobStatus { get; set; } = JobStatusEnum.Created;
}
