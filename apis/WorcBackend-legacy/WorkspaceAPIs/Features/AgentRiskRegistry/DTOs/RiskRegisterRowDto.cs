using WorkspaceAPIs.Enums;

namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A row in the agent risk register — a specific risk and its mitigation.
/// </summary>
public class RiskRegisterRowDto
{
    /// <summary>
    /// Short risk name.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Risk category.
    /// </summary>
    public RiskCategoryEnum Category { get; set; }

    /// <summary>
    /// Likelihood of occurrence.
    /// </summary>
    public RiskLikelihoodEnum Likelihood { get; set; }

    /// <summary>
    /// Impact if it occurs.
    /// </summary>
    public RiskImpactEnum Impact { get; set; }

    /// <summary>
    /// Computed severity (derived from likelihood x impact).
    /// </summary>
    public RiskSeverityEnum Severity { get; set; }

    /// <summary>
    /// The mitigation plan.
    /// </summary>
    public string? MitigationPlan { get; set; }

    /// <summary>
    /// Owner responsible for the mitigation.
    /// </summary>
    public string? Owner { get; set; }

    /// <summary>
    /// Status of the mitigation.
    /// </summary>
    public string? Status { get; set; }
}
