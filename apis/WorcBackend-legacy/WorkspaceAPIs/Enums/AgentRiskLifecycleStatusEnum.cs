namespace WorkspaceAPIs.Enums;

/// <summary>
/// Lifecycle status of an agent risk registry record.
/// </summary>
public enum AgentRiskLifecycleStatusEnum
{
    NotAssessed,
    InAssessment,
    Submitted,
    InReview,
    Approved,
    ApprovedWithExceptions,
    Monitored,
    ActionRequired,
    Retired,
}
