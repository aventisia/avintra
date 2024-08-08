namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a support ticket.
/// </summary>
public class SupportTicketsTableDto
{
    /// <summary>
    /// Gets or sets the SupportTicket record's primary key
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ticket number associated with support ticket
    /// </summary>
    public string? TicketNumber { get; set; }

    /// <summary>
    /// Gets or sets the Brief summary of the issue related to the ticket. Max-255
    /// </summary>
    [Required]
    [StringLength(255)]
    public required string Subject { get; set; }

    /// <summary>
    /// Gets or sets the description of the support ticket. Max-500
    /// </summary>
    [Required]
    [StringLength(500, MinimumLength = 100)]
    public required string Description { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the ticket (e.g., low, medium, high, critical).
    /// </summary>
    public string? Priority { get; set; }

    /// <summary>
    /// Gets or sets the current status of the ticket (e.g., open, inProgress, resolved, closed).
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Gets or sets the number of remarks associated with the support ticket.
    /// </summary>
    public int? RemarkCount { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the supportTicket record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the supportTicket record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the supportTicket record was created.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the supportTicket record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the supportTicket record was last modified.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}