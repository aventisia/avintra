using WorkspaceAPIs.Enums;

namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Upsert request for an agent risk registry record.
/// Human-input fields only — the backend resolves and persists the model/tool
/// dependency lists at save-time.
/// </summary>
public class AgentRiskRegistryUpsertDto
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
    /// Agent scope / autonomy sub-score (1-5).
    /// </summary>
    public int ScopeScore { get; set; }

    /// <summary>
    /// Data sensitivity sub-score (1-5).
    /// </summary>
    public int DataSensitivityScore { get; set; }

    /// <summary>
    /// Dependency complexity sub-score (1-5).
    /// </summary>
    public int DependencyComplexityScore { get; set; }

    /// <summary>
    /// Supervisory / regulatory impact sub-score (1-5).
    /// </summary>
    public int SupervisoryImpactScore { get; set; }

    /// <summary>
    /// Optional justification for the tier.
    /// </summary>
    public string? TierJustification { get; set; }

    /// <summary>
    /// Lifecycle status of the record.
    /// </summary>
    public AgentRiskLifecycleStatusEnum Status { get; set; } = AgentRiskLifecycleStatusEnum.NotAssessed;

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
    /// Risk register rows.
    /// </summary>
    public List<RiskRegisterRowDto> Risks { get; set; } = new();

    /// <summary>
    /// AI models used by the agent (human-input overrides merged with resolved list).
    /// </summary>
    public List<AiModelDto> AiModels { get; set; } = new();

    /// <summary>
    /// Third-party tools used by the agent (human-input overrides merged with resolved list).
    /// </summary>
    public List<ThirdPartyToolDto> ThirdPartyTools { get; set; } = new();

    /// <summary>
    /// Approval workflow state.
    /// </summary>
    public ApprovalStateDto Approval { get; set; } = new();

    /// <summary>
    /// Manually recorded issues / violations.
    /// </summary>
    public List<AgentRiskIssueDto> Issues { get; set; } = new();
}
