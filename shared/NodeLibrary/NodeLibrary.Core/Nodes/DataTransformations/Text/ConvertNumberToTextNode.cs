namespace NodeLibrary.TextNodes;

[DisplayName("Convert Number to Text"), Description("Converts a numeric value into text with specified formatting options.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ConvertNumberToTextNode : BaseNode
{
    [DisplayName("Number to Convert"), Description("The numeric value to convert to text.")]
    public required InArgument<double> NumberToConvert { get; set; }

    [DisplayName("Decimal Places"), Description("The number of decimal places to include in the formatted text.")]
    public InArgument<int> DecimalPlaces { get; set; } = new InArgument<int>(2);

    [DisplayName("Use Thousands Separator"), Description("If true, includes a thousands separator in the formatted text.")]
    public InArgument<bool> UseThousandsSeparator { get; set; } = new InArgument<bool>(true);

    [DisplayName("Formatted Number"), Description("The resulting formatted number as text.")]
    public OutArgument<string> FormattedNumber { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var number = NumberToConvert.Get(context);
            var decimalPlaces = DecimalPlaces.Get(context);
            var useThousandsSeparator = UseThousandsSeparator.Get(context);

            if (decimalPlaces < 0)
                throw new ArgumentException("Decimal Places must be non-negative.");

            var format = useThousandsSeparator ? "N" : "F";
            format += decimalPlaces.ToString();

            var result = number.ToString(format);
            FormattedNumber.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Number converted to text successfully.");
        }
        catch (Exception ex)
        {
            status = $"Error converting number to text: {ex.Message}";
            FormattedNumber.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting number to text: {ex.Message}");
        }
    }
}
