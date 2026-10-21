namespace RunnerApp;

public class ExecutionGraphDto
{
    public Guid JobId { get; set; }
    public Guid TenantId { get; set; }

    /// <summary>
    /// Space of the executed flow, resolved server-side from the job. Echoed back as
    /// "X-Space-Id" on the config-store fetch so space-scoped config keys resolve; null when
    /// the flow lives in Central.
    /// </summary>
    public Guid? SpaceId { get; set; }
    public Guid FlowVersionId { get; set; }
    public string FlowName { get; set; } = string.Empty;
    public string? InputArgumentsJson { get; set; }
    public string ReactFlowObject { get; set; } = string.Empty;
    public string? InputOutputObject { get; set; }
    public List<SubFlowGraphDto> SubFlows { get; set; } = [];

    /// <summary>
    /// The deployment environment of the executing flow ("dev" or "prod"), derived from the
    /// flow's publication status. Seeded into the node CallerContext so nodes forward
    /// "X-Env-Type" on outbound backend calls.
    /// </summary>
    public string EnvType { get; set; } = "dev";
}

public class SubFlowGraphDto
{
    public Guid FlowVersionId { get; set; }
    public string ReactFlowObject { get; set; } = string.Empty;
    public string? InputOutputObject { get; set; }
}
