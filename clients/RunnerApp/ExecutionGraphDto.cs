namespace RunnerApp;

public class ExecutionGraphDto
{
    public Guid JobId { get; set; }
    public Guid TenantId { get; set; }
    public Guid FlowVersionId { get; set; }
    public string FlowName { get; set; } = string.Empty;
    public string? InputArgumentsJson { get; set; }
    public string ReactFlowObject { get; set; } = string.Empty;
    public string? InputOutputObject { get; set; }
    public List<SubFlowGraphDto> SubFlows { get; set; } = [];
}

public class SubFlowGraphDto
{
    public Guid FlowVersionId { get; set; }
    public string ReactFlowObject { get; set; } = string.Empty;
}
