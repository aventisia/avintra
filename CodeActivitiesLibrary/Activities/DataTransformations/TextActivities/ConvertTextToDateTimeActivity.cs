using System;
using System.Activities;
using System.ComponentModel;
using System.Globalization;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Text to DateTime"),
     Description("Converts a text representation of a date and/or time value to a DateTime value.")]
    public class ConvertTextToDateTimeActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Text to Convert"),
         Description("The text to convert to a DateTime.")]
        public InArgument<string> TextToConvert { get; set; }

        [Category("Input"), DisplayName("Format String"),
         Description("The format string to use for parsing the date/time (e.g., 'yyyy-MM-dd').")]
        public InArgument<string> Format { get; set; } = new InArgument<string>(String.Empty);

        [Category("Output"), DisplayName("Result DateTime"), Description("The resulting DateTime value.")]
        public OutArgument<DateTime> ResultDateTime { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var textToConvert = TextToConvert.Get(context);
                var format = Format.Get(context);

                if (string.IsNullOrWhiteSpace(textToConvert))
                    throw new ArgumentException("TextToConvert cannot be empty.");

                DateTime result;
                if (string.IsNullOrEmpty(format))
                {
                    if (!DateTime.TryParse(textToConvert, out result))
                        throw new FormatException($"Cannot parse '{textToConvert}' as a DateTime.");
                }
                else
                {
                    if (!DateTime.TryParseExact(textToConvert, format, null, DateTimeStyles.None,
                            out result))
                        throw new FormatException($"Cannot parse '{textToConvert}' with format '{format}'.");
                }

                ResultDateTime.Set(context, result);
                StatusMessage.Set(context, "Conversion successful.");
            }
            catch (Exception ex)
            {
                ResultDateTime.Set(context, default(DateTime));
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}