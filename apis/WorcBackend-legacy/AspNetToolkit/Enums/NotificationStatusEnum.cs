namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the lifecycle status of a Notification. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum NotificationStatusEnum
{
    /// <summary>
    /// Represents a notification that has been drafted but not yet sent.
    /// </summary>
    Draft,

    /// <summary>
    /// Represents a notification that has been scheduled to be sent at a future date/time.
    /// Scheduled notifications are editable and deletable until they are sent.
    /// </summary>
    Scheduled,

    /// <summary>
    /// Represents a notification that has been sent. Sent notifications are immutable.
    /// </summary>
    Sent,

    /// <summary>
    /// Represents a notification whose sending failed.
    /// </summary>
    Failed
}
