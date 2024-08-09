namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a support ticket remark.
/// </summary>
public class SupportTicketRemarksDto
{
    /// <summary>
    /// Gets or sets the SupportTicketRemark record's primary key
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the Foreign key referencing the associated support ticket.
    /// Links the response to the ticket.
    /// </summary>
    [RequiredGuid]
    public Guid SupportTicketId { get; set; }

    /// <summary>
    /// Gets or sets the SupportTicket number associated support ticket remark (optional).
    /// </summary>
    public string? TicketNumber { get; set; }

    /// <summary>
    /// Gets or sets the content of the message (text) within the conversation.
    /// </summary>
    [StringLength(500, MinimumLength = 1)]
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the user's full name who posted the remark.
    /// </summary>
    public string? UserFullName { get; set; }

    /// <summary>
    /// Gets or sets the username (A unique identifier) of the user who posted the remark.
    /// </summary>
    public string? UserName { get; set; }

    /// <summary>
    /// Gets or sets the user's avatar image URL (if available) of the user who posted the remark.
    /// </summary>
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Gets or sets the user's initials of the user who posted the remark.
    /// </summary>
    public string? Initials { get; set; }

    /// <summary>
    /// Gets or sets when the remark was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the remark has been edited.
    /// </summary>
    public bool? IsEdited { get; set; }
}