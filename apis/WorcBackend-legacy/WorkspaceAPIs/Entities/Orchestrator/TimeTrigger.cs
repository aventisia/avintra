namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a time-based trigger configuration for scheduling tasks.
/// This class allows for scheduling tasks based on specific time intervals, weekdays, 
/// month days, and exceptions, while accounting for time zone differences.
/// </summary>
[Table("worc_TimeTriggers")]
public class TimeTrigger : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the Tenant ID for the time trigger.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the time trigger.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the timezone for the time trigger.
    /// </summary>
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the frequency type for the time trigger (e.g., daily, weekly, etc.).
    /// </summary>
    public required TriggerFrequencyTypesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the interval between triggers (e.g., every N days, hours, etc.). Default is 1.
    /// </summary>
    public int Interval { get; set; } = 1;

    /// <summary>
    /// Gets or sets the specific time of day for the trigger, or null if no specific time is set.
    /// </summary>
    public TimeOnly? AtTime { get; set; }

    /// <summary>
    /// Gets or sets the list of weekdays (1=Monday, ..., 7=Sunday) when the trigger should fire.
    /// </summary>
    public List<int>? Weekdays { get; set; }

    /// <summary>
    /// Gets or sets the list of specific days of the month (1–31) when the trigger should fire.
    /// </summary>
    public List<int>? MonthDays { get; set; }

    /// <summary>
    /// Gets or sets the cron expression that defines a schedule for the time trigger.
    /// The cron expression allows for more complex scheduling patterns, such as running a task 
    /// at specific intervals (e.g., every 5 minutes, or every 1st Monday of the month).
    /// </summary>
    public string CronExpression { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the effective date when the time trigger becomes active.
    /// </summary>
    public required DateTimeOffset EffectiveDate { get; set; }

    /// <summary>
    /// Gets or sets the end date after which the time trigger will no longer be active. Null if no end date is set.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the last time the trigger was executed.
    /// </summary>
    public DateTimeOffset LastTriggeredTime { get; set; }

    /// <summary>
    /// Gets or sets the next scheduled time the trigger will fire.
    /// </summary>
    public DateTimeOffset NextTriggerTime { get; set; }

    /// <summary>
    /// Gets or sets the list of hours (0–23) during which the trigger should be excluded.
    /// </summary>
    public List<int>? ExceptionHours { get; set; }

    /// <summary>
    /// Gets or sets the list of weekdays (1=Monday, ..., 7=Sunday) during which the trigger should be excluded.
    /// </summary>
    public List<int>? ExceptionWeekdays { get; set; }

    /// <summary>
    /// Gets or sets the list of specific dates to be excluded from the trigger schedule.
    /// </summary>
    public List<DateOnly>? ExceptionDates { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the trigger is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the collection of flow versions associated with this time trigger.
    /// </summary>
    public virtual ICollection<TimeTriggersFlowVersion> TimeTriggerFlowVersions { get; set; } = new List<TimeTriggersFlowVersion>();
}