namespace NodeLibrary.TextNodes;

[DisplayName("Replace Text"), Description("Replaces all occurrences of a specified subtext with another text. It can also be used with regular expressions.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ReplaceTextNode : BaseNode
{
    [DisplayName("Original Text"), Description("The original text to modify.")]
    public required InArgument<string> OriginalText { get; set; }

    [DisplayName("Search Pattern"), Description("The subtext or regular expression pattern to replace.")]
    public required InArgument<string> SearchPattern { get; set; }

    [DisplayName("Replacement Text"), Description("The replacement text.")]
    public required InArgument<string> ReplacementText { get; set; }

    [DisplayName("Use Regular Expressions"), Description("If true, treats 'Search Pattern' as a regular expression.")]
    public InArgument<bool> UseRegex { get; set; } = new InArgument<bool>(false);

    [DisplayName("Ignore Case"), Description("If true, performs a case-insensitive search.")]
    public InArgument<bool> IgnoreCase { get; set; } = new InArgument<bool>(false);

    [DisplayName("Activate Escape Sequences"), Description("If true, interprets escape sequences in the replacement text.")]
    public InArgument<bool> ActivateEscapeSequences { get; set; } = new InArgument<bool>(false);

    [DisplayName("Replaced Text"), Description("The resulting text after replacement.")]
    public OutArgument<string> ReplacedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var originalText = OriginalText.Get(context) ?? string.Empty;
            var searchPattern = SearchPattern.Get(context) ?? string.Empty;
            var replacementText = ReplacementText.Get(context) ?? string.Empty;
            var useRegex = UseRegex.Get(context);
            var ignoreCase = IgnoreCase.Get(context);
            var activateEscapeSequences = ActivateEscapeSequences.Get(context);

            if (string.IsNullOrWhiteSpace(originalText))
                throw new ArgumentException("Original Text cannot be empty.");

            if (string.IsNullOrWhiteSpace(searchPattern))
                throw new ArgumentException("Search Pattern cannot be empty.");

            string result;

            if (useRegex)
            {
                var options = ignoreCase ? RegexOptions.IgnoreCase : RegexOptions.None;

                if (activateEscapeSequences)
                    replacementText = Regex.Unescape(replacementText);

                result = Regex.Replace(originalText, searchPattern, replacementText, options);
            }
            else
            {
                if (ignoreCase)
                {
                    var index = 0;
                    result = originalText;

                    while ((index = result.IndexOf(searchPattern, index, StringComparison.OrdinalIgnoreCase)) != -1)
                    {
                        result = result.Substring(0, index) + replacementText +
                                 result.Substring(index + searchPattern.Length);
                        index += replacementText.Length;
                    }
                }
                else
                {
                    result = originalText.Replace(searchPattern, replacementText);
                }
            }

            ReplacedText.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Replaced text successfully.");
        }
        catch (Exception ex)
        {
            ReplacedText.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error replacing text: {ex.Message}");
        }
    }
}
