namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a Queue User, linking a user to a specific Queue in the context of a tenant.
/// </summary>
[Table("worc_QueueUsers")]
public class QueueUser : BaseEntity
{
    /// <summary>
    /// Gets or sets the tenant ID associated with this queue user.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the access type for the user on the queue (e.g., FullAccess, View, Create, etc.).
    /// </summary>
    public QueueWorkItemAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the queue this user is associated with.
    /// </summary>
    [ForeignKey("QueueId")]
    public virtual Queue? Queue { get; set; }

    /// <summary>
    /// Gets or sets the ID of the queue this user is associated with.
    /// </summary>
    public required Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the workspace user associated with this queue user.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user associated with this queue user.
    /// </summary>
    public required Guid UserId { get; set; }
}