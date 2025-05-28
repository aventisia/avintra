using System;
using System.Activities;
using System.ComponentModel;
using System.Globalization;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    public class IsCorrectDateTimeFormatActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Input DateTime String")]
        [Description("The date and time string to validate.")]
        public InArgument<string> InputDateTime { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("DateTime Format")]
        [Description("The expected DateTime format to validate against (e.g., yyyy-MM-dd HH:mm:ss).")]
        public InArgument<string> DateTimeFormat { get; set; }

        [Category("Output")]
        [DisplayName("Is Valid Format")]
        [Description("Returns true if the input date/time string matches the specified format.")]
        public OutArgument<bool> Result { get; set; }

        [Category("Output")]
        [Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string inputDateTime = InputDateTime.Get(context);
            string dateTimeFormat = DateTimeFormat.Get(context);
            bool isValid = false;
            string message;

            try
            {
                DateTime outputDate;
                isValid = DateTime.TryParseExact(
                    inputDateTime,
                    new[] { dateTimeFormat },
                    DateTimeFormatInfo.InvariantInfo,
                    DateTimeStyles.None,
                    out outputDate
                );

                message = isValid
                    ? "DateTime string is in the correct format."
                    : "DateTime string does not match the expected format.";
            }
            catch (Exception ex)
            {
                isValid = false;
                message = "Exception in IsCorrectDateTimeFormat activity: " + ex.Message;
            }

            Result.Set(context, isValid);
            StatusMessage.Set(context, message);
        }
    }
}
