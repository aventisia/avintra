using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Add to DateTime"),
     Description("Adds or subtracts a specific TimeSpan (seconds, minutes, hours, days) to a DateTime value.")]
    public class AddToDateTimeActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Base DateTime"),
         Description("The original DateTime to which time will be added.")]
        public InArgument<DateTime> BaseDateTime { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Time To Add"),
         Description("The TimeSpan (can be negative) to add or subtract from the base DateTime.")]
        public InArgument<TimeSpan> TimeToAdd { get; set; }

        [Category("Output"), DisplayName("Resulting DateTime"), Description("The DateTime value after the addition.")]
        public OutArgument<DateTime> Result { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var baseDate = BaseDateTime.Get(context);
                var offset = TimeToAdd.Get(context);
                var result = baseDate.Add(offset);

                Result.Set(context, result);
                StatusMessage.Set(context, "DateTime addition successful.");
            }
            catch (Exception ex)
            {
                Result.Set(context, default);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}