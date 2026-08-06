namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Audit history entry returned with a ticket.
/// </summary>
public class TicketHistoryDto
{
    /// <summary>Unique identifier of the history entry.</summary>
    public Guid Id { get; set; }

    /// <summary>Action performed (e.g. "Created", "Updated", "StatusChanged"). Max length: 50.</summary>
    [StringLength(50)]
    public required string Action { get; set; }

    /// <summary>Field that changed, when relevant. Max length: 100.</summary>
    [StringLength(100)]
    public string? FieldName { get; set; }

    /// <summary>Previous value.</summary>
    public string? OldValue { get; set; }

    /// <summary>New value.</summary>
    public string? NewValue { get; set; }

    /// <summary>The user who performed the change.</summary>
    [RequiredGuid]
    public Guid ChangedByUserId { get; set; }

    /// <summary>Full name of the user who performed the change. Max length: 255.</summary>
    [StringLength(255)]
    public string? ChangedByName { get; set; }

    /// <summary>When the change happened.</summary>
    public DateTimeOffset ChangedOn { get; set; }
}
