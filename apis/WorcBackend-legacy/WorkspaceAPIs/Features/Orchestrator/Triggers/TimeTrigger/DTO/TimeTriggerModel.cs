namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents scheduling configuration for a time-based trigger.
/// Defines when and how often a trigger should execute, including frequency rules,
/// constraints, and exception conditions.
/// </summary>
public class TimeTriggerModel
{
    /// <summary>
    /// Gets or sets the frequency of the trigger execution (e.g., daily, weekly).
    /// </summary>
    public required TriggerFrequencyTypesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the interval between executions. Default is 1.
    /// </summary>
    public int Interval { get; set; } = 1;

    /// <summary>
    /// Gets or sets the specific time of day when the trigger should run.
    /// If null, execution time is determined by the system or frequency rules.
    /// </summary>
    public TimeOnly? AtTime { get; set; }

    /// <summary>
    /// Gets or sets the weekdays on which the trigger is active (1 = Monday, 7 = Sunday).
    /// </summary>
    public List<int>? Weekdays { get; set; }

    /// <summary>
    /// Gets or sets the days of the month on which the trigger is active (1–31).
    /// </summary>
    public List<int>? MonthDays { get; set; }

    /// <summary>
    /// Gets or sets a cron expression defining a custom execution schedule.
    /// Use this for advanced scheduling scenarios not covered by basic frequency settings.
    /// </summary>
    public string CronExpression { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date and time when the trigger becomes active.
    /// </summary>
    public required DateTimeOffset EffectiveDate { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the trigger stops being active.
    /// If null, the trigger remains active indefinitely.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the last time the trigger was executed.
    /// </summary>
    public DateTimeOffset LastTriggeredTime { get; set; }

    /// <summary>
    /// Gets or sets the next scheduled execution time of the trigger.
    /// </summary>
    public DateTimeOffset NextTriggerTime { get; set; }

    /// <summary>
    /// Gets or sets the hours of the day (0–23) during which the trigger must not run.
    /// </summary>
    public List<int>? ExceptionHours { get; set; }

    /// <summary>
    /// Gets or sets the weekdays (1 = Monday, 7 = Sunday) when the trigger is excluded.
    /// </summary>
    public List<int>? ExceptionWeekdays { get; set; }

    /// <summary>
    /// Gets or sets specific calendar dates when the trigger should not run.
    /// </summary>
    public List<DateOnly>? ExceptionDates { get; set; }
}