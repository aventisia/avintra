namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A single exception recorded against an approval.
/// </summary>
public class ApprovalExceptionDto
{
    /// <summary>
    /// Short title of the exception.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Remediation deadline.
    /// </summary>
    public string? RemediationDeadline { get; set; }
}

/// <summary>
/// Approval workflow state for an agent risk registry record.
/// The submitter selects an approver by name.
/// </summary>
public class ApprovalStateDto
{
    /// <summary>
    /// Whether an approval has been submitted.
    /// </summary>
    public bool IsSubmitted { get; set; }

    /// <summary>
    /// The selected approver's user id.
    /// </summary>
    public string? RequestedToUserId { get; set; }

    /// <summary>
    /// The selected approver's display name.
    /// </summary>
    public string? RequestedToName { get; set; }

    /// <summary>
    /// When the approval was submitted.
    /// </summary>
    public string? RequestedOn { get; set; }

    /// <summary>
    /// Current decision: pending / approved / rejected / returned.
    /// </summary>
    public string? Decision { get; set; }

    /// <summary>
    /// Who made the decision (display name).
    /// </summary>
    public string? DecidedBy { get; set; }

    /// <summary>
    /// When the decision was made.
    /// </summary>
    public string? DecidedOn { get; set; }

    /// <summary>
    /// Notes accompanying the decision.
    /// </summary>
    public string? DecisionNotes { get; set; }

    /// <summary>
    /// Exceptions allowed with the approval.
    /// </summary>
    public List<ApprovalExceptionDto> Exceptions { get; set; } = new();
}
