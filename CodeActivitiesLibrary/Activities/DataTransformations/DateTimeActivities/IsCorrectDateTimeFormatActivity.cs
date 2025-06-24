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
            var isValid = false;
            try
            {
                if (string.IsNullOrWhiteSpace(input))
                    throw new ArgumentException("InputDateTime cannot be null or empty.", nameof(InputDateTime));
                if (string.IsNullOrWhiteSpace(format))
                    throw new ArgumentException("DateTimeFormat cannot be null or empty.", nameof(DateTimeFormat));
                var formats = new[] { format };
                DateTime outputDate;
                isValid = DateTime.TryParseExact(
                    input,
                    formats,
                    DateTimeFormatInfo.InvariantInfo,
                    DateTimeStyles.None,
                    out outputDate
                );
                IsValid.Set(context, isValid);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Date/time format is valid: {isValid}");

            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error during format validation: {ex.Message}");
                IsValid.Set(context, false);
            }
        }
    }
}