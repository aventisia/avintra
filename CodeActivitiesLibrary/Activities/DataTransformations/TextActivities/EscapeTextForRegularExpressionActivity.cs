using System;
using System.Activities;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Escape Text for Regular Expression"),
     Description("Escapes a minimal set of characters for use in regular expressions.")]
    public class EscapeTextForRegularExpressionActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Text to Escape"), Description("The text to escape.")]
        public InArgument<string> TextToEscape { get; set; }

        [Category("Output"), DisplayName("Result Text"), Description("The escaped text.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var textToEscape = TextToEscape.Get(context);

                if (string.IsNullOrWhiteSpace(textToEscape))
                    throw new ArgumentException("TextToEscape cannot be empty.");

                var result = Regex.Escape(textToEscape);
                ResultText.Set(context, result);
                StatusMessage.Set(context, "Text escaped successfully.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
