namespace NodeLibrary.DateTimeNodes;

[DisplayName("Add Time to DateTime"), Description("Adds a specified time value to the given DateTime based on the selected time unit.")]
[NodeMetadata(icon: "/assets/DateTime.svg")]
public class AddToDateTimeNode : BaseNode
{
    [DisplayName("Base DateTime"), Description("The original DateTime value to which the time should be added.")]
    public required InArgument<DateTime> BaseDateTime { get; set; }

    [DisplayName("Value to Add"), Description("The numeric value of time to add to the DateTime.")]
    public required InArgument<int> ValueToAdd { get; set; }

    [DisplayName("Time Unit"), Description("Specifies the unit of time (e.g., Seconds, Minutes, Hours, Days, Months, Years).")]
    public required InArgument<TimeUnitEnum> TimeUnit { get; set; }

    [DisplayName("Updated DateTime"), Description("The resulting DateTime after the specified value has been added.")]
    public OutArgument<DateTime> ResultDateTime { get; set; } = new OutArgument<DateTime>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var baseDateTime = BaseDateTime.Get(context);
            var valueToAdd = ValueToAdd.Get(context);
            var timeUnit = TimeUnit.Get(context);
            var result = baseDateTime;

            switch (timeUnit)
            {
                case TimeUnitEnum.Seconds:
                    result = baseDateTime.AddSeconds(valueToAdd);
                    break;
                case TimeUnitEnum.Minutes:
                    result = baseDateTime.AddMinutes(valueToAdd);
                    break;
                case TimeUnitEnum.Hours:
                    result = baseDateTime.AddHours(valueToAdd);
                    break;
                case TimeUnitEnum.Days:
                    result = baseDateTime.AddDays(valueToAdd);
                    break;
                case TimeUnitEnum.Months:
                    result = baseDateTime.AddMonths(valueToAdd);
                    break;
                case TimeUnitEnum.Years:
                    result = baseDateTime.AddYears(valueToAdd);
                    break;
                default:
                    throw new InvalidOperationException("Unsupported TimeUnit specified.");
            }

            ResultDateTime.Set(context, result);
            status += $" DateTime modified successfully to {result}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error adding time to DateTime: {ex.Message}");
        }
    }

    public enum TimeUnitEnum
    {
        [Display(Name = "Seconds", Description = "Represents time in seconds.")]
        Seconds,

        [Display(Name = "Minutes", Description = "Represents time in minutes.")]
        Minutes,

        [Display(Name = "Hours", Description = "Represents time in hours.")]
        Hours,

        [Display(Name = "Days", Description = "Represents time in days.")]
        Days,

        [Display(Name = "Months", Description = "Represents time in months.")]
        Months,

        [Display(Name = "Years", Description = "Represents time in years.")]
        Years
    }
}
