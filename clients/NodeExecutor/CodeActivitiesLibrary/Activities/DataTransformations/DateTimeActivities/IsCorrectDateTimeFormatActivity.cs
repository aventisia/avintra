using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Globalization;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Validate DateTime Format")]
    [Description("Checks if the input string matches the specified date and time format.")]
    [ActivityMetaData(nodeImg:"/assets/DateTime.svg")]
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
            try
            {
                // Get input arguments
                var input = InputDateTime.Get(context);
                var format = DateTimeFormat.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(input))
                    throw new ArgumentException("InputDateTime cannot be null or empty.", nameof(InputDateTime));
                if (string.IsNullOrWhiteSpace(format))
                    throw new ArgumentException("DateTimeFormat cannot be null or empty.", nameof(DateTimeFormat));

                // Trim any extra whitespace from the input
                input = input.Trim();

                // Parse the datetime string
                bool isValid = DateTime.TryParseExact(
                    input,
                    new[] { format }, 
                    DateTimeFormatInfo.InvariantInfo,
                    DateTimeStyles.None,
                    out DateTime parsedDate
                );
                IsValid.Set(context, isValid);
                StatusMessage.Set(context, $"Date/time format is valid: {isValid}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {              
                IsValid.Set(context, false);
                StatusMessage.Set(context, $"Error during format validation: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}