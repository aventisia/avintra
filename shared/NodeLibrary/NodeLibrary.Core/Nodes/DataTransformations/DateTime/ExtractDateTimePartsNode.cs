namespace NodeLibrary.DateTimeNodes;

[DisplayName("Extract DateTime Parts"), Description("Extracts individual date and time components (year, month, day, hour, weekday, etc.) from a DateTime value.")]
[NodeMetadata(icon: "/assets/DateTime.svg", badge: "Beta")]
public class ExtractDateTimePartsNode : BaseNode
{
    [DisplayName("DateTime Value"), Description("The DateTime value from which to extract components.")]
    public required InArgument<DateTime> DateTimeValue { get; set; }

    [DisplayName("Year"), Description("The four-digit year component.")]
    public OutArgument<int> Year { get; set; } = new OutArgument<int>();

    [DisplayName("Month"), Description("The numeric month component (1-12).")]
    public OutArgument<int> Month { get; set; } = new OutArgument<int>();

    [DisplayName("Day"), Description("The day-of-month component (1-31).")]
    public OutArgument<int> Day { get; set; } = new OutArgument<int>();

    [DisplayName("Hour"), Description("The hour component (0-23).")]
    public OutArgument<int> Hour { get; set; } = new OutArgument<int>();

    [DisplayName("Minute"), Description("The minute component (0-59).")]
    public OutArgument<int> Minute { get; set; } = new OutArgument<int>();

    [DisplayName("Second"), Description("The second component (0-59).")]
    public OutArgument<int> Second { get; set; } = new OutArgument<int>();

    [DisplayName("Weekday"), Description("The name of the day of the week (e.g., Monday).")]
    public OutArgument<string> Weekday { get; set; } = new OutArgument<string>();

    [DisplayName("Day of Year"), Description("The day-of-year component (1-366).")]
    public OutArgument<int> DayOfYear { get; set; } = new OutArgument<int>();

    [DisplayName("Week Number"), Description("The ISO 8601 week number of the year (1-53).")]
    public OutArgument<int> WeekNumber { get; set; } = new OutArgument<int>();

    [DisplayName("Quarter"), Description("The quarter of the year (1-4).")]
    public OutArgument<int> Quarter { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dateTimeValue = DateTimeValue.Get(context);

            Year.Set(context, dateTimeValue.Year);
            Month.Set(context, dateTimeValue.Month);
            Day.Set(context, dateTimeValue.Day);
            Hour.Set(context, dateTimeValue.Hour);
            Minute.Set(context, dateTimeValue.Minute);
            Second.Set(context, dateTimeValue.Second);
            Weekday.Set(context, dateTimeValue.ToString("dddd", CultureInfo.InvariantCulture));
            DayOfYear.Set(context, dateTimeValue.DayOfYear);
            WeekNumber.Set(context, GetIso8601WeekOfYear(dateTimeValue));
            Quarter.Set(context, ((dateTimeValue.Month - 1) / 3) + 1);

            status = $"Successfully extracted date time parts for {dateTimeValue}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting date time parts: {ex.Message}");
        }
    }

    private static int GetIso8601WeekOfYear(DateTime time)
    {
        var day = CultureInfo.InvariantCulture.Calendar.GetDayOfWeek(time);
        if (day is DayOfWeek.Sunday or DayOfWeek.Saturday)
            time = time.AddDays(7 - (int)day);
        var week = CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        return week;
    }
}
