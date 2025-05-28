using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Split Text"),
     Description(
         "Creates a list containing the substrings of a text that are separated by a specified delimiter or regular expression.")]
    public class SplitTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Text To Split"), Description("The text to split.")]
        public InArgument<string> TextToSplit { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Split Pattern"),
         Description("The delimiter or regular expression pattern to use for splitting.")]
        public InArgument<string> SplitPattern { get; set; }

        [Category("Output"), DisplayName("Resulting Substring List"), Description("The resulting list of substrings.")]
        public OutArgument<IEnumerable<string>> ResultList { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var textToSplit = TextToSplit.Get(context);
                var splitPattern = SplitPattern.Get(context);

                if (string.IsNullOrWhiteSpace(textToSplit))
                    throw new ArgumentException("Text To Split cannot be empty.");

                if (string.IsNullOrWhiteSpace(splitPattern))
                    throw new ArgumentException("Split Pattern cannot be empty.");

                IEnumerable<string> result;

                // If the pattern contains regex special chars, treat as regex, else simple string split
                if (Regex.IsMatch(splitPattern, @"[\^$.|?*+(){}[\]]"))
                {
                    result = Regex.Split(textToSplit, splitPattern);
                }
                else
                {
                    result = textToSplit.Split(new[] { splitPattern }, StringSplitOptions.None);
                }

                ResultList.Set(context, result);
                StatusMessage.Set(context, "Text split successfully.");
            }
            catch (Exception ex)
            {
                ResultList.Set(context, Array.Empty<string>());
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
