using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Trim Text"),
     Description("Removes all occurrences of whitespace characters from the beginning and/or end of an existing text.")]
    public class TrimTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Original Text"), Description("The original text to trim.")]
        public InArgument<string> OriginalText { get; set; }

        [Category("Output"), DisplayName("Trimmed Text"), Description("The trimmed text result.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var originalText = OriginalText.Get(context);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("Original Text cannot be empty.");

                var result = originalText.Trim();
                ResultText.Set(context, result);
                StatusMessage.Set(context, "Text trimmed successfully.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, string.Empty);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
