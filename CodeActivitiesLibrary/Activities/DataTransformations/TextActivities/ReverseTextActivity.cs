using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Reverse Text")]
    [Description("Reverses the order of characters in a given text string.")]
    public class ReverseTextActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Original Text")]
        [Description("The original text to reverse. Example: 'Hello' → 'olleH'.")]
        public InArgument<string> OriginalText { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Reversed Text")]
        [Description("Returns the reversed version of the input text.")]
        public OutArgument<string> ReversedText { get; set; }

        [Category("Output")]
        public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var original = OriginalText.Get(context);

                if (string.IsNullOrEmpty(original))
                    throw new ArgumentException("Original text cannot be null or empty.");

                var charArray = original.ToCharArray();
                Array.Reverse(charArray);
                var reversed = new string(charArray);

                ReversedText.Set(context, reversed);
            }
            catch (Exception ex)
            {
                status = $"Error reversing text: {ex.Message}";
                ReversedText.Set(context, string.Empty);
            }

            StatusMessage.Set(context, status);
        }
    }
}