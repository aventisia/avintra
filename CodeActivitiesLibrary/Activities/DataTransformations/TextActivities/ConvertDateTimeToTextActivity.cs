using CodeActivitiesLibrary.DataTransformations.TextActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Datetime to Text")]
    [Description("Converts a datetime value into text using either a standard or custom format.")]
    public class ConvertDatetimeToTextActivity : BaseCodeActivity
    {
        #region Inputs

        [DisplayName("Datetime to Convert")]
        [Description("The datetime value to convert to text.")]
        public InArgument<object> DatetimeToConvert { get; set; }


        [DisplayName("Format to Use")]
        [Description("Specifies whether to use a standard datetime format or create a custom one.")]
        [DefaultValue(FormatOptionEnum.Standard)]
        public InArgument<FormatOptionEnum> FormatToUse { get; set; } =
            new InArgument<FormatOptionEnum>(FormatOptionEnum.Standard);


        [DisplayName("Standard Format")]
        [Description("The standard datetime format to use when displaying the datetime value.")]
        [RenderIfCondition(nameof(FormatToUse), FormatOptionEnum.Standard)]
        public InArgument<StandardFormatOptionEnum> StandardFormat { get; set; } =
            new InArgument<StandardFormatOptionEnum>(
                StandardFormatOptionEnum.ShortDate);


        [DisplayName("Custom Format")]
        [Description("A custom format string for formatting the datetime value (e.g., yyyyMMdd).")]
        [RenderIfCondition(nameof(FormatToUse), FormatOptionEnum.Custom)]
        public InArgument<string> CustomFormat { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Formatted DateTime")]
        [Description("The formatted datetime as a text value.")]
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
                    throw new ArgumentException("Datetime to Convert cannot be null.");

                DateTime datetimeToConvert;

                switch (datetimeGivenToConvert)
                {
                    case string s:
                        datetimeToConvert = DateTime.TryParse(s, out var parsedDateTime)
                            ? parsedDateTime
                            : throw new ArgumentException("Invalid datetime string format.");
                        break;
                    case DateTime dt:
                        datetimeToConvert = dt;
                        break;
                    default:
                        throw new ArgumentException("Invalid datetime string format or datetime object.");
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
                StatusMessage.Set(context, "Datetime converted successfully.");
            }
            catch (Exception ex)
            {
                FormattedDateTime.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error converting datetime: {ex.Message}");
            }
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