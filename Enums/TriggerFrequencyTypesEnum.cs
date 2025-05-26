namespace AspNetToolkit.Enums;


public enum TriggerFrequencyTypesEnum
{
    /// <summary>
    /// trigger will runs one time only
    /// </summary>
    [Description("One Time")] OneTime,

    /// <summary>
    /// trigger will runs minute by minute
    /// </summary>
    [Description("Minute By Minute")] MinuteByMinute,

    /// <summary>
    /// trigger will runs hourly
    /// </summary>
    [Description("Hourly")] Hourly,

    /// <summary>
    /// trigger will runs daily
    /// </summary>
    [Description("Daily")] Daily,

    /// <summary>
    /// trigger will runs weekly
    /// </summary>
    [Description("Weekly")] Weekly,

    /// <summary>
    /// trigger will runs monthly (day of month) like 1,2 last day of month
    /// </summary>
    [Description("Monthly (day of month)")] MonthlyDayOfMonth,

    /// <summary>
    /// trigger will runs monthly (day of week) like monday, tuesday
    /// </summary>
    [Description("Monthly (day of week)")] MonthlyDayOfWeek,
}
