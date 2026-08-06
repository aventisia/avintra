namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Support ticket projection used by list/table endpoints and the create/update/view
/// modal. Carries scalar fields plus counts; the full comment/attachment/history
/// graph is returned by the detail endpoint (<see cref="TicketDto"/>).
/// </summary>
public class TicketTableDto
{
    /// <summary>Unique identifier of the ticket.</summary>
    public Guid Id { get; set; }

    /// <summary>Human-readable ticket number (e.g. "SR-20260806-120000").</summary>
    public string? TicketNumber { get; set; }

    /// <summary>Request type: <see cref="RequestTypeEnum"/>.</summary>
    public required RequestTypeEnum RequestType { get; set; }

    /// <summary>Ticket title. Letters and spaces only. Max length: 255.</summary>
    [StringLength(255)]
    [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Title must not contain numbers or symbols")]
    public required string Title { get; set; }

    /// <summary>Detailed description. Min length: 20. Max length: 500.</summary>
    [StringLength(500, MinimumLength = 20)]
    public required string Description { get; set; }

    /// <summary>When the requester needs this handled by.</summary>
    public DateTimeOffset? RequiredBy { get; set; }

    /// <summary>Current status value matching <see cref="TicketStatusEnum"/>.</summary>
    public TicketStatusEnum? Status { get; set; }

    /// <summary>Reference to the published agent flow, if any.</summary>
    public Guid? AgentRefId { get; set; }

    /// <summary>Cached agent flow name.</summary>
    public string? AgentName { get; set; }

    /// <summary>Change request: summary of the change. Max length: 500.</summary>
    [StringLength(500)]
    public string? ChangeSummary { get; set; }

    /// <summary>Change request: reason for the change. Max length: 500.</summary>
    [StringLength(500)]
    public string? ChangeReason { get; set; }

    /// <summary>Change request: expected behavior after the change. Max length: 500.</summary>
    [StringLength(500)]
    public string? ExpectedBehavior { get; set; }

    /// <summary>Change request: requested timeline.</summary>
    public DateTimeOffset? RequestedTimeline { get; set; }

    /// <summary>Complexity value matching <see cref="ComplexityEnum"/>.</summary>
    public ComplexityEnum? Complexity { get; set; }

    /// <summary>Estimated effort in hours.</summary>
    public int? EstimatedEffortHours { get; set; }

    /// <summary>Estimated completion date.</summary>
    public DateTimeOffset? EstimatedCompletionDate { get; set; }

    /// <summary>True when the change is billable.</summary>
    public bool? IsBillable { get; set; }

    /// <summary>True when customer approval is required.</summary>
    public bool? RequiresCustomerApproval { get; set; }

    /// <summary>Risk level value matching <see cref="RiskLevelEnum"/>.</summary>
    public RiskLevelEnum? RiskLevel { get; set; }

    /// <summary>Dependencies. Max length: 500.</summary>
    [StringLength(500)]
    public string? Dependencies { get; set; }

    /// <summary>Triage remarks. Max length: 1000.</summary>
    [StringLength(1000)]
    public string? TriageRemarks { get; set; }

    /// <summary>Number of comments on the ticket.</summary>
    public int? CommentCount { get; set; }

    /// <summary>Number of attachments on the ticket.</summary>
    public int? AttachmentCount { get; set; }

    /// <summary>Number of history entries on the ticket.</summary>
    public int? HistoryCount { get; set; }

    /// <summary>True when the ticket is disabled.</summary>
    public bool? IsDisabled { get; set; }

    /// <summary>Full name of the ticket creator.</summary>
    public string? CreatedBy { get; set; }

    /// <summary>When the ticket was created.</summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>Full name of the last user to modify the ticket.</summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>When the ticket was last modified.</summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
