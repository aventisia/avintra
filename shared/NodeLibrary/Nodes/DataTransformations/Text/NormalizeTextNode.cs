using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Normalize Text"), Description("Normalizes a text by removing accents, collapsing whitespace, and converting the case.")]
[NodeMetadata(icon: "/assets/Text.svg", badge: "Beta")]
public class NormalizeTextNode : BaseNode
{
    [DisplayName("Text"), Description("The text to normalize.")]
    public InArgument<string> Text { get; set; } = new InArgument<string>();

    [DisplayName("Remove Accents"), Description("Removes diacritical marks (accents) from characters.")]
    public InArgument<bool> RemoveAccents { get; set; } = new InArgument<bool>(true);

    [DisplayName("Collapse Whitespace"), Description("Replaces multiple consecutive whitespace characters with a single space.")]
    public InArgument<bool> CollapseWhitespace { get; set; } = new InArgument<bool>(true);

    [DisplayName("Normalize Case"), Description("Converts the text to the selected case format.")]
    public InArgument<CleanseCaseEnum> NormalizeCase { get; set; } = new InArgument<CleanseCaseEnum>(CleanseCaseEnum.Lowercase);

    [DisplayName("Normalized Text"), Description("The normalized text.")]
    public OutArgument<string> NormalizedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var text = Text.Get(context);
            var removeAccents = RemoveAccents.Get(context);
            var collapseWhitespace = CollapseWhitespace.Get(context);
            var normalizeCase = NormalizeCase.Get(context);

            if (string.IsNullOrEmpty(text))
            {
                NormalizedText.Set(context, text);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
                return;
            }

            var result = text;
            if (removeAccents)
                result = RemoveDiacritics(result);
            if (collapseWhitespace)
                result = Regex.Replace(result, @"\s+", " ").Trim();
            result = ApplyCase(result, normalizeCase);

            NormalizedText.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            NormalizedText.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error normalizing text: {ex.Message}");
        }
    }

    private static string RemoveDiacritics(string text)
    {
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    private static string ApplyCase(string text, CleanseCaseEnum caseMode)
    {
        return caseMode switch
        {
            CleanseCaseEnum.Lowercase => text.ToLower(CultureInfo.InvariantCulture),
            CleanseCaseEnum.Uppercase => text.ToUpper(CultureInfo.InvariantCulture),
            CleanseCaseEnum.TitleCase => CultureInfo.InvariantCulture.TextInfo.ToTitleCase(text.ToLower(CultureInfo.InvariantCulture)),
            _ => text
        };
    }
}
