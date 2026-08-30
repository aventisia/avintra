using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes;

[DisplayName("Convert Text to Number"), Description("Converts a text representation of a number to a numeric value.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ConvertTextToNumberNode : BaseNode
{
    [DisplayName("Text to Convert"), Description("The text value that will be converted to a numeric type.")]
    public required InArgument<string> TextToConvert { get; set; }

    [DisplayName("Output Type"), Description("Specifies the numeric type to which the text should be converted.")]
    public required InArgument<OutputTypeEnum> OutputType { get; set; } = new InArgument<OutputTypeEnum>(OutputTypeEnum.Integer);

    [DisplayName("Converted Value"), Description("Returns the resulting numeric value after conversion.")]
    public OutArgument<object> ConvertedValue { get; set; } = new OutArgument<object>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var textToConvert = TextToConvert.Get(context);
            var outputType = OutputType.Get(context);

            if (string.IsNullOrWhiteSpace(textToConvert))
                throw new ArgumentException("Text to Convert cannot be empty.");

            object? result = null;

            switch (outputType)
            {
                case OutputTypeEnum.Integer:
                    if (!int.TryParse(textToConvert, out var intValue))
                        throw new FormatException($"Cannot convert '{textToConvert}' to an integer.");
                    result = intValue;
                    break;

                case OutputTypeEnum.Double:
                    if (!double.TryParse(textToConvert, out var doubleValue))
                        throw new FormatException($"Cannot convert '{textToConvert}' to a double.");
                    result = doubleValue;
                    break;

                case OutputTypeEnum.Decimal:
                    if (!decimal.TryParse(textToConvert, out var decimalValue))
                        throw new FormatException($"Cannot convert '{textToConvert}' to a decimal.");
                    result = decimalValue;
                    break;

                default:
                    throw new ArgumentException("Unsupported output type.");
            }

            ConvertedValue.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text successfully converted to number.");
        }
        catch (Exception ex)
        {
            ConvertedValue.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting text to number: {ex.Message}");
        }
    }
}
