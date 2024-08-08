namespace WorkspaceAPIs.Entities;
/// <summary>
/// Entity to store data related to support tickets raised by users.
/// </summary>
[Table("SupportTicket")]
public class SupportTicket : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ticket number of the support ticket.
    /// </summary>
    public required string TicketNumber { get; set; }

    /// <summary>
    /// Gets or sets the subject of the support ticket. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Subject { get; set; }

    /// <summary>
    /// Gets or sets the description of the support ticket. Min-100, Max-500 characters.
    /// </summary>
    [MinLength(100)]
    [MaxLength(500)]
    public required string Description { get; set; }

    /// <summary>
    /// Gets or sets the priority of the support ticket.
    /// </summary>
    public string? Priority { get; set; } = "Low";

    /// <summary>
    /// Gets or sets the status of the support ticket.
    /// </summary>
    public string? Status { get; set; } = "Open";

    /// <summary>
    /// Gets or sets support ticket remarks to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<SupportTicketRemark>? SupportTicketRemarks { get; set; }
}