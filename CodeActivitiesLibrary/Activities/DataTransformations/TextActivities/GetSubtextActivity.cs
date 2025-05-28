using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Get Subtext"), Description("Retrieves a substring from a text value based on start and end indices.")]
    public class GetSubtextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Original Text"),
         Description("The original text from which the substring will be extracted.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Start Index"),
         Description("The starting index of the substring.")]
        public InArgument<int> StartIndex { get; set; }

        [Category("Input"), DisplayName("Length"),
         Description("The length of the substring to extract. If not provided, extracts until the end.")]
        public InArgument<int?> Length { get; set; }

        [Category("Output"), DisplayName("Result Text"), Description("The resulting substring.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var originalText = OriginalText.Get(context);
                var startIndex = StartIndex.Get(context);
                var length = Length.Get(context) ?? (originalText.Length - startIndex);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("OriginalText cannot be empty.");

                if (startIndex < 0 || startIndex >= originalText.Length)
                    throw new ArgumentException("StartIndex is out of bounds.");

                if (length < 0)
                    throw new ArgumentException("Length cannot be negative.");

                var result = originalText.Substring(startIndex, length);
                ResultText.Set(context, result);
                StatusMessage.Set(context, "Substring extraction successful.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
