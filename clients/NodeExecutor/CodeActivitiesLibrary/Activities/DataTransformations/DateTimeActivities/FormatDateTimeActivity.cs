using CodeActivitiesLibrary.DataTransformations.TextActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Globalization;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Format DateTime")]
    [Description("Formats a DateTime value into a standard or custom string format.")]
    [ActivityMetaData(nodeImg:"/assets/DateTime.svg")]
    public class FormatDateTimeActivity : BaseCodeActivity
    {
        #region Inputs

        [DisplayName("DateTime Value")]
        [Description("The DateTime value to format.")]
        public InArgument<object> DatetimeToConvert { get; set; }

        [DisplayName("Format Option")]
        [Description("Choose whether to use a standard or custom DateTime format.")]
        [DefaultValue(FormatOptionEnum.Standard)]
        public InArgument<FormatOptionEnum> FormatToUse { get; set; } =
            new InArgument<FormatOptionEnum>(FormatOptionEnum.Standard);

        [DisplayName("Standard Format")]
        [Description("The standard DateTime format to use.")]
        [RenderIfCondition(nameof(FormatToUse), FormatOptionEnum.Standard)]
        public InArgument<StandardFormatOptionEnum> StandardFormat { get; set; } =
            new InArgument<StandardFormatOptionEnum>(
                StandardFormatOptionEnum.ShortDate);

        [DisplayName("Custom Format String")]
        [Description("A custom format string for the DateTime value (e.g., yyyyMMdd). For more info on custom format strings, see: https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1")]
        [RenderIfCondition(nameof(FormatToUse), FormatOptionEnum.Custom)]
        public InArgument<string> CustomFormat { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Formatted DateTime String")]
        [Description("The formatted DateTime as a string.")]
        public OutArgument<string> FormattedDateTime { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            string result = "";
            try
            {
                // Get inputs
                var datetimeGivenToConvert = DatetimeToConvert.Get(context);
                var formatToUse = FormatToUse.Get(context);
                var standardFormat = StandardFormat.Get(context);
                var customFormat = CustomFormat.Get(context);

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

                // Format
                switch (formatToUse)
                {
                    case FormatOptionEnum.Standard:
                        result = FormatStandard(datetimeToConvert, standardFormat);
                        break;
                    case FormatOptionEnum.Custom:
                        result = FormatCustom(datetimeToConvert, customFormat);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(nameof(formatToUse), formatToUse,
                            "Invalid format option.");
                }

                // Set success outputs
                FormattedDateTime.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "DateTime formatted successfully.");
            }
            catch (Exception ex)
            {
                FormattedDateTime.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error formatting DateTime: {ex.Message}");
            }
        }

        public static string FormatStandard(DateTime dateTime, StandardFormatOptionEnum format)
        {
            switch (format)
            {
                case StandardFormatOptionEnum.ShortDate:
                    return dateTime.ToShortDateString(); // e.g., 4/6/2024
                case StandardFormatOptionEnum.LongDate:
                    return dateTime.ToLongDateString(); // e.g., Saturday, April 6, 2024
                case StandardFormatOptionEnum.ShortTime:
                    return dateTime.ToShortTimeString(); // e.g., 3:45 PM
                case StandardFormatOptionEnum.LongTime:
                    return dateTime.ToLongTimeString(); // e.g., 3:45:12 PM
                case StandardFormatOptionEnum.FullDatetimeLongTime:
                    return dateTime.ToString("F", CultureInfo.InvariantCulture); // e.g., Saturday, April 06, 2024 3:45:12 PM
                case StandardFormatOptionEnum.FullDatetimeShortTime:
                    return dateTime.ToString("d") + " " + dateTime.ToShortTimeString(); // e.g., 4/6/2024 3:45 PM
                case StandardFormatOptionEnum.GeneralDatetimeShortTime:
                    return dateTime.ToString("g"); // e.g., 4/6/2024 3:45 PM
                case StandardFormatOptionEnum.GeneralDatetimeLongTime:
                    return dateTime.ToString("G"); // e.g., 4/6/2024 3:45:12 PM
                case StandardFormatOptionEnum.SortableDatetime:
                    return dateTime.ToString("u"); // e.g., 2024-04-06 15:45:12Z
                default:
                    throw new ArgumentOutOfRangeException(nameof(format), format, "Invalid standard format.");
            }
        }

        public static string FormatCustom(DateTime dateTime, string customFormat)
        {
            if (string.IsNullOrWhiteSpace(customFormat))
                throw new ArgumentException("Custom format string cannot be empty or whitespace.", nameof(customFormat));

            return dateTime.ToString(customFormat);
        }
    }
}