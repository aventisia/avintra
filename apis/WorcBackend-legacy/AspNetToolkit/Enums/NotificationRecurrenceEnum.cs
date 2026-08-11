namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the recurrence frequency of a scheduled notification. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum NotificationRecurrenceEnum
{
    /// <summary>
    /// Represents a one-time notification (no recurrence).
    /// </summary>
    None,

    /// <summary>
    /// Represents a notification that recurs daily.
    /// </summary>
    Daily,

    /// <summary>
    /// Represents a notification that recurs weekly on selected weekdays.
    /// </summary>
    Weekly,

    /// <summary>
    /// Represents a notification that recurs monthly on selected days of the month.
    /// </summary>
    Monthly
}
