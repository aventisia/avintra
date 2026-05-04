namespace NodeLibrary.TextNodes;

[DisplayName("Escape Text for Regular Expression"), Description("Escapes a minimal set of characters for use in regular expressions by replacing them with their escape codes.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class EscapeTextForRegularExpressionNode : BaseNode
{
    [DisplayName("Text to Escape"), Description("The text value that will be escaped for use in regular expressions.")]
    public required InArgument<string> TextToEscape { get; set; }

    [DisplayName("Escaped Text"), Description("Returns the text after escaping special characters for regular expressions.")]
    public OutArgument<string> EscapedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var textToEscape = TextToEscape.Get(context);

            if (string.IsNullOrWhiteSpace(textToEscape))
                throw new ArgumentException("Text to Escape cannot be empty.");

            var escapedText = Regex.Escape(textToEscape);
            EscapedText.Set(context, escapedText);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text escaped successfully.");
        }
        catch (Exception ex)
        {
            EscapedText.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error escaping text: {ex.Message}");
        }
    }
}
