namespace NodeLibrary.DataTransformations.TextActivities;

using NodeLibrary.DataTransformations.TextActivities.Enums;
using System.Globalization;

[DisplayName("Convert Text to DateTime"), Description("Converts a text representation of a date and/or time value to a DateTime value.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ConvertTextToDateTimeNode : BaseNode
{
    [DisplayName("Text to Convert"), Description("The text value that will be converted to a DateTime.")]
    public required InArgument<string> TextToConvert { get; set; }

    [DisplayName("Use Custom Format"), Description("If true, uses the specified format string for parsing the date/time.")]
    public InArgument<bool> UseCustomFormat { get; set; } = new InArgument<bool>(false);

    [DisplayName("Format String"), Description("The format string to use for parsing the date/time (e.g., 'yyyy-MM-dd').")]
    [RenderIfCondition(nameof(UseCustomFormat), true)]
    public InArgument<string> Format { get; set; }

    [DisplayName("Result DateTime"), Description("Returns the resulting DateTime value after conversion.")]
    public OutArgument<DateTime> ResultDateTime { get; set; } = new OutArgument<DateTime>();

    protected override void Execute(INodeContext context)
    {
        var status = "Success";

        try
        {
            var textToConvert = TextToConvert.Get(context);
            var useCustomFormat = UseCustomFormat.Get(context);
            var format = Format.Get(context);

            if (string.IsNullOrWhiteSpace(textToConvert))
                throw new ArgumentException("Text to Convert cannot be empty.");

            DateTime result;

            if (useCustomFormat)
            {
                if (string.IsNullOrEmpty(format))
                    throw new ArgumentException("Format String cannot be empty when using custom format.");

                result = DateTime.ParseExact(textToConvert, format, CultureInfo.InvariantCulture,
                    DateTimeStyles.None);
            }
            else
            {
                if (!DateTime.TryParse(textToConvert, out result))
                    throw new FormatException($"Cannot parse '{textToConvert}' as a DateTime.");
            }

            ResultDateTime.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text successfully converted to DateTime.");
        }
        catch (Exception ex)
        {
            status = $"Error converting text to DateTime: {ex.Message}";
            ResultDateTime.Set(context, default);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error converting text to DateTime: {ex.Message}");
        }
    }
}
