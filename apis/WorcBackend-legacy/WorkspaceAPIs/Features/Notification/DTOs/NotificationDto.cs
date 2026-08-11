namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a notification record.
/// </summary>
public class NotificationDto
{
    /// <summary>
    /// Gets or sets the notification record's primary key.
    /// </summary>
    public Guid Id { get; set; }

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
    /// Gets or sets the action URL associated with the notification. Max 1000 characters.
    /// </summary>
    public string? ActionUrl { get; set; }

    /// <summary>
    /// Gets or sets the source/discriminator of the notification.
    /// </summary>
    public NotificationSourceEnum? SourceType { get; set; }

    /// <summary>
    /// Gets or sets the delivery channel of the notification.
    /// </summary>
    public DeliveryChannelEnum DeliveryChannel { get; set; }

    /// <summary>
    /// Gets or sets the audience scope of the notification.
    /// </summary>
    public AudienceScopeEnum? AudienceScope { get; set; }

    /// <summary>
    /// Gets or sets the lifecycle status of the notification.
    /// </summary>
    public NotificationStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the date and time the notification is scheduled to be sent.
    /// </summary>
    public DateTimeOffset? ScheduledFor { get; set; }

    /// <summary>
    /// Gets or sets the date and time the notification was actually sent.
    /// </summary>
    public DateTimeOffset? SentOn { get; set; }

    /// <summary>
    /// Gets or sets the recurrence frequency of a scheduled notification.
    /// </summary>
    public NotificationRecurrenceEnum? RecurrenceFrequency { get; set; }

    /// <summary>
    /// Gets or sets the recurrence interval (e.g. every N days/weeks/months).
    /// </summary>
    public int? RecurrenceInterval { get; set; }

    /// <summary>
    /// Gets or sets the weekdays on which a weekly notification recurs.
    /// </summary>
    public List<int>? RecurrenceWeekdays { get; set; }

    /// <summary>
    /// Gets or sets the days of the month on which a monthly notification recurs.
    /// </summary>
    public List<int>? RecurrenceMonthDays { get; set; }

    /// <summary>
    /// Gets or sets the date after which a recurring notification stops being sent.
    /// </summary>
    public DateTimeOffset? RecurrenceEndOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the notification.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the notification was created.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the notification.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the notification was last modified.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets the number of recipient users of the notification.
    /// Response-only.
    /// </summary>
    public int RecipientCount { get; set; }
}
