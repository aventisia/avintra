using System;
using System.Activities;
using System.ComponentModel;
using System.Globalization;


namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Datetime to Text")]
    [Description("Converts a datetime value into text using either a standard or custom format.")]
    public class ConvertDatetimeToTextActivity : Extensions.BaseCodeActivity
    {
        #region Inputs

        [Category("Input")]
        [Description("The datetime value to convert to text.")]
        public InArgument<string> DatetimeToConvert { get; set; }

        [Category("Input")]
        [Description("Specifies whether to use a standard datetime format or create a custom one.")]
        [DefaultValue(typeof(FormatOptionEnum), "standard")]
        public FormatOptionEnum FormatToUse { get; set; }

        [Category("Input")]
        [Description("The standard datetime format to use when displaying the datetime value.")]
        [DefaultValue(typeof(StandardFormatOptionEnum), "shortDate")]
        public StandardFormatOptionEnum StandardFormat { get; set; }

        [Category("Input")]
        [Description("A custom format string for formatting the datetime value (e.g., yyyyMMdd).")]
        public InArgument<string> CustomFormat { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [Description("The formatted datetime as a text value.")]
        public OutArgument<string> ConvertedDateTime { get; set; }

        [Category("Output")] 

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            var result = "";
            var input = DatetimeToConvert.Get(context);
            try
            {
                if (string.IsNullOrWhiteSpace(input))
                {
                    ConvertedDateTime.Set(context, null);
                    return;
                }

                if (!DateTime.TryParse(input, out var parsedDateTime))
                    throw new ArgumentException($"Invalid datetime format: {input}");

                switch (FormatToUse)
                {
                    case FormatOptionEnum.Standard:
                        result = FormatStandard(parsedDateTime, StandardFormat);
                        break;
                    case FormatOptionEnum.Custom:
                        result = FormatCustom(parsedDateTime, CustomFormat.Get(context));
                        break;
                    default:
                        result = parsedDateTime.ToString(CultureInfo.InvariantCulture);
                        break;
                }
            }
            catch (Exception ex)
            {
                status = $"Error padding text: {ex.Message}";
            }

            ConvertedDateTime.Set(context, result);
            StatusMessage.Set(context, status);
        }

        private static string FormatStandard(DateTime dt, StandardFormatOptionEnum format)
        {
            switch (format)
            {
                case StandardFormatOptionEnum.ShortDate:
                    return dt.ToShortDateString();
                case StandardFormatOptionEnum.LongDate:
                    return dt.ToLongDateString();
                case StandardFormatOptionEnum.ShortTime:
                    return dt.ToShortTimeString();
                case StandardFormatOptionEnum.LongTime:
                    return dt.ToLongTimeString();
                case StandardFormatOptionEnum.FullDatetimeShortTime:
                case StandardFormatOptionEnum.FullDatetimeLongTime:
                    return dt.ToString("F");
                case StandardFormatOptionEnum.GeneralDatetimeShortTime:
                    return dt.ToString("g");
                case StandardFormatOptionEnum.GeneralDatetimeLongTime:
                    return dt.ToString("G");
                case StandardFormatOptionEnum.SortableDatetime:
                    return dt.ToString("u");
                default:
                    return dt.ToString(CultureInfo.InvariantCulture);
            }
        }

        private static string FormatCustom(DateTime dt, string format)
        {
            return string.IsNullOrEmpty(format) ? dt.ToString(CultureInfo.InvariantCulture) : dt.ToString(format);
        }
    }
}