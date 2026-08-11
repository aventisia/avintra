namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a single notification history row for the current user.
/// </summary>
public class NotificationHistoryDto
{
    /// <summary>
    /// Gets or sets the notification user record's primary key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the notification record's primary key.
    /// </summary>
    public Guid NotificationId { get; set; }

    /// <summary>
    /// Gets or sets the title of the notification. Max 200 characters.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the message of the notification. Max 500 characters.
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the type of the notification.
    /// </summary>
    public NotificationTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the source/discriminator of the notification.
    /// </summary>
    public NotificationSourceEnum? SourceType { get; set; }

    /// <summary>
    /// Gets or sets the action URL associated with the notification. Max 1000 characters.
    /// </summary>
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the notification has been read by the current user.
    /// </summary>
    public bool IsRead { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the notification was marked as read.
    /// </summary>
    public DateTimeOffset? ReadOn { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the notification was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }
}
