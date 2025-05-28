using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Reverse Text"), Description("Reverses the order of letters in a text string.")]
    public class ReverseTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Original Text"),
         Description("The original text to reverse.")]
        public InArgument<string> OriginalText { get; set; }

        [Category("Output"), DisplayName("Reversed Text"), Description("The reversed text result.")]
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

                var result = new string(originalText.Reverse().ToArray());
                ResultText.Set(context, result);
                StatusMessage.Set(context, "Text reversed successfully.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, string.Empty);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
