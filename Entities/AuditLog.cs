namespace AccountsAPIs.Entities;
public class AuditLog
{
    /// <summary>
    /// Gets or sets the primary key of the Audit log record.
    /// </summary>
    [Key]
    public Guid Id { get; set;}

    /// <summary>
    /// Gets or sets the primary key of the user record associated with the session.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the audit log entity name.
    /// </summary>
    public string? EntityName { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the user record associated with the Id.
    /// </summary>
    public Guid EntityId { get; set; }

    /// <summary>
    /// Gets or sets the audit log action.
    /// </summary>
    public string? Action { get; set; }

    /// <summary>
    /// Gets or sets the audit log changes.
    /// </summary>
    public string? Changes { get; set; }

    /// <summary>
    /// Gets or sets the datetime.
    /// </summary>
    public DateTime Timestamp { get; set; }
}