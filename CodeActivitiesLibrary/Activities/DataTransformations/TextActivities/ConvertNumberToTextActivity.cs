using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Number to Text")]
    [Description("Converts a numeric value into text with specified formatting options.")]
    public class ConvertNumberToTextActivity : CodeActivity
    {
        [Category("Input")]
        [Description("A numeric value to convert to text.")]
        public InArgument<string> NumberToConvert { get; set; }

        [Category("Input")]
        [Description(
            "The number of decimal places that will be included before truncation. Zeros can also be added to the end to pad the text in this way.")]
        public InArgument<int> DecimalPlaces { get; set; } = new InArgument<int>(2);

        [Category("Input")]
        [Description("Specify whether or not to use punctuation as a thousand separator.")]
        public InArgument<bool> UseThousandsSeparator { get; set; } = new InArgument<bool>(true);


        [Category("Output")]
        [Description("The formatted number as text.")]
        public OutArgument<string> OFormattedNumberOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var input = NumberToConvert.Get(context);
            if (string.IsNullOrWhiteSpace(input))
            {
                OFormattedNumberOutput.Set(context, null);
                return;
            }

            if (!double.TryParse(input, out var number)) throw new ArgumentException($"Invalid numeric value: {input}");

            var decimalPlaces = DecimalPlaces.Get(context);
            var useThousandsSeparator = UseThousandsSeparator.Get(context);

            var format = useThousandsSeparator ? "N" : "F";

            if (decimalPlaces >= 0) format += decimalPlaces.ToString();

            var result = number.ToString(format);
            OFormattedNumberOutput.Set(context, result);
        }
    }
}