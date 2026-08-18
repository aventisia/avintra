using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Trim Text"), Description("Removes specified characters from the start, end, or both ends of a text string.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class TrimTextNode : BaseNode
{
    [DisplayName("Original Text"), Description("The original text from which characters will be trimmed.")]
    public required InArgument<string> OriginalText { get; set; }

    [DisplayName("Trim Mode"), Description("Specifies whether to trim characters from the beginning, end, or both sides of the text.")]
    public required InArgument<TrimModeEnum> TrimMode { get; set; } = new InArgument<TrimModeEnum>(TrimModeEnum.TrimStart);

    [DisplayName("What to Trim"), Description("A string containing the characters to remove. Leave empty to trim only whitespace (space, tab, newline).")]
    public required InArgument<string> CharactersToTrim { get; set; }

    [DisplayName("Trimmed Text"), Description("The resulting text after trimming.")]
    public OutArgument<string> TrimmedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var originalText = OriginalText.Get(context);
            var trimModeEnum = TrimMode.Get(context);
            var charsToTrim = CharactersToTrim.Get(context);

            if (string.IsNullOrEmpty(originalText))
                throw new ArgumentException("OriginalText cannot be null or empty.");

            var trimChars = string.IsNullOrEmpty(charsToTrim)
                ? new[] { ' ', '\t', '\n', '\r' }
                : charsToTrim.ToCharArray().Distinct().ToArray();

            string result;

            switch (trimModeEnum)
            {
                case TrimModeEnum.TrimStart:
                    result = originalText.TrimStart(trimChars);
                    break;

                case TrimModeEnum.TrimEnd:
                    result = originalText.TrimEnd(trimChars);
                    break;

                case TrimModeEnum.TrimBoth:
                    result = originalText.Trim(trimChars);
                    break;

                default:
                    throw new InvalidOperationException("Unsupported TrimMode.");
            }

            TrimmedText.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Trimmed text successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error trimming text: {ex.Message}");
            TrimmedText.Set(context, null!);
        }
    }
}
