using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Text to Number"),
     Description("Converts a text representation of a number to a numeric value.")]
    public class ConvertTextToNumberActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Text to Convert"),
         Description("The text to convert to a number.")]
        public InArgument<string> TextToConvert { get; set; }

        [Category("Output"), DisplayName("Result Number"), Description("The resulting numeric value.")]
        public OutArgument<double> ResultNumber { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var textToConvert = TextToConvert.Get(context);

                if (string.IsNullOrWhiteSpace(textToConvert))
                    throw new ArgumentException("TextToConvert cannot be empty.");

                if (!double.TryParse(textToConvert, out var result))
                    throw new FormatException($"Cannot convert '{textToConvert}' to a number.");

                ResultNumber.Set(context, result);
                StatusMessage.Set(context, "Conversion successful.");
            }
            catch (Exception ex)
            {
                ResultNumber.Set(context, default(double));
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
