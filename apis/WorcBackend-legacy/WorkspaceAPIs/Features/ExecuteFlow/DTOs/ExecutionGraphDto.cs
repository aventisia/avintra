namespace WorkspaceAPIs.DTOs;

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

    /// <summary>
    /// The deployment environment of the executing flow ("dev" or "prod"), derived from the
    /// flow's publication status (published → "prod", otherwise "dev"). Consumed by the
    /// desktop runner so nodes forward "X-Env-Type" and resolve resources in the same env.
    /// </summary>
    public string EnvType { get; set; } = "dev";
}

public class SubFlowGraphDto
{
    public Guid FlowVersionId { get; set; }
    public string ReactFlowObject { get; set; } = string.Empty;
    public string? InputOutputObject { get; set; }
}
