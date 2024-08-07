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
    [Required]
    public required string TicketNumber { get; set; }

    /// <summary>
    /// Gets or sets the subject of the support ticket. Max-255 characters.
    /// </summary>
    [Required]
    [MaxLength(255)]
    public required string Subject { get; set; }

    /// <summary>
    /// Gets or sets the description of the support ticket. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the priority of the support ticket.
    /// </summary>
    [Required]
    public required string Priority { get; set; } = "Low";

    /// <summary>
    /// Gets or sets the status of the support ticket.
    /// </summary>
    [Required]
    public required string Status { get; set; } = "Open";
}