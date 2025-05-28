using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Subtract Dates"),
     Description("Finds the time difference between two dates in days, hours, minutes, or seconds.")]
    public class SubtractDatesActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Start Date"),
         Description("The start date of the subtraction.")]
        public InArgument<DateTime> StartDate { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("End Date"), Description("The end date of the subtraction.")]
        public InArgument<DateTime> EndDate { get; set; }

        [Category("Output"), DisplayName("Time Difference"),
         Description("The difference between the two dates as a TimeSpan.")]
        public OutArgument<TimeSpan> Result { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var start = StartDate.Get(context);
                var end = EndDate.Get(context);

                var difference = end - start;
                Result.Set(context, difference);
                StatusMessage.Set(context, "Date subtraction successful.");
            }
            catch (Exception ex)
            {
                Result.Set(context, TimeSpan.Zero);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }

        }
    }
}
