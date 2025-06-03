using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Datetime to Text")]
    [Description("Converts a datetime value into text using either a standard or custom format.")]
    public class ConvertDatetimeToTextActivity : Extensions.BaseCodeActivity
    {
        #region Inputs


        [DisplayName("Datetime to Convert")]
        [Description("The datetime value to convert to text.")]
        public InArgument<DateTime> DatetimeToConvert { get; set; }


        [DisplayName("Format to Use")]
        [Description("Specifies whether to use a standard datetime format or create a custom one.")]
        [DefaultValue(FormatOptionEnum.Standard)]
        public FormatOptionEnum FormatToUse { get; set; } = FormatOptionEnum.Standard;


        [DisplayName("Standard Format")]
        [Description("The standard datetime format to use when displaying the datetime value.")]
        [RenderIfCondition(nameof(FormatToUse), "Standard")]
        public StandardFormatOptionEnum StandardFormat { get; set; } = StandardFormatOptionEnum.ShortDate;


        [DisplayName("Custom Format")]
        [Description("A custom format string for formatting the datetime value (e.g., yyyyMMdd).")]
        [RenderIfCondition(nameof(FormatToUse), "Custom")]
        public InArgument<string> CustomFormat { get; set; }

        #endregion

        #region Outputs


        [DisplayName("Formatted DateTime")]
        [Description("The formatted datetime as a text value.")]
        public OutArgument<string> FormattedDateTime { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            var result = "";

            try
            {
                // Get inputs
                var datetimeToConvert = DatetimeToConvert.Get(context); // Already a DateTime
                var formatToUse = FormatToUse;
                var standardFormat = StandardFormat;
                var customFormat = CustomFormat.Get(context);

                // Validate inputs
                if (datetimeToConvert == null)
                    throw new ArgumentException("Datetime to Convert cannot be null.");

                // Format based on selected option
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
            }
            catch (Exception ex)
            {
                status = $"Error converting datetime: {ex.Message}";
            }

            // Set outputs
            FormattedDateTime.Set(context, result);
            StatusMessage.Set(context, status);

            Console.WriteLine($"Status: {status}");
            Console.WriteLine($"Formatted DateTime: {result}");
        }

        private static string FormatStandard(DateTime dateTime, StandardFormatOptionEnum format)
        {
            switch (format)
            {
                case StandardFormatOptionEnum.ShortDate:
                    return dateTime.ToShortDateString();
                case StandardFormatOptionEnum.LongDate:
                    return dateTime.ToLongDateString();
                case StandardFormatOptionEnum.ShortTime:
                    return dateTime.ToShortTimeString();
                case StandardFormatOptionEnum.LongTime:
                    return dateTime.ToLongTimeString();
                case StandardFormatOptionEnum.FullDatetimeShortTime:
                    return dateTime.ToString("F");
                case StandardFormatOptionEnum.GeneralDatetimeShortTime:
                    return dateTime.ToString("g");
                case StandardFormatOptionEnum.GeneralDatetimeLongTime:
                    return dateTime.ToString("G");
                case StandardFormatOptionEnum.SortableDatetime:
                    return dateTime.ToString("u");
                default:
                    throw new ArgumentOutOfRangeException(nameof(format), format, "Invalid standard format.");
            }
        }

        private static string FormatCustom(DateTime dateTime, string customFormat)
        {
            if (string.IsNullOrWhiteSpace(customFormat))
                throw new ArgumentException("Custom format cannot be empty or whitespace.");

            return dateTime.ToString(customFormat);
        }
    }

}