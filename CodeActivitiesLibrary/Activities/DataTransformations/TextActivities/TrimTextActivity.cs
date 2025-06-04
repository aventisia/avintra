using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Trim Text")]
    [Description("Removes specified characters from the start, end, or both ends of a text string.")]
    public class TrimTextActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Original Text")]
        [Description("The original text from which characters will be trimmed.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument]
        [DisplayName("Trim Mode")]
        [Description("Specifies whether to trim characters from the beginning, end, or both sides of the text.")]
        [DefaultValue(TrimModeEnum.TrimBoth)]
        public InArgument<TrimModeEnum> TrimMode { get; set; }

        [RequiredArgument]
        [DisplayName("What to Trim")]
        [Description(
            "A string containing the characters to remove. Leave empty to trim only whitespace (space, tab, newline).")]
        public InArgument<string> CharactersToTrim { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Trimmed Text")]
        [Description("The resulting text after trimming.")]
        public OutArgument<string> TrimmedText { get; set; }




        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var originalText = OriginalText.Get(context);
                var trimModeEnum = TrimMode.Get(context);
                var charsToTrim = CharactersToTrim.Get(context);

                if (string.IsNullOrEmpty(originalText))
                    throw new ArgumentException("OriginalText cannot be null or empty.");

                var trimChars = string.IsNullOrEmpty(charsToTrim)
                    ? new[] { ' ', '\t', '\n', '\r' } // Default: whitespace
                    : charsToTrim.ToCharArray().Distinct().ToArray();

                string result;

                switch (trimModeEnum)
                {
                    case TrimModeEnum.TrimStart:
                        result = originalText.TrimStart(trimChars);
                        break;

                    case TrimModeEnum.TrimEnd:
                        result = originalText.TrimEnd(trimChars);
                        break;

                    case TrimModeEnum.TrimBoth:
                        result = originalText.Trim(trimChars);
                        break;

                    default:
                        throw new InvalidOperationException("Unsupported TrimMode.");
                }

                TrimmedText.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error trimming text: {ex.Message}";
                TrimmedText.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }
    }
}