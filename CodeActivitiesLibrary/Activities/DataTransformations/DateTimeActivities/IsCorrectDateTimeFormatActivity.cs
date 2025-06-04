using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Globalization;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Validate DateTime Format")]
    [Description("Checks if the input string matches the specified date and time format.")]
    public class IsCorrectDateTimeFormatActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("DateTime String")]
        [Description("The date and time string to validate.")]
        public InArgument<string> InputDateTime { get; set; }

        [RequiredArgument]
        [DisplayName("Expected Format")]
        [Description("The expected format pattern to validate against (e.g., yyyy-MM-dd HH:mm:ss).")]
        public InArgument<string> DateTimeFormat { get; set; }


        [DisplayName("Is Format Valid")]
        [Description("Returns true if the input matches the expected format; otherwise, false.")]
        public OutArgument<bool> IsValid { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var input = InputDateTime.Get(context);
            var format = DateTimeFormat.Get(context);
            bool isValid = false;

            try
            {
                if (string.IsNullOrWhiteSpace(input))
                    throw new ArgumentException("InputDateTime cannot be null or empty.");
                if (string.IsNullOrWhiteSpace(format))
                    throw new ArgumentException("DateTimeFormat cannot be null or empty.");

                var formats = new[] { format };
                DateTime outputDate;

                isValid = DateTime.TryParseExact(
                    input,
                    formats,
                    DateTimeFormatInfo.InvariantInfo,
                    DateTimeStyles.None,
                    out outputDate
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during format validation: " + ex.Message);
            }

            IsValid.Set(context, isValid);
        }
    }
}