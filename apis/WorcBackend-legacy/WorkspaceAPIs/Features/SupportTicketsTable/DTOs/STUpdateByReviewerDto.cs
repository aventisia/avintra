namespace WorkspaceAPIs.DTOs;
/// <summary>
/// Represents a data transfer object (DTO) for a support ticket status update by a reviewer.
/// </summary>
public class STUpdateByReviewerDto
{
    /// <summary>
    /// Gets or sets the SupportTicket record's primary key
    /// </summary>
    public Guid TicketId { get; set; }

    /// <summary>
    /// Gets or sets the ticket number associated with support ticket
    /// </summary>
    public string? TicketNumber { get; set; }

    /// <summary>
    /// Gets or sets the current status of the ticket (e.g., open, inProgress, resolved, closed).
    /// </summary>
    public required string Status { get; set; }
}