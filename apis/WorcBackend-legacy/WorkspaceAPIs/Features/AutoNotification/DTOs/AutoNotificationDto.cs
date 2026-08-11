namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for an auto notification.
/// </summary>
public class AutoNotificationDto
{
    /// <summary>
    /// Gets or sets the reference ID of the record associated with the notification.
    /// </summary>
    [RequiredGuid]
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets the title of the notification. Max-200.
    /// </summary>
    [StringLength(200)]
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the message of the notification. Max-500.
    /// </summary>
    [StringLength(500)]
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the type of the notification.
    /// Possible values: Information, Warning, Alert, Reminder.
    /// </summary>
    public required NotificationTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the action URL associated with the notification. Max-1000.
    /// </summary>
    [StringLength(1000)]
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Gets or sets the source/discriminator of the notification
    /// (NewTicket, TicketUpdate, TicketComment, AgentPublished, LowCredit, SubscriptionRenewal).
    /// </summary>
    public NotificationSourceEnum? SourceType { get; set; }

    /// <summary>
    /// Gets or sets the list of user IDs to whom this notification is targeted.
    /// </summary>
    [MinLength(1)]
    public required List<Guid> UserIdList { get; set; }
}