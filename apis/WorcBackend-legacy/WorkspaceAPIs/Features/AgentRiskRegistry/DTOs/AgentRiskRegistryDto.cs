using WorkspaceAPIs.Enums;

namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Full agent risk registry record returned to the client, including the
/// backend-resolved model/tool lists.
/// </summary>
public class AgentRiskRegistryDto
{
    /// <summary>
    /// Registry record id.
    /// </summary>
    public Guid Id { get; set; }

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
    public string? AgentName { get; set; }

    /// <summary>
    /// Agent type.
    /// </summary>
    public string? AgentType { get; set; }

    /// <summary>
    /// Agent version number.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Whether the agent is customer/consumer-facing.
    /// </summary>
    public bool IsConsumerFacing { get; set; }

    /// <summary>
    /// Intended use / business purpose.
    /// </summary>
    public string? IntendedUse { get; set; }

    /// <summary>
    /// Business processes affected.
    /// </summary>
    public string? BusinessProcesses { get; set; }

    /// <summary>
    /// Scope / autonomy sub-score.
    /// </summary>
    public int ScopeScore { get; set; }

    /// <summary>
    /// Data sensitivity sub-score.
    /// </summary>
    public int DataSensitivityScore { get; set; }

    /// <summary>
    /// Dependency complexity sub-score.
    /// </summary>
    public int DependencyComplexityScore { get; set; }

    /// <summary>
    /// Supervisory impact sub-score.
    /// </summary>
    public int SupervisoryImpactScore { get; set; }

    /// <summary>
    /// Computed composite tier.
    /// </summary>
    public AgentRiskTierEnum CompositeTier { get; set; }

    /// <summary>
    /// Tier justification.
    /// </summary>
    public string? TierJustification { get; set; }

    /// <summary>
    /// Lifecycle status.
    /// </summary>
    public AgentRiskLifecycleStatusEnum Status { get; set; }

    /// <summary>
    /// Last validation date.
    /// </summary>
    public DateTimeOffset? LastValidationDate { get; set; }

    /// <summary>
    /// Next review date.
    /// </summary>
    public DateTimeOffset? NextReviewDate { get; set; }

    /// <summary>
    /// Validator user id.
    /// </summary>
    public Guid? ValidatorUserId { get; set; }

    /// <summary>
    /// AI models used by the agent.
    /// </summary>
    public List<AiModelDto> AiModels { get; set; } = new();

    /// <summary>
    /// Third-party tools used by the agent.
    /// </summary>
    public List<ThirdPartyToolDto> ThirdPartyTools { get; set; } = new();

    /// <summary>
    /// Skills referenced by the agent.
    /// </summary>
    public List<string> Skills { get; set; } = new();

    /// <summary>
    /// Knowledge bases referenced by the agent.
    /// </summary>
    public List<string> KnowledgeBases { get; set; } = new();

    /// <summary>
    /// Risk register rows.
    /// </summary>
    public List<RiskRegisterRowDto> Risks { get; set; } = new();

    /// <summary>
    /// Approval workflow state.
    /// </summary>
    public ApprovalStateDto Approval { get; set; } = new();

    /// <summary>
    /// Manually recorded issues / violations.
    /// </summary>
    public List<AgentRiskIssueDto> Issues { get; set; } = new();
}
