namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents the M2M relationship between users and notifications.
/// </summary>
[Table("support_NotificationUsers")]
public class NotificationUser : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the user notification in Guid (globally unique identifier) format.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the tenant for multi-tenancy architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user associated with the notification.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user associated with the notification.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the notification.
    /// </summary>
    public Guid NotificationId { get; set; }

    /// <summary>
    /// Gets or sets the notification.
    /// </summary>
    [ForeignKey("NotificationId")]
    public virtual Notification? Notification { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the notification has been read.
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the notification was marked as read.
    /// </summary>
    public DateTimeOffset? ReadOn { get; set; }

    /// <summary>
    /// Gets or sets the version number used for row versioning. Row versioning helps detect conflicts between concurrent transactions.
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}