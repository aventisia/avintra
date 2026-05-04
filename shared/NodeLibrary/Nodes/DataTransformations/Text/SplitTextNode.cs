using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Split Text"), Description("Creates a list containing the substrings of a text that is separated by a specified delimiter or regular expression.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class SplitTextNode : BaseNode
{
    [DisplayName("Text to Split"), Description("The text value that will be split into parts based on the specified delimiter or pattern.")]
    public required InArgument<string> TextToSplit { get; set; }

    [DisplayName("Delimiter Type"), Description("Specifies how to split the text.")]
    public required InArgument<DelimiterTypeEnum> DelimiterType { get; set; }

    [DisplayName("Standard Delimiter"), Description("The standard delimiter to use when 'Delimiter Type' is 'Standard'.")]
    [RenderIfCondition(nameof(DelimiterType), DelimiterTypeEnum.Standard)]
    public InArgument<StandardDelimiterEnum> StandardDelimiter { get; set; }

    [DisplayName("Times"), Description("The number of times to split the text using the standard delimiter.")]
    [RenderIfCondition(nameof(DelimiterType), DelimiterTypeEnum.Standard)]
    public InArgument<int> Times { get; set; }

    [DisplayName("Split Width"), Description("The width of each substring when 'Delimiter Type' is 'Number of Characters'.")]
    [RenderIfCondition(nameof(DelimiterType), DelimiterTypeEnum.NumberOfCharacters)]
    public InArgument<int> SplitWidth { get; set; }

    [DisplayName("Custom Delimiter"), Description("The custom delimiter to use when 'Delimiter Type' is 'Custom'.")]
    [RenderIfCondition(nameof(DelimiterType), DelimiterTypeEnum.Custom)]
    public InArgument<string> CustomDelimiter { get; set; }

    [DisplayName("Is Regular Expression"), Description("Indicates whether the custom delimiter is a regular expression pattern.")]
    [RenderIfCondition(nameof(DelimiterType), DelimiterTypeEnum.Custom)]
    public InArgument<bool> IsRegularExpression { get; set; }

    [DisplayName("Text List"), Description("Returns the list of substrings after splitting the original text.")]
    public OutArgument<IList> TextList { get; set; } = new OutArgument<IList>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var textToSplit = TextToSplit.Get(context);
            var delimiterType = DelimiterType.Get(context);

            if (string.IsNullOrWhiteSpace(textToSplit))
                throw new ArgumentException("Text to Split cannot be empty.");

            List<string> result = null;

            switch (delimiterType)
            {
                case DelimiterTypeEnum.Standard:
                    var standardDelimiter = StandardDelimiter.Get(context);
                    var times = Times.Get(context);

                    switch (standardDelimiter)
                    {
                        case StandardDelimiterEnum.Tab:
                            result = textToSplit.Split(new[] { '\t' }, times).ToList();
                            break;
                        case StandardDelimiterEnum.NewLine:
                            result = textToSplit.Split(new[] { '\r', '\n' }, times,
                                StringSplitOptions.RemoveEmptyEntries).ToList();
                            break;
                        default:
                            throw new ArgumentException("Invalid Standard Delimiter.");
                    }

                    break;

                case DelimiterTypeEnum.NumberOfCharacters:
                    var splitWidth = SplitWidth.Get(context);

                    if (splitWidth <= 0)
                        throw new ArgumentException("Split Width must be greater than zero.");

                    result = SplitByCharacterWidth(textToSplit, splitWidth);
                    break;

                case DelimiterTypeEnum.Custom:
                    var customDelimiter = CustomDelimiter.Get(context);
                    var isRegex = IsRegularExpression.Get(context);

                    if (string.IsNullOrEmpty(customDelimiter))
                        throw new ArgumentException("Custom Delimiter cannot be empty.");

                    result = isRegex
                        ? Regex.Split(textToSplit, customDelimiter).ToList()
                        : textToSplit.Split(new[] { customDelimiter }, StringSplitOptions.None).ToList();

                    break;

                default:
                    throw new ArgumentException("Invalid Delimiter Type.");
            }

            TextList.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Split text successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error splitting text: {ex.Message}");
            TextList.Set(context, null!);
        }
    }

    private static List<string> SplitByCharacterWidth(string text, int width)
    {
        var result = new List<string>();
        for (var i = 0; i < text.Length; i += width)
            result.Add(text.Substring(i, Math.Min(width, text.Length - i)));
        return result;
    }
}
