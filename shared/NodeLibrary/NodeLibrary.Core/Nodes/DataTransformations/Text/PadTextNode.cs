using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Pad Text"), Description("Creates a fixed-length text by adding characters to the left or right of an existing text.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class PadTextNode : BaseNode
{
    [DisplayName("Original Text"), Description("The original text to pad.")]
    public required InArgument<string> OriginalText { get; set; }

    [DisplayName("Padding Direction"), Description("Specifies whether to pad the text on the left or right side.")]
    public required InArgument<PadDirection> PaddingDirection { get; set; } = new InArgument<PadDirection>(PadDirection.Left);

    [DisplayName("Padding Character"), Description("The character(s) to use for padding.")]
    public required InArgument<string> PaddingCharacter { get; set; }

    [DisplayName("Total Length"), Description("The desired total length of the padded text.")]
    public required InArgument<int> TotalLength { get; set; }

    [DisplayName("Padded Text"), Description("The resulting text after padding.")]
    public OutArgument<string> PaddedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
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
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text padded successfully.");
        }
        catch (Exception ex)
        {
            PaddedText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error padding text: {ex.Message}");
        }
    }
}
