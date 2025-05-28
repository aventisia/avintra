using System;
using System.Activities;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Replace Text"),
     Description(
         "Replaces all occurrences of a specified subtext with another text. It can also be used with regular expressions.")]
    public class ReplaceTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Original Text"), Description("The original text to modify.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Search Pattern"),
         Description("The subtext or regular expression pattern to replace.")]
        public InArgument<string> SearchPattern { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Replacement Text"), Description("The replacement text.")]
        public InArgument<string> ReplacementText { get; set; }

        [Category("Output"), DisplayName("Resulting Text"), Description("The resulting text after replacement.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var originalText = OriginalText.Get(context);
                var searchPattern = SearchPattern.Get(context);
                var replacementText = ReplacementText.Get(context);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("Original Text cannot be empty.");

                if (string.IsNullOrWhiteSpace(searchPattern))
                    throw new ArgumentException("Search Pattern cannot be empty.");

                string result;
                if (Regex.IsMatch(searchPattern, @"[\^$.|?*+(){}[\]]"))
                {
                    result = Regex.Replace(originalText, searchPattern, replacementText);
                }
                else
                {
                    result = originalText.Replace(searchPattern, replacementText);
                }

                ResultText.Set(context, result);
                StatusMessage.Set(context, "Replacement successful.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, string.Empty);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
