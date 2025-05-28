using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Append Line to Text")]
    [Description("Appends a new line of text to the original text.")]
    public class AppendLineToTextActivity : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var original = OriginalText.Get(context);
            var newline = NewLine.Get(context);


            OResultOutput.Set(context, string.IsNullOrEmpty(original)
                ? newline
                : $"{original}{Environment.NewLine}{newline}");
        }

        #region Inputs

        [Category("Input")]
        [Description("The original text to which a new line will be appended.")]
        public InArgument<string> OriginalText { get; set; }

        [Category("Input")]
        [Description("The new line of text to append.")]
        public InArgument<string> NewLine { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [Description("The resulting text after appending the new line.")]
        public OutArgument<string> OResultOutput { get; set; }

        #endregion
    }
}