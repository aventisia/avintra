using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Pad Text")]
    [Description("Creates a fixed-length text by adding characters to the left or right of an existing text.")]
    public class PadTextActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Original Text")]
        [Description("The original text to pad.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument]
        [DisplayName("Padding Direction")]
        [Description("Specifies whether to pad the text on the left or right side.")]
        public InArgument<PadDirection> PaddingDirection { get; set; }

        [RequiredArgument]
        [DisplayName("Padding Character")]
        [Description("The character(s) to use for padding.")]
        public InArgument<string> PaddingCharacter { get; set; }

        [RequiredArgument]
        [DisplayName("Total Length")]
        [Description("The desired total length of the padded text.")]
        public InArgument<int> TotalLength { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Padded Text")]
        [Description("The resulting text after padding.")]
        public OutArgument<string> PaddedText { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var originalText = OriginalText.Get(context);
                var paddingDirection = PaddingDirection.Get(context);
                var paddingChar = PaddingCharacter.Get(context);
                var totalLength = TotalLength.Get(context);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("OriginalText cannot be empty.");

                if (string.IsNullOrEmpty(paddingChar))
                    throw new ArgumentException("PaddingCharacter cannot be empty.");

                if (totalLength < originalText.Length)
                    throw new ArgumentException(
                        "TotalLength must be greater than or equal to the length of OriginalText.");

                var paddedText = "";

                switch (paddingDirection)
                {
                    case PadDirection.Left:
                        paddedText = originalText.PadLeft(totalLength, paddingChar[0]);
                        break;

                    case PadDirection.Right:
                        paddedText = originalText.PadRight(totalLength, paddingChar[0]);
                        break;

                    default:
                        throw new ArgumentException("Invalid PaddingDirection.");
                }

                PaddedText.Set(context, paddedText);
            }
            catch (Exception ex)
            {
                status = $"Error padding text: {ex.Message}";
                PaddedText.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }
}