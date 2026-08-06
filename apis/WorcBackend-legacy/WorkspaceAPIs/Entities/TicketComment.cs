namespace WorkspaceAPIs.Entities;

/// <summary>
/// Entity to store individual comments within a support ticket conversation.
/// </summary>
[Table("ws_TicketComment")]
public class TicketComment : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ID of the tenant associated with the ticket comment.
    /// </summary>
    [RequiredGuid]
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the comment text. Max length: 500.
    /// </summary>
    [MaxLength(500)]
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the comment has been edited.
    /// </summary>
    public bool IsEdited { get; set; } = false;

    /// <summary>
    /// Gets or sets the ID of the ticket the comment belongs to.
    /// </summary>
    [RequiredGuid]
    public required Guid TicketId { get; set; }

    /// <summary>
    /// Gets or sets the ticket associated with this comment.
    /// </summary>
    [ForeignKey("TicketId")]
    public virtual Ticket? Ticket { get; set; }
}
