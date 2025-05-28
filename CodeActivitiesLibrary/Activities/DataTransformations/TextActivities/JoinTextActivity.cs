using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Join Text"),
     Description("Converts a list into a text value by separating its items with a specified delimiter.")]
    public class JoinTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Text List"), Description("The list of strings to join.")]
        public InArgument<IEnumerable<string>> TextList { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Delimiter"),
         Description("The delimiter to use for joining the strings.")]
        public InArgument<string> Delimiter { get; set; }

        [Category("Output"), DisplayName("Result Text"), Description("The resulting joined text.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var textList = TextList.Get(context);
                var delimiter = Delimiter.Get(context);

                if (textList == null)
                    throw new ArgumentException("TextList cannot be null.");

                if (string.IsNullOrWhiteSpace(delimiter))
                    throw new ArgumentException("Delimiter cannot be empty.");

                var result = string.Join(delimiter, textList);
                ResultText.Set(context, result);
                StatusMessage.Set(context, "Join operation completed successfully.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
