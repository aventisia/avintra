using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Replace Text")]
    [Description(
        "Replaces all occurrences of a specified subtext with another text. It can also be used with regular expressions.")]
    public class ReplaceTextActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Original Text")]
        [Description("The original text to modify.")]
        public InArgument<string> OriginalText { get; set; }

        [RequiredArgument]
        [DisplayName("Search Pattern")]
        [Description("The subtext or regular expression pattern to replace.")]
        public InArgument<string> SearchPattern { get; set; }

        [RequiredArgument]
        [DisplayName("Replacement Text")]
        [Description("The replacement text.")]
        public InArgument<string> ReplacementText { get; set; }


        [DisplayName("Use Regular Expressions")]
        [Description("If true, treats 'Search Pattern' as a regular expression.")]
        [DefaultValue(false)]
        public InArgument<bool> UseRegex { get; set; }


        [DisplayName("Ignore Case")]
        [Description("If true, performs a case-insensitive search.")]
        [DefaultValue(false)]
        public InArgument<bool> IgnoreCase { get; set; }


        [DisplayName("Activate Escape Sequences")]
        [Description("If true, interprets escape sequences in the replacement text.")]
        [DefaultValue(false)]
        public InArgument<bool> ActivateEscapeSequences { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Replaced Text")]
        [Description("The resulting text after replacement.")]
        public OutArgument<string> ReplacedText { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var originalText = OriginalText.Get(context);
                var searchPattern = SearchPattern.Get(context);
                var replacementText = ReplacementText.Get(context);
                var useRegex = UseRegex.Get(context);
                var ignoreCase = IgnoreCase.Get(context);
                var activateEscapeSequences = ActivateEscapeSequences.Get(context);

                if (string.IsNullOrWhiteSpace(originalText))
                    throw new ArgumentException("Original Text cannot be empty.");

                if (string.IsNullOrWhiteSpace(searchPattern))
                    throw new ArgumentException("Search Pattern cannot be empty.");

                string result;

                if (useRegex)
                {
                    var options = ignoreCase ? RegexOptions.IgnoreCase : RegexOptions.None;

                    // Handle escape sequences if needed
                    if (activateEscapeSequences) replacementText = Regex.Unescape(replacementText);

                    result = Regex.Replace(originalText, searchPattern, replacementText, options);
                }
                else
                {
                    // Handle case sensitivity
                    if (ignoreCase)
                    {
                        var index = 0;
                        result = originalText;

                        while ((index = result.IndexOf(searchPattern, index, StringComparison.OrdinalIgnoreCase)) != -1)
                        {
                            result = result.Substring(0, index) + replacementText +
                                     result.Substring(index + searchPattern.Length);
                            index += replacementText.Length;
                        }
                    }
                    else
                    {
                        result = originalText.Replace(searchPattern, replacementText);
                    }
                }

                ReplacedText.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Replaced text successfully.");
            }
            catch (Exception ex)
            {
                ReplacedText.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error replacing text: {ex.Message}");
            }

            StatusMessage.Set(context, status);
        }
    }
}