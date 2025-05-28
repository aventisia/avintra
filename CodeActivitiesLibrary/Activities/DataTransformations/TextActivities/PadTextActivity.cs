using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Pad Text"),
     Description("Creates a fixed-length text by adding characters to the left or right of an existing text.")]
    public class PadTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Original Text"), Description("The original text to pad.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Total Length"),
         Description("The total length of the padded text.")]
        public InArgument<int> TotalLength { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Padding Character"),
         Description("The padding character to use (e.g., '0', ' ').")]
        public InArgument<char> PaddingCharacter { get; set; }

        [Category("Input"), DisplayName("Pad Direction"), Description("The padding direction: Left, Right.")]
        public InArgument<PadDirectionEnum> PadDirection { get; set; } = new InArgument<PadDirectionEnum>(PadDirectionEnum.Left);

        [Category("Output"), DisplayName("Result Text"), Description("The padded text result.")]
        public OutArgument<string> ResultText { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var originalText = OriginalText.Get(context);
                var totalLength = TotalLength.Get(context);
                var paddingCharacter = PaddingCharacter.Get(context);
                var padDirection = PadDirection.Get(context);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("OriginalText cannot be empty.");

                if (totalLength < originalText.Length)
                    throw new ArgumentException("TotalLength cannot be less than the length of OriginalText.");

                string result;
                switch (padDirection)
                {
                    case PadDirectionEnum.Left:
                        result = originalText.PadLeft(totalLength, paddingCharacter);
                        break;
                    case PadDirectionEnum.Right:
                        result = originalText.PadRight(totalLength, paddingCharacter);
                        break;
                    default:
                        throw new ArgumentException("Invalid PadDirection.");
                }

                ResultText.Set(context, result);
                StatusMessage.Set(context, "Padding completed successfully.");
            }
            catch (Exception ex)
            {
                ResultText.Set(context, $"Error: {ex.Message}");
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }

    public enum PadDirectionEnum
    {
        Left = 0,
        Right = 1
    }
}
