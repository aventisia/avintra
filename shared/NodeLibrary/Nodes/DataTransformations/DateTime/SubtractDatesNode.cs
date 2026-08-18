namespace NodeLibrary.DateTimeNodes;

[DisplayName("Subtract Dates"), Description("Computes the time difference between two DateTime values in the selected unit (Seconds, Minutes, Hours, or Days).")]
[NodeMetadata(icon: "/assets/DateTime.svg")]
public class SubtractDatesNode : BaseNode
{
    [DisplayName("Start DateTime"), Description("The earlier DateTime value to subtract from.")]
    public required InArgument<DateTime> StartDateTime { get; set; }

    [DisplayName("End DateTime"), Description("The later DateTime value to subtract.")]
    public required InArgument<DateTime> EndDateTime { get; set; }

    [DisplayName("Difference Unit"), Description("Specifies the unit in which to return the time difference.")]
    public required InArgument<DateDifferenceUnit> GetDifferenceIn { get; set; } = new InArgument<DateDifferenceUnit>(DateDifferenceUnit.Seconds);

    [DisplayName("Time Difference"), Description("The calculated time difference in the specified unit.")]
    public OutArgument<double> DifferenceValue { get; set; } = new OutArgument<double>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var start = StartDateTime.Get(context);
            var end = EndDateTime.Get(context);
            var unit = GetDifferenceIn.Get(context);

            if (end < start)
                throw new ArgumentException("EndDateTime cannot be earlier than StartDateTime.");

            var diff = end - start;
            double result = unit switch
            {
                DateDifferenceUnit.Seconds => diff.TotalSeconds,
                DateDifferenceUnit.Minutes => diff.TotalMinutes,
                DateDifferenceUnit.Hours => diff.TotalHours,
                DateDifferenceUnit.Days => diff.TotalDays,
                _ => throw new InvalidOperationException("Invalid time unit specified.")
            };

            DifferenceValue.Set(context, result);
            status += $" Difference calculated in {unit}: {result}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error calculating date time difference: {ex.Message}");
        }
    }

    public enum DateDifferenceUnit
    {
        [Display(Name = "Seconds", Description = "Difference between dates in seconds.")]
        Seconds,

        [Display(Name = "Minutes", Description = "Difference between dates in minutes.")]
        Minutes,

        [Display(Name = "Hours", Description = "Difference between dates in hours.")]
        Hours,

        [Display(Name = "Days", Description = "Difference between dates in days.")]
        Days
    }
}
