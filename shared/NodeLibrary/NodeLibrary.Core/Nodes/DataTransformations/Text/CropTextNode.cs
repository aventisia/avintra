using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Crop Text"), Description("Extracts text before, after, or between specified flags.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class CropTextNode : BaseNode
{
    [DisplayName("Original Text"), Description("The full text value from which to extract a portion.")]
    public required InArgument<string> OriginalText { get; set; }

    [DisplayName("Mode"), Description("Specifies how to crop the text relative to the flag(s).")]
    public required InArgument<CropModeEnum> Mode { get; set; } = new InArgument<CropModeEnum>(CropModeEnum.BeforeFlag);

    [DisplayName("Flag"), Description("The flag used to locate the text to extract. Required in 'Before Flag' and 'After Flag' modes.")]
    public required InArgument<string> Flag { get; set; }

    [DisplayName("Second Flag"), Description("The second flag used in 'Between Flags' mode to mark the end of the extracted text.")]
    [RenderIfCondition(nameof(Mode), CropModeEnum.BetweenFlags)]
    public InArgument<string> SecondFlag { get; set; } = new InArgument<string>();

    [DisplayName("Ignore Case"), Description("When true, ignores case when matching flags.")]
    public InArgument<bool> IgnoreCase { get; set; } = new InArgument<bool>(true);

    [DisplayName("Cropped Text"), Description("The extracted portion of the original text based on the specified mode.")]
    public OutArgument<string> CroppedText { get; set; } = new OutArgument<string>();

    [DisplayName("Is Flag Found"), Description("Indicates whether the specified flag(s) were found in the original text.")]
    public OutArgument<bool> IsFlagFound { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var originalText = OriginalText.Get(context) ?? string.Empty;
            var mode = Mode.Get(context);
            var flag = Flag.Get(context) ?? string.Empty;
            var secondFlag = SecondFlag.Get(context) ?? string.Empty;
            var ignoreCase = IgnoreCase.Get(context);

            if (string.IsNullOrWhiteSpace(originalText))
                throw new ArgumentException("Original text cannot be empty.");

            switch (mode)
            {
                case CropModeEnum.BeforeFlag:
                case CropModeEnum.AfterFlag:
                    {
                        if (string.IsNullOrWhiteSpace(flag))
                            throw new ArgumentException($"Flag is required in '{mode}' mode.");
                        break;
                    }
                case CropModeEnum.BetweenFlags when string.IsNullOrWhiteSpace(flag):
                    throw new ArgumentException("First flag is required in 'Between Flags' mode.");
                case CropModeEnum.BetweenFlags when string.IsNullOrWhiteSpace(secondFlag):
                    throw new ArgumentException("Second flag is required in 'Between Flags' mode.");
                default:
                    throw new ArgumentOutOfRangeException();
            }

            string? result = null;
            var flagFound = false;

            switch (mode)
            {
                case CropModeEnum.BeforeFlag:
                    result = GetTextBeforeFlag(originalText, flag, ignoreCase, out flagFound);
                    break;

                case CropModeEnum.AfterFlag:
                    result = GetTextAfterFlag(originalText, flag, ignoreCase, out flagFound);
                    break;

                case CropModeEnum.BetweenFlags:
                    result = GetTextBetweenFlags(originalText, flag, secondFlag, ignoreCase, out flagFound);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(mode), mode, null);
            }

            CroppedText.Set(context, result);
            IsFlagFound.Set(context, flagFound);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text cropped successfully.");
        }
        catch (Exception ex)
        {
            CroppedText.Set(context, null);
            IsFlagFound.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error cropping text: {ex.Message}");
        }
    }

    private static string? GetTextBeforeFlag(string text, string flag, bool ignoreCase, out bool flagFound)
    {
        var index = ignoreCase
            ? text.IndexOf(flag, StringComparison.OrdinalIgnoreCase)
            : text.IndexOf(flag, StringComparison.Ordinal);

        flagFound = index != -1;

        return index == -1 ? null : text.Substring(0, index);
    }

    private static string? GetTextAfterFlag(string text, string flag, bool ignoreCase, out bool flagFound)
    {
        var index = ignoreCase
            ? text.IndexOf(flag, StringComparison.OrdinalIgnoreCase)
            : text.IndexOf(flag, StringComparison.Ordinal);

        flagFound = index != -1;

        return index == -1 ? null : text.Substring(index + flag.Length);
    }

    private static string? GetTextBetweenFlags(string text, string flag1, string flag2, bool ignoreCase,
        out bool flagFound)
    {
        var startIndex = ignoreCase
            ? text.IndexOf(flag1, StringComparison.OrdinalIgnoreCase)
            : text.IndexOf(flag1, StringComparison.Ordinal);

        if (startIndex == -1)
        {
            flagFound = false;
            return null;
        }

        var endIndex = ignoreCase
            ? text.IndexOf(flag2, startIndex + flag1.Length, StringComparison.OrdinalIgnoreCase)
            : text.IndexOf(flag2, startIndex + flag1.Length, StringComparison.Ordinal);

        flagFound = endIndex != -1;

        return !flagFound
            ? null
            : text.Substring(startIndex + flag1.Length, endIndex - (startIndex + flag1.Length));
    }
}
