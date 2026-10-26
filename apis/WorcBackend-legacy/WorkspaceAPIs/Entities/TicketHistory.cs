namespace WorkspaceAPIs.Entities;

/// <summary>
/// Entity to store the audit history of a support ticket.
/// </summary>
[Table("support_TicketHistory")]
public class TicketHistory : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the TicketHistory record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the tenant associated with the ticket history.
    /// </summary>
    [RequiredGuid]
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the action performed (e.g. "Created", "Updated", "StatusChanged"). Max length: 50.
    /// </summary>
    [MaxLength(50)]
    public required string Action { get; set; }

    /// <summary>
    /// Gets or sets the field that changed, when relevant. Max length: 100.
    /// </summary>
    [MaxLength(100)]
    public string? FieldName { get; set; }

    /// <summary>
    /// Gets or sets the previous value of the changed field.
    /// </summary>
    public string? OldValue { get; set; }

    /// <summary>
    /// Gets or sets the new value of the changed field.
    /// </summary>
    public string? NewValue { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who performed the change.
    /// </summary>
    [RequiredGuid]
    public Guid ChangedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who performed the change. Max length: 255.
    /// </summary>
    [MaxLength(255)]
    public string? ChangedByName { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the change happened.
    /// </summary>
    public DateTimeOffset ChangedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the ticket the history entry belongs to.
    /// </summary>
    [RequiredGuid]
    public required Guid TicketId { get; set; }

    /// <summary>
    /// Gets or sets the ticket associated with this history entry.
    /// </summary>
    [ForeignKey("TicketId")]
    public virtual Ticket? Ticket { get; set; }
}
