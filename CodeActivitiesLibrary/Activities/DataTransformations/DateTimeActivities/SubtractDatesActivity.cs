using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Subtract Dates")]
    [Description(
        "Computes the time difference between two DateTime values in the selected unit (Seconds, Minutes, Hours, or Days).")]
    public class SubtractDatesActivity : BaseCodeActivity
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
            var start = StartDateTime.Get(context);
            var end = EndDateTime.Get(context);
            var unit = GetDifferenceIn.Get(context);
            if (end < start)
            {
                throw new ArgumentException("EndDateTime cannot be earlier than StartDateTime.");
            }

            var diff = end - start;
            string status;
            double result = 0;
            try
            {
                switch (unit)
                {
                    case DateDifferenceUnit.Seconds:
                        result = diff.TotalSeconds;
                        status = "Difference calculated in seconds.";
                        break;
                    case DateDifferenceUnit.Minutes:
                        result = diff.TotalMinutes;
                        status = "Difference calculated in minutes.";
                        break;
                    case DateDifferenceUnit.Hours:
                        result = diff.TotalHours;
                        status = "Difference calculated in hours.";
                        break;
                    case DateDifferenceUnit.Days:
                        result = diff.TotalDays;
                        status = "Difference calculated in days.";
                        break;
                    default:
                        status = "Unable to calculate the difference.";
                        throw new InvalidOperationException("Invalid time unit specified.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error subtracting date: {ex.Message}";
            }

            DifferenceValue.Set(context, result);
            StatusMessage.Set(context, status);
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
}