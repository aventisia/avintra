namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an entity that holds data related to a queue.
/// </summary>
[Table("Queues")]
public class Queue : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, used for global filtering in a multi-tenant architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue.
    /// </summary>
    [MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between queue transactions and queues.
    /// </summary>
    public virtual ICollection<QueueTransaction>? QueueTransactions { get; set; }
}