using System;
using System.Activities;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Escape Text for Regular Expression")]
    [Description("Escapes a minimal set of characters for use in regular expressions by replacing them with their escape codes.")]
    public class EscapeTextForRegularExpressionActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Text to Escape")]
        [Description("The text value that will be escaped for use in regular expressions.")]
        public InArgument<string> TextToEscape { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Escaped Text")]
        [Description("Returns the text after escaping special characters for regular expressions.")]
        public OutArgument<string> EscapedText { get; set; }




        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var textToEscape = TextToEscape.Get(context);

                if (string.IsNullOrWhiteSpace(textToEscape))
                    throw new ArgumentException("Text to Escape cannot be empty.");

                var escapedText = Regex.Escape(textToEscape);
                EscapedText.Set(context, escapedText);
            }
            catch (Exception ex)
            {
                status = $"Error escaping text: {ex.Message}";
                EscapedText.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }
}