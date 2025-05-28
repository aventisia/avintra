using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Get Current Date and Time"), Description("Retrieves the current date or the current date and time.")]
    public class GetCurrentDateTimeActivity : CodeActivity
    {
        [Category("Output"), DisplayName("Current DateTime"), Description("Outputs the current system date and time.")]
        public OutArgument<DateTime> Result { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var now = DateTime.Now;
                Result.Set(context, now);
                StatusMessage.Set(context, "Current DateTime retrieved successfully.");
            }
            catch (Exception ex)
            {
                Result.Set(context, default);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
