using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Number to Text")]
    [Description("Converts a numeric value into text with specified formatting options.")]
    public class ConvertNumberToTextActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Number to Convert")]
        [Description("The numeric value to convert to text.")]
        public InArgument<double> NumberToConvert { get; set; }


        [DisplayName("Decimal Places")]
        [Description("The number of decimal places to include in the formatted text.")]
        [DefaultValue(2)]
        public InArgument<int> DecimalPlaces { get; set; }


        [DisplayName("Use Thousands Separator")]
        [Description("If true, includes a thousands separator in the formatted text.")]
        [DefaultValue(true)]
        public InArgument<bool> UseThousandsSeparator { get; set; }


        [DisplayName("Formatted Number")]
        [Description("The resulting formatted number as text.")]
        public OutArgument<string> FormattedNumber { get; set; }


        protected override void Execute(CodeActivityContext context)
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
            }
            catch (Exception ex)
            {
                status = $"Error converting number to text: {ex.Message}";
                FormattedNumber.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }
}