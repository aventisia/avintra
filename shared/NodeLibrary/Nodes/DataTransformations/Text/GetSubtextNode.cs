using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Extract Substring from Text"), Description("Retrieves a substring from the original text based on start index and length.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class GetSubtextNode : BaseNode
{
    [DisplayName("Original Text"), Description("The full text value from which to extract a substring.")]
    public required InArgument<string> OriginalText { get; set; }

    [DisplayName("Start Index Type"), Description("Specifies whether to start from the beginning of the text or at a specific character position.")]
    public required InArgument<StartIndexTypeEnum> StartIndexType { get; set; }

    [DisplayName("Start Index"), Description("The zero-based starting position of the substring. Only used if 'Start Index Type' is 'Character Position'.")]
    [RenderIfCondition(nameof(StartIndexType), StartIndexTypeEnum.CharacterPosition)]
    public InArgument<int> StartIndex { get; set; }

    [DisplayName("Length Type"), Description("Specifies whether to extract a specific number of characters or until the end of the string.")]
    public InArgument<LengthTypeEnum> LengthType { get; set; } = new InArgument<LengthTypeEnum>(LengthTypeEnum.SpecificLength);

    [DisplayName("Number of Characters"), Description("The number of characters to extract. Only used if 'Length Type' is 'Specific Length'.")]
    [RenderIfCondition(nameof(LengthType), LengthTypeEnum.SpecificLength)]
    public InArgument<int> NumberOfCharacters { get; set; }

    [DisplayName("Substring Result"), Description("Returns the extracted substring.")]
    public OutArgument<string> SubstringResult { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var originalText = OriginalText.Get(context);
            var startIndexTypeEnum = StartIndexType.Get(context);
            int? startIndex = null;

            if (originalText == null)
                throw new ArgumentException("OriginalText cannot be empty.");

            switch (startIndexTypeEnum)
            {
                case StartIndexTypeEnum.StartOfText:
                    startIndex = 0;
                    break;

                case StartIndexTypeEnum.CharacterPosition:
                    startIndex = StartIndex.Get(context);

                    if (startIndex < 0 || startIndex >= originalText.Length)
                        throw new ArgumentOutOfRangeException(nameof(startIndex),
                            $"StartIndex must be between 0 and {originalText.Length - 1}");
                    break;

                default:
                    throw new ArgumentException("Invalid StartIndexType.");
            }

            var lengthTypeEnum = LengthType.Get(context);
            int? length = null;

            if (lengthTypeEnum == LengthTypeEnum.SpecificLength)
            {
                length = NumberOfCharacters.Get(context);

                if (length < 0)
                    throw new ArgumentException("Length must be non-negative.");

                if (startIndex + length > originalText.Length)
                    throw new ArgumentException("StartIndex + Length exceeds the length of the original text.");
            }

            var result = lengthTypeEnum == LengthTypeEnum.UntilEnd
                ? originalText.Substring(startIndex.Value)
                : originalText.Substring(startIndex.Value, length.Value);

            SubstringResult.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Substring extracted successfully.");
        }
        catch (Exception ex)
        {
            SubstringResult.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting substring: {ex.Message}");
        }
    }
}
