namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Response DTO for a Super Admin platform-wide notification.
/// </summary>
public class SaNotificationDto
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public required string Message { get; set; }
    public NotificationTypesEnum Type { get; set; }
    public string? ActionUrl { get; set; }
    public NotificationSourceEnum? SourceType { get; set; }
    public DeliveryChannelEnum DeliveryChannel { get; set; }
    public AudienceScopeEnum? AudienceScope { get; set; }
    public NotificationStatusEnum Status { get; set; }
    public DateTimeOffset? ScheduledFor { get; set; }
    public DateTimeOffset? SentOn { get; set; }
    public NotificationRecurrenceEnum? RecurrenceFrequency { get; set; }
    public int? RecurrenceInterval { get; set; }
    public List<int>? RecurrenceWeekdays { get; set; }
    public List<int>? RecurrenceMonthDays { get; set; }
    public DateTimeOffset? RecurrenceEndOn { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset? CreatedOn { get; set; }
    public string? LastModifiedBy { get; set; }
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// The number of recipient users of the notification.
    /// Response-only.
    /// </summary>
    public int RecipientCount { get; set; }

    /// <summary>
    /// The number of targeted tenants of the notification.
    /// Response-only.
    /// </summary>
    public int TenantCount { get; set; }
}
