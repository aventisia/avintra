using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Join Text"), Description("Converts a list into a text value by separating its items with a specified delimiter.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class JoinTextNode : BaseNode
{
    [DisplayName("Text List"), Description("The list of strings to join.")]
    public required InArgument<IEnumerable<string>> TextList { get; set; }

    [DisplayName("Delimiter Type"), Description("Specifies how to separate the items in the list.")]
    public required InArgument<StringJoinDelimiterTypeEnum> DelimiterType { get; set; } = new InArgument<StringJoinDelimiterTypeEnum>(StringJoinDelimiterTypeEnum.Standard);

    [DisplayName("Standard Delimiter"), Description("The standard delimiter to use when 'Delimiter Type' is 'Standard'.")]
    [RenderIfCondition(nameof(DelimiterType), StringJoinDelimiterTypeEnum.Standard)]
    public InArgument<StandardStringJoinDelimiterEnum> StandardDelimiter { get; set; } = new InArgument<StandardStringJoinDelimiterEnum>(StandardStringJoinDelimiterEnum.None);

    [DisplayName("Custom Delimiter"), Description("The custom delimiter to use when 'Delimiter Type' is 'Custom'.")]
    [RenderIfCondition(nameof(DelimiterType), StringJoinDelimiterTypeEnum.Custom)]
    public InArgument<string> CustomDelimiter { get; set; } = new InArgument<string>();

    [DisplayName("Joined Text"), Description("Returns the resulting joined text after applying the delimiter.")]
    public OutArgument<string> JoinedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var textList = TextList.Get(context);
            var delimiterType = DelimiterType.Get(context);

            if (textList == null)
                throw new ArgumentException("Text List cannot be null.");

            string delimiter;

            switch (delimiterType)
            {
                case StringJoinDelimiterTypeEnum.Standard:
                    var standardDelimiter = StandardDelimiter.Get(context);

                    switch (standardDelimiter)
                    {
                        case StandardStringJoinDelimiterEnum.None:
                            delimiter = string.Empty;
                            break;

                        case StandardStringJoinDelimiterEnum.Comma:
                            delimiter = ",";
                            break;

                        case StandardStringJoinDelimiterEnum.Semicolon:
                            delimiter = ";";
                            break;

                        case StandardStringJoinDelimiterEnum.Pipe:
                            delimiter = "|";
                            break;

                        default:
                            throw new ArgumentException("Invalid Standard Delimiter.");
                    }

                    break;

                case StringJoinDelimiterTypeEnum.Custom:
                    var customDelimiter = CustomDelimiter.Get(context);

                    if (string.IsNullOrWhiteSpace(customDelimiter))
                        throw new ArgumentException("Custom Delimiter cannot be empty.");

                    delimiter = customDelimiter;
                    break;

                default:
                    throw new ArgumentException("Invalid Delimiter Type.");
            }

            var result = string.Join(delimiter, textList);
            JoinedText.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text joined successfully.");
        }
        catch (Exception ex)
        {
            JoinedText.Set(context, string.Empty);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error joining text: {ex.Message}");
        }
    }
}
