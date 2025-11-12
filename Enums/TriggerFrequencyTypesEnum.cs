namespace AspNetToolkit.Enums;

public enum TriggerFrequencyTypesEnum
{
    /// <summary>
    /// Trigger runs every minute.
    /// </summary>
    [Description("Minute By Minute")]
    MinuteByMinute,

    /// <summary>
    /// Trigger runs on an hourly basis.
    /// </summary>
    [Description("Hourly")]
    Hourly,

    /// <summary>
    /// Trigger runs daily at a specific time.
    /// </summary>
    [Description("Daily")]
    Daily,

    /// <summary>
    /// Trigger runs on a weekly basis.
    /// </summary>
    [Description("Weekly")]
    Weekly,

    /// <summary>
    /// Trigger runs monthly, based on a specific day of the month (e.g., 1st, 2nd, last day, etc.).
    /// </summary>
    [Description("Monthly (Day of Month)")]
    MonthlyDayOfMonth,

    /// <summary>
    /// Trigger runs monthly, based on a specific day of the week (e.g., 1st Monday, last Friday, etc.).
    /// </summary>
    [Description("Monthly (Day of Week)")]
    MonthlyDayOfWeek,
}
