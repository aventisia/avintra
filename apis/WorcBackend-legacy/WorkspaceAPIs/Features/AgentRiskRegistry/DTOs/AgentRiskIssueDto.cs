namespace WorkspaceAPIs.DTOs;

/// <summary>
/// An issue or violation raised against an agent, recorded manually during
/// execution monitoring. Issues are user-entered only (never auto-created).
/// </summary>
public class AgentRiskIssueDto
{
    /// <summary>
    /// Issue record id (empty until saved).
    /// </summary>
    public string? Id { get; set; }

    /// <summary>
    /// The registry record this issue belongs to.
    /// </summary>
    public string? AgentRiskRegistryId { get; set; }

    /// <summary>
    /// The flow version (agent) id.
    /// </summary>
    public string? FlowVersionId { get; set; }

    /// <summary>
    /// Optional reference to a prior execution (job) id.
    /// </summary>
    public string? JobId { get; set; }

    /// <summary>
    /// Severity of the issue (low/medium/high/critical).
    /// </summary>
    public string? Severity { get; set; }

    /// <summary>
    /// Category of the issue.
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Short title.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Detailed description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// When the issue was detected.
    /// </summary>
    public string? DetectedOn { get; set; }

    /// <summary>
    /// Status: open / investigating / resolved / wont-fix.
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Notes from resolution.
    /// </summary>
    public string? ResolutionNotes { get; set; }
}
