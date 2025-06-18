using CodeActivitiesLibrary.DataTransformations.TextActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Text to Number")]
    [Description("Converts a text representation of a number to a numeric value.")]
    public class ConvertTextToNumberActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Text to Convert")]
        [Description("The text value that will be converted to a numeric type.")]
        public InArgument<string> TextToConvert { get; set; }

        [RequiredArgument]
        [DisplayName("Output Type")]
        [Description("Specifies the numeric type to which the text should be converted.")]
        public InArgument<OutputTypeEnum> OutputType { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Converted Value")]
        [Description("Returns the resulting numeric value after conversion.")]
        public OutArgument<object> ConvertedValue { get; set; }

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
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text successfully converted to number.");
            }
            catch (Exception ex)
            {
                status = $"Error converting text to number: {ex.Message}";
                ConvertedValue.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error converting text to number: {ex.Message}");
            }

            StatusMessage.Set(context, status);
        }
    }
}