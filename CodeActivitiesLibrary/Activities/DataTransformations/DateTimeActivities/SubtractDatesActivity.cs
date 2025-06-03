using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{

    [DisplayName("Substract Dates")]
    [Description("Computes the time difference between two DateTime values in the selected unit (Seconds, Minutes, Hours, or Days).")]
    public class SubtractDatesActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Start DateTime")]
        [Description("The earlier DateTime value to subtract from.")]
        public InArgument<DateTime> StartDateTime { get; set; }

        [RequiredArgument]
        [DisplayName("End DateTime")]
        [Description("The later DateTime value to subtract.")]
        public InArgument<DateTime> EndDateTime { get; set; }

        [RequiredArgument]
        [DisplayName("Difference Unit")]
        [Description("Specifies the unit in which to return the time difference.")]
        [DefaultValue(DateDifferenceUnit.Days)]
        public InArgument<DateDifferenceUnit> GetDifferenceIn { get; set; }


        [DisplayName("Time Difference")]
        [Description("The calculated time difference in the specified unit.")]
        public OutArgument<double> DifferenceValue { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            DateTime start = StartDateTime.Get(context);
            DateTime end = EndDateTime.Get(context);
            DateDifferenceUnit unit = GetDifferenceIn.Get(context);

            TimeSpan diff = end - start;
            double result = 0;

            switch (unit)
            {
                case DateDifferenceUnit.Seconds:
                    result = diff.TotalSeconds;
                    break;
                case DateDifferenceUnit.Minutes:
                    result = diff.TotalMinutes;
                    break;
                case DateDifferenceUnit.Hours:
                    result = diff.TotalHours;
                    break;
                case DateDifferenceUnit.Days:
                    result = diff.TotalDays;
                    break;
                default:
                    throw new InvalidOperationException("Invalid time unit specified.");
            }

            DifferenceValue.Set(context, result);
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
