namespace NodeLibrary.TextNodes;

[DisplayName("Tokenize Text"), Description("Splits text into a list of word tokens, optionally removing punctuation and stop words.")]
[NodeMetadata(icon: "/assets/Text.svg", badge: "Beta")]
public class TokenizeTextNode : BaseNode
{
    [DisplayName("Text"), Description("The text to tokenize.")]
    public InArgument<string> Text { get; set; } = new InArgument<string>();

    [DisplayName("Lowercase Tokens"), Description("Converts all tokens to lowercase.")]
    public InArgument<bool> LowercaseTokens { get; set; } = new InArgument<bool>(true);

    [DisplayName("Remove Punctuation"), Description("Removes punctuation characters from the tokens.")]
    public InArgument<bool> RemovePunctuation { get; set; } = new InArgument<bool>(true);

    [DisplayName("Remove Stop Words"), Description("Removes common English stop words (e.g., 'the', 'and').")]
    public InArgument<bool> RemoveStopWords { get; set; } = new InArgument<bool>(false);

    [DisplayName("Tokens"), Description("The resulting list of word tokens.")]
    public OutArgument<List<string>> Tokens { get; set; } = new OutArgument<List<string>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var text = Text.Get(context);
            var lowercaseTokens = LowercaseTokens.Get(context);
            var removePunctuation = RemovePunctuation.Get(context);
            var removeStopWords = RemoveStopWords.Get(context);

            if (string.IsNullOrWhiteSpace(text))
            {
                Tokens.Set(context, new List<string>());
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                return;
            }

            var tokens = Regex.Matches(text, @"\b[\w'-]+\b")
                .Cast<Match>()
                .Select(m => m.Value)
                .ToList();

            if (lowercaseTokens)
                tokens = tokens.Select(t => t.ToLowerInvariant()).ToList();
            if (removePunctuation)
                tokens = tokens.Select(t => Regex.Replace(t, @"[^\w']", "")).Where(t => t.Length > 0).ToList();
            if (removeStopWords)
                tokens = tokens.Where(t => !StopWords.Contains(t)).ToList();

            Tokens.Set(context, tokens);
            status = $"Successfully tokenized text into {tokens.Count} tokens.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Tokens.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error tokenizing text: {ex.Message}");
        }
    }

    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
        "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were",
        "will", "with", "i", "you", "we", "they", "this", "these", "those", "have"
    };
}
