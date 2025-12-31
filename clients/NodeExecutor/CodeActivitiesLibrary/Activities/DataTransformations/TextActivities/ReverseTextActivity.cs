using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Reverse Text")]
    [Description("Reverses the order of characters in a given text string.")]
    [ActivityMetaData(nodeImg: "/assets/Text.svg")]
    public class ReverseTextActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Original Text")]
        [Description("The original text to reverse. Example: 'Hello' → 'olleH'.")]
        public InArgument<string> OriginalText { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Reversed Text")]
        [Description("Returns the reversed version of the input text.")]
        public OutArgument<string> ReversedText { get; set; }


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
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Reversed text successfully.");
            }
            catch (Exception ex)
            {
                ReversedText.Set(context, string.Empty);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reversing text: {ex.Message}");

            }

            StatusMessage.Set(context, status);
        }
    }
}