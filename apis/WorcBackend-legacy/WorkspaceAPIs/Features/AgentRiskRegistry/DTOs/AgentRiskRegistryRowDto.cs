using WorkspaceAPIs.Enums;

namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A row in the Agent Risk Registry list table.
/// Combines published-agent identity with the registry state.
/// </summary>
public class AgentRiskRegistryRowDto
{
    /// <summary>
    /// The flow version (agent) id.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// The flow (agent) id.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Agent name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Composite risk tier.
    /// </summary>
    public AgentRiskTierEnum? CompositeTier { get; set; }

    /// <summary>
    /// Lifecycle status.
    /// </summary>
    public AgentRiskLifecycleStatusEnum Status { get; set; }

    /// <summary>
    /// Number of open (unresolved) issues for this agent.
    /// </summary>
    public int OpenIssues { get; set; }

    /// <summary>
    /// Date the agent's assessment was submitted for review/approval.
    /// </summary>
    public DateTimeOffset? ReviewDate { get; set; }

    /// <summary>
    /// Date the agent's assessment was approved by the approver.
    /// </summary>
    public DateTimeOffset? ApprovalDate { get; set; }
}
