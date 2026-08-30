using System.Globalization;

namespace NodeLibrary.DateTimeNodes;

[DisplayName("Format DateTime"), Description("Formats a DateTime value into a standard or custom string format.")]
[NodeMetadata(icon: "/assets/DateTime.svg")]
public class FormatDateTimeNode : BaseNode
{
    #region Inputs

    [DisplayName("DateTime Value"), Description("The DateTime value to format.")]
    public InArgument<object> DatetimeToConvert { get; set; } = new InArgument<object>();

    [DisplayName("Format Option"), Description("Choose whether to use a standard or custom DateTime format.")]
    public InArgument<FormatOptionEnum> FormatToUse { get; set; } = new InArgument<FormatOptionEnum>(FormatOptionEnum.Standard);

    [DisplayName("Standard Format"), Description("The standard DateTime format to use.")]
    [RenderIfCondition(nameof(FormatToUse), FormatOptionEnum.Standard)]
    public InArgument<StandardFormatOptionEnum> StandardFormat { get; set; } = new InArgument<StandardFormatOptionEnum>(StandardFormatOptionEnum.ShortDate);

    [DisplayName("Custom Format String"), Description("A custom format string for the DateTime value (e.g., yyyyMMdd). For more info on custom format strings, see: https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1")]
    [RenderIfCondition(nameof(FormatToUse), FormatOptionEnum.Custom)]
    public InArgument<string> CustomFormat { get; set; } = new InArgument<string>();

    #endregion

    #region Outputs

    [DisplayName("Formatted DateTime String"), Description("The formatted DateTime as a string.")]
    public OutArgument<string> FormattedDateTime { get; set; } = new OutArgument<string>();

    #endregion

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        string result = "";

        try
        {
            var datetimeGivenToConvert = DatetimeToConvert.Get(context);
            var formatToUse = FormatToUse.Get(context);
            var standardFormat = StandardFormat.Get(context);
            var customFormat = CustomFormat.Get(context) ?? string.Empty;

            if (datetimeGivenToConvert == null)
                throw new ArgumentException("DateTime value cannot be null.");

            DateTime datetimeToConvert;

            switch (datetimeGivenToConvert)
            {
                case string s:
                    datetimeToConvert = DateTime.TryParse(s, out var parsedDateTime)
                        ? parsedDateTime
                        : throw new ArgumentException("Invalid DateTime string format.");
                    break;
                case DateTime dt:
                    datetimeToConvert = dt;
                    break;
                default:
                    throw new ArgumentException("Invalid DateTime string format or DateTime object.");
            }

            switch (formatToUse)
            {
                case FormatOptionEnum.Standard:
                    result = FormatStandard(datetimeToConvert, standardFormat);
                    break;
                case FormatOptionEnum.Custom:
                    result = FormatCustom(datetimeToConvert, customFormat);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(formatToUse), formatToUse, "Invalid format option.");
            }

            FormattedDateTime.Set(context, result);
            status += $" DateTime formatted successfully: {result}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error formatting DateTime: {ex.Message}");
        }
    }

    public static string FormatStandard(DateTime dateTime, StandardFormatOptionEnum format)
    {
        return format switch
        {
            StandardFormatOptionEnum.ShortDate => dateTime.ToShortDateString(),
            StandardFormatOptionEnum.LongDate => dateTime.ToLongDateString(),
            StandardFormatOptionEnum.ShortTime => dateTime.ToShortTimeString(),
            StandardFormatOptionEnum.LongTime => dateTime.ToLongTimeString(),
            StandardFormatOptionEnum.FullDatetimeLongTime => dateTime.ToString("F", CultureInfo.InvariantCulture),
            StandardFormatOptionEnum.FullDatetimeShortTime => dateTime.ToString("d") + " " + dateTime.ToShortTimeString(),
            StandardFormatOptionEnum.GeneralDatetimeShortTime => dateTime.ToString("g"),
            StandardFormatOptionEnum.GeneralDatetimeLongTime => dateTime.ToString("G"),
            StandardFormatOptionEnum.SortableDatetime => dateTime.ToString("u"),
            _ => throw new ArgumentOutOfRangeException(nameof(format), format, "Invalid standard format.")
        };
    }

    public static string FormatCustom(DateTime dateTime, string customFormat)
    {
        if (string.IsNullOrWhiteSpace(customFormat))
            throw new ArgumentException("Custom format string cannot be empty or whitespace.", nameof(customFormat));

        return dateTime.ToString(customFormat);
    }

    public enum FormatOptionEnum
    {
        Standard,
        Custom
    }

    public enum StandardFormatOptionEnum
    {
        ShortDate,
        LongDate,
        ShortTime,
        LongTime,
        FullDatetimeLongTime,
        FullDatetimeShortTime,
        GeneralDatetimeShortTime,
        GeneralDatetimeLongTime,
        SortableDatetime
    }
}
