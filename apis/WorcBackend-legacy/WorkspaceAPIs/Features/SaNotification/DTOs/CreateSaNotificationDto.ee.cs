namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Request payload used by a Super Admin to create or update a platform-wide notification.
/// The Super Admin may target all users, selected users, or all users of selected tenants.
/// </summary>
public class CreateSaNotificationDto
{
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
    [RegularExpression("^[a-zA-Z\\s]*$", ErrorMessage = "Title can only contain alphabetic characters.")]
    public string? Title { get; set; }

    [Required(ErrorMessage = "Message is required.")]
    [StringLength(500, ErrorMessage = "Message cannot exceed 500 characters.")]
    [MinLength(1, ErrorMessage = "Message cannot be empty.")]
    public required string Message { get; set; }

    [Required(ErrorMessage = "Notification type is required.")]
    [EnumDataType(typeof(NotificationTypesEnum), ErrorMessage = "Invalid notification type.")]
    public required NotificationTypesEnum Type { get; set; }

    [StringLength(1000)]
    public string? ActionUrl { get; set; }

    [Required(ErrorMessage = "Delivery channel is required.")]
    [EnumDataType(typeof(DeliveryChannelEnum), ErrorMessage = "Invalid delivery channel.")]
    public DeliveryChannelEnum DeliveryChannel { get; set; } = DeliveryChannelEnum.Platform;

    [Required(ErrorMessage = "Audience scope is required.")]
    [EnumDataType(typeof(AudienceScopeEnum), ErrorMessage = "Invalid audience scope.")]
    public AudienceScopeEnum AudienceScope { get; set; } = AudienceScopeEnum.AllUsers;

    public List<Guid>? TargetUserIds { get; set; }
    public List<Guid>? TargetTenantIds { get; set; }

    /// <summary>
    /// Gets or sets the list of role names to target. When provided, recipients are resolved to users holding these roles.
    /// </summary>
    public List<string>? RoleIds { get; set; }

    /// <summary>
    /// Gets or sets the scheduled send date and time. If null, the notification is sent immediately.
    /// </summary>
    public DateTimeOffset? ScheduledFor { get; set; }

    /// <summary>
    /// Gets or sets the recurrence frequency of a scheduled notification (None, Daily, Weekly, Monthly).
    /// </summary>
    public NotificationRecurrenceEnum? RecurrenceFrequency { get; set; }

    /// <summary>
    /// Gets or sets the recurrence interval (e.g. every N days/weeks/months).
    /// </summary>
    public int? RecurrenceInterval { get; set; }

    /// <summary>
    /// Gets or sets the weekdays on which a weekly notification recurs (e.g. [1,3,5]).
    /// </summary>
    public List<int>? RecurrenceWeekdays { get; set; }

    /// <summary>
    /// Gets or sets the days of the month on which a monthly notification recurs (e.g. [1,15]).
    /// </summary>
    public List<int>? RecurrenceMonthDays { get; set; }

    /// <summary>
    /// Gets or sets the date after which a recurring notification stops being sent.
    /// </summary>
    public DateTimeOffset? RecurrenceEndOn { get; set; }
}
