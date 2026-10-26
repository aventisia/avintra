namespace WorkspaceAPIs.Entities;

/// <summary>
/// A risk registry record for a published agent (flow version).
/// Captures agent-level risks and mitigations, including the AI models and
/// third-party tools the agent depends on. This is standalone — it does not
/// gate or block agent publishing.
/// </summary>
[Table("agent_RiskRegistry")]
public class AgentRiskRegistry : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the space this record belongs to. Null = Central space.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the flow version (agent) this registry record belongs to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the flow (agent) record id.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the agent name (system pre-filled).
    /// </summary>
    public string? AgentName { get; set; }

    /// <summary>
    /// Gets or sets the agent type (e.g. Agent, ChatAgent).
    /// </summary>
    public string? AgentType { get; set; }

    /// <summary>
    /// Gets or sets the agent version number (system pre-filled).
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets whether the agent is customer/consumer-facing.
    /// </summary>
    public bool IsConsumerFacing { get; set; }

    /// <summary>
    /// Gets or sets the intended use / business purpose (human input).
    /// </summary>
    public string? IntendedUse { get; set; }

    /// <summary>
    /// Gets or sets the business processes affected (comma-separated, human input).
    /// </summary>
    public string? BusinessProcesses { get; set; }

    // ---- Agent risk tier (computed) ----

    /// <summary>
    /// Gets or sets the agent scope / autonomy sub-score.
    /// </summary>
    public int ScopeScore { get; set; }

    /// <summary>
    /// Gets or sets the data sensitivity sub-score.
    /// </summary>
    public int DataSensitivityScore { get; set; }

    /// <summary>
    /// Gets or sets the dependency complexity sub-score.
    /// </summary>
    public int DependencyComplexityScore { get; set; }

    /// <summary>
    /// Gets or sets the supervisory / regulatory impact sub-score.
    /// </summary>
    public int SupervisoryImpactScore { get; set; }

    /// <summary>
    /// Gets or sets the computed composite tier (MAX of sub-scores, no dilution).
    /// </summary>
    public AgentRiskTierEnum CompositeTier { get; set; } = AgentRiskTierEnum.Low;

    /// <summary>
    /// Gets or sets an optional justification for the tier.
    /// </summary>
    public string? TierJustification { get; set; }

    // ---- Validation & approval (human input) ----

    /// <summary>
    /// Gets or sets the lifecycle status of this registry record.
    /// </summary>
    public AgentRiskLifecycleStatusEnum Status { get; set; } = AgentRiskLifecycleStatusEnum.NotAssessed;

    /// <summary>
    /// Gets or sets the date of last validation.
    /// </summary>
    public DateTimeOffset? LastValidationDate { get; set; }

    /// <summary>
    /// Gets or sets the date of next review.
    /// </summary>
    public DateTimeOffset? NextReviewDate { get; set; }

    /// <summary>
    /// Gets or sets the validator's user id.
    /// </summary>
    public Guid? ValidatorUserId { get; set; }

    // ---- Resolved dependencies (system pre-filled, persisted at save-time) ----

    /// <summary>
    /// Gets or sets the JSON-serialized list of AI models the agent uses,
    /// resolved from the flow config at save-time.
    /// </summary>
    public string? AiModelsJson { get; set; }

    /// <summary>
    /// Gets or sets the JSON-serialized list of third-party tools the agent uses,
    /// resolved from the flow config at save-time.
    /// </summary>
    public string? ThirdPartyToolsJson { get; set; }

    /// <summary>
    /// Gets or sets the JSON-serialized skills referenced by the agent.
    /// </summary>
    public string? SkillsJson { get; set; }

    /// <summary>
    /// Gets or sets the JSON-serialized knowledge bases referenced by the agent.
    /// </summary>
    public string? KnowledgeBasesJson { get; set; }

    /// <summary>
    /// Gets or sets the JSON-serialized list of risk register rows.
    /// </summary>
    public string? RisksJson { get; set; }

    /// <summary>
    /// Gets or sets the JSON-serialized approval workflow state.
    /// </summary>
    public string? ApprovalJson { get; set; }

    /// <summary>
    /// Gets or sets the JSON-serialized list of manually recorded issues/violations.
    /// </summary>
    public string? IssuesJson { get; set; }
}
