using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Change Text Case"), Description("Converts the input text to the specified case format.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ChangeTextCaseNode : BaseNode
{
    [DisplayName("Text to Convert"), Description("The text to convert.")]
    public InArgument<string> TextToConvert { get; set; } = new InArgument<string>();

    [DisplayName("Convert To"), Description("Specify the target case style: Upper, Lower, Title, or Sentence.")]
    public InArgument<TextCaseEnum> ConvertTo { get; set; } = new InArgument<TextCaseEnum>(TextCaseEnum.Uppercase);

    [DisplayName("Result"), Description("The converted text based on selected case style.")]
    public OutArgument<string> Result { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var input = TextToConvert.Get(context);
            var convertTo = ConvertTo.Get(context);

            string result = null;

            switch (convertTo)
            {
                case TextCaseEnum.Uppercase:
                    result = input != null ? input.ToUpper() : null;
                    break;
                case TextCaseEnum.Lowercase:
                    result = input != null ? input.ToLower() : null;
                    break;
                case TextCaseEnum.TitleCase:
                    result = ToTitleCase(input);
                    break;
                case TextCaseEnum.SentenceCase:
                    result = ToSentenceCase(input);
                    break;
                default:
                    result = input;
                    break;
            }

            Result.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text converted successfully.");
        }
        catch (Exception ex)
        {
            Result.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting text: {ex.Message}");
        }
    }

    private static string ToTitleCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(input.ToLower());
    }

    private static string ToSentenceCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return char.ToUpper(input[0]) + input.Substring(1).ToLower();
    }
}
