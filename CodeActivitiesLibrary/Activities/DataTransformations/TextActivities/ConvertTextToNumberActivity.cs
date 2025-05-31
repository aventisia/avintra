using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Text to Number")]
    [Description("Converts a text representation of a number to a numeric value.")]
    public class ConvertTextToNumberActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Text to Convert")]
        [Description("The text value that will be converted to a numeric type.")]
        public InArgument<string> TextToConvert { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Output Type")]
        [Description("Specifies the numeric type to which the text should be converted.")]
        public InArgument<OutputTypeEnum> OutputType { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Converted Value")]
        [Description("Returns the resulting numeric value after conversion.")]
        public OutArgument<object> ConvertedValue { get; set; }

        [Category("Output")] public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var textToConvert = TextToConvert.Get(context);
                var outputType = OutputType.Get(context);

                if (string.IsNullOrWhiteSpace(textToConvert))
                    throw new ArgumentException("Text to Convert cannot be empty.");

                object result = null;

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
            }
            catch (Exception ex)
            {
                status = $"Error converting text to number: {ex.Message}";
                ConvertedValue.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }


}