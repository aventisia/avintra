namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the data structure for an unread notification.
/// </summary>
/// <remarks>
/// Note: UserAvatar details could be null if notification was not created by user's action.
/// If null then check notification type to show relevant icon for the notification.
/// </remarks>
public class UnreadNotificationDto : UserAvatarBaseDto
{
    /// <summary>
    /// Gets or sets the notification primary key. A unique identifier for each notification.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the title of the notification.
    /// </summary>
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the notification message. The main content of the notification.
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the date and time the notification was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the type of notification (e.g., info, warning, alert, reminder).
    /// </summary>
    public NotificationTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the optional URL linking to a specific page or action related to the notification.
    /// </summary>
    public string? ActionUrl { get; set; }
}