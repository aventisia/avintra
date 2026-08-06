namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Payload for updating the status of a ticket.
/// </summary>
public class TicketStatusUpdateDto
{
    /// <summary>The ticket to update.</summary>
    [RequiredGuid]
    public Guid TicketId { get; set; }

    /// <summary>New status value matching <see cref="TicketStatusEnum"/>.</summary>
    public required TicketStatusEnum Status { get; set; }
}
