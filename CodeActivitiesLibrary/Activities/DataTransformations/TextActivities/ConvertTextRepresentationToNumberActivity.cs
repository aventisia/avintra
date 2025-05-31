using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Convert Word to Number")]
    [Description("Converts specific words like 'hundred' into their numeric values.")]
    public class ConvertWordToNumberActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Text to Convert")]
        [Description("The word to convert into a numeric value.")]
        public InArgument<string> TextToConvert { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Numeric Value")]
        [Description("Returns the numeric representation of the word.")]
        public OutArgument<int> NumericValue { get; set; }

        [Category("Output")]
 
        public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            var result = 0;

            try
            {
                var input = TextToConvert.Get(context).ToLower();
// -TODO need to add more words and their numeric values or need
                switch (input)
                {
                    case "one":
                        result = 1;
                        break;

                    case "ten":
                        result = 10;
                        break;

                    case "hundred":
                        result = 100;
                        break;

                    case "thousand":
                        result = 1000;
                        break;

                    default:
                        throw new ArgumentException($"'{input}' is not a recognized number word.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error converting word to number: {ex.Message}";
                result = 0;
            }

            NumericValue.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}