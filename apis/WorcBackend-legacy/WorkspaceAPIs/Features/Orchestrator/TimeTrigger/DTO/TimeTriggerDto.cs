namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for a time trigger configuration.
/// This DTO is used to transfer time trigger details between layers of the application.
/// </summary>
public class TimeTriggerDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the time trigger.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the time trigger.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the time zone for the time trigger.
    /// </summary>
    public required string Timezone { get; set; }

    /// <summary>
    /// Gets or sets the frequency type for the time trigger (e.g., daily, weekly).
    /// </summary>
    public required TriggerFrequencyTypesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the interval between trigger executions (e.g., every N days, hours, etc.). Default is 1.
    /// </summary>
    public int Interval { get; set; } = 1;

    /// <summary>
    /// Gets or sets the specific time of day when the trigger should fire, or null if no specific time is set.
    /// </summary>
    public TimeOnly? AtTime { get; set; }

    /// <summary>
    /// Gets or sets the list of weekdays (1=Monday, ..., 7=Sunday) on which the trigger should activate.
    /// </summary>
    public List<int>? Weekdays { get; set; }

    /// <summary>
    /// Gets or sets the list of specific days of the month (1-31) on which the trigger should activate.
    /// </summary>
    public List<int>? MonthDays { get; set; }

    /// <summary>
    /// Gets or sets the cron expression that defines a schedule for the time trigger.
    /// The cron expression allows for more complex scheduling patterns, such as running a task 
    /// at specific intervals (e.g., every 5 minutes, or every 1st Monday of the month).
    /// </summary>
    public string CronExpression { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date and time when the time trigger becomes active.
    /// </summary>
    public required DateTimeOffset EffectiveDate { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the time trigger will stop being active. Null if there is no end date.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the last time the time trigger was activated.
    /// </summary>
    public DateTimeOffset LastTriggeredTime { get; set; }

    /// <summary>
    /// Gets or sets the next scheduled activation time for the time trigger.
    /// </summary>
    public DateTimeOffset NextTriggerTime { get; set; }

    /// <summary>
    /// Gets or sets the list of hours (0-23) during which the time trigger should not fire.
    /// </summary>
    public List<int>? ExceptionHours { get; set; }

    /// <summary>
    /// Gets or sets the list of weekdays (1=Monday, ..., 7=Sunday) when the time trigger should be excluded.
    /// </summary>
    public List<int>? ExceptionWeekdays { get; set; }

    /// <summary>
    /// Gets or sets the list of specific dates when the time trigger should be excluded.
    /// </summary>
    public List<DateOnly>? ExceptionDates { get; set; }

    /// <summary>
    /// Gets or sets the collection of agents associated with the email trigger, including their identifiers, names, and versions.
    /// </summary>
    public List<AgentInfoDto>? Agents { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the time trigger is disabled.
    /// </summary>
    /// <remarks>
    /// Note: The flag is nullable to distinguish between true, false, and null values.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the time trigger record.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the time trigger record was created.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the time trigger record.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the time trigger record was last modified.
    /// This property is for responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}