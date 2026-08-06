namespace WorkspaceAPIs.Entities;

/// <summary>
/// Entity to store a support ticket (service or change request).
/// </summary>
[Table("ws_Ticket")]
public class Ticket : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ID of the tenant associated with the ticket.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the human-readable ticket number (e.g. "SR-20260806-120000"). Max length: 20.
    /// </summary>
    [MaxLength(20)]
    public required string TicketNumber { get; set; }

    /// <summary>
    /// Gets or sets the request type of the ticket (service or change request).
    /// </summary>
    public RequestTypeEnum RequestType { get; set; }

    /// <summary>
    /// Gets or sets the ticket title. Max length: 255.
    /// </summary>
    [MaxLength(255)]
    public required string Title { get; set; }

    /// <summary>
    /// Gets or sets the detailed description of the ticket. Min length: 20. Max length: 500.
    /// </summary>
    [MinLength(20)]
    [MaxLength(500)]
    public required string Description { get; set; }

    /// <summary>
    /// Gets or sets the date by which the requester needs this handled.
    /// </summary>
    public DateTimeOffset? RequiredBy { get; set; }

    /// <summary>
    /// Gets or sets the current status of the ticket.
    /// </summary>
    public TicketStatusEnum Status { get; set; } = TicketStatusEnum.New;

    /// <summary>
    /// Gets or sets the reference to the published agent flow, if any.
    /// </summary>
    public Guid? AgentRefId { get; set; }

    /// <summary>
    /// Gets or sets the cached agent flow name. Max length: 255.
    /// </summary>
    [MaxLength(255)]
    public string? AgentName { get; set; }

    /// <summary>
    /// Gets or sets the change request summary of the change. Max length: 500.
    /// </summary>
    [MaxLength(500)]
    public string? ChangeSummary { get; set; }

    /// <summary>
    /// Gets or sets the change request reason for the change. Max length: 500.
    /// </summary>
    [MaxLength(500)]
    public string? ChangeReason { get; set; }

    /// <summary>
    /// Gets or sets the change request expected behavior after the change. Max length: 500.
    /// </summary>
    [MaxLength(500)]
    public string? ExpectedBehavior { get; set; }

    /// <summary>
    /// Gets or sets the change request requested timeline.
    /// </summary>
    public DateTimeOffset? RequestedTimeline { get; set; }

    /// <summary>
    /// Gets or sets the complexity of the ticket.
    /// </summary>
    public ComplexityEnum? Complexity { get; set; }

    /// <summary>
    /// Gets or sets the estimated effort in hours.
    /// </summary>
    public int? EstimatedEffortHours { get; set; }

    /// <summary>
    /// Gets or sets the estimated completion date.
    /// </summary>
    public DateTimeOffset? EstimatedCompletionDate { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the change is billable.
    /// </summary>
    public bool? IsBillable { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether customer approval is required.
    /// </summary>
    public bool? RequiresCustomerApproval { get; set; }

    /// <summary>
    /// Gets or sets the risk level of the ticket.
    /// </summary>
    public RiskLevelEnum? RiskLevel { get; set; }

    /// <summary>
    /// Gets or sets the dependencies of the ticket. Max length: 500.
    /// </summary>
    [MaxLength(500)]
    public string? Dependencies { get; set; }

    /// <summary>
    /// Gets or sets the triage remarks of the ticket. Max length: 1000.
    /// </summary>
    [MaxLength(1000)]
    public string? TriageRemarks { get; set; }

    /// <summary>
    /// Gets or sets the comments on the ticket.
    /// </summary>
    public virtual ICollection<TicketComment>? Comments { get; set; }

    /// <summary>
    /// Gets or sets the attachments on the ticket.
    /// </summary>
    public virtual ICollection<TicketAttachment>? Attachments { get; set; }

    /// <summary>
    /// Gets or sets the audit history of the ticket.
    /// </summary>
    public virtual ICollection<TicketHistory>? History { get; set; }
}
