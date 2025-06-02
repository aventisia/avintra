using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Parse Text")]
    [Description(
        "Parses a text to find the first or all occurrences of a specified subtext or regular expression pattern.")]
    public class ParseTextActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Text To Parse")]
        [Description("The text value that will be parsed based on the specified search pattern.")]
        public InArgument<string> TextToParse { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Search Pattern")]
        [Description("The subtext or regular expression pattern to search for.")]
        public InArgument<string> SearchPattern { get; set; }

        [Category("Input")]
        [DisplayName("Is Regular Expression")]
        [Description("If true, treats 'Search Pattern' as a regular expression pattern.")]
        [DefaultValue(false)]
        public InArgument<bool> IsRegularExpression { get; set; }

        [Category("Input")]
        [DisplayName("Start Parsing At Position")]
        [Description("The index at which to start parsing the text.")]
        [DefaultValue(0)]
        public InArgument<int> StartPosition { get; set; }

        [Category("Input")]
        [DisplayName("First Occurrence Only")]
        [Description("If true, returns only the first occurrence of the search pattern.")]
        [DefaultValue(true)]
        public InArgument<bool> FirstOccurrenceOnly { get; set; }

        [Category("Input")]
        [DisplayName("Ignore Case")]
        [Description("If true, performs a case-insensitive search.")]
        [DefaultValue(false)]
        public InArgument<bool> IgnoreCase { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Parsed Matches")]
        [Description("Returns the list of matches found in the text.")]
        public OutArgument<IEnumerable<string>> ParsedMatches { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var textToParse = TextToParse.Get(context);
                var searchPattern = SearchPattern.Get(context);
                var isRegex = IsRegularExpression.Get(context);
                var startPosition = StartPosition.Get(context);
                var firstOccurrenceOnly = FirstOccurrenceOnly.Get(context);
                var ignoreCase = IgnoreCase.Get(context);

                if (string.IsNullOrWhiteSpace(textToParse))
                    throw new ArgumentException("Text To Parse cannot be empty.");

                if (string.IsNullOrWhiteSpace(searchPattern))
                    throw new ArgumentException("Search Pattern cannot be empty.");

                IEnumerable<string> result;

                if (isRegex)
                {
                    var options = ignoreCase ? RegexOptions.IgnoreCase : RegexOptions.None;

                    if (firstOccurrenceOnly)
                    {
                        var match = Regex.Match(textToParse.Substring(startPosition), searchPattern, options);
                        result = match.Success ? new[] { match.Value } : Array.Empty<string>();
                    }
                    else
                    {
                        result = Regex.Matches(textToParse.Substring(startPosition), searchPattern, options)
                            .Cast<Match>()
                            .Select(m => m.Value);
                    }
                }
                else
                {
                    if (firstOccurrenceOnly)
                    {
                        var index = textToParse.IndexOf(searchPattern, startPosition,
                            ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);
                        result = index != -1
                            ? new[] { textToParse.Substring(index, searchPattern.Length) }
                            : Array.Empty<string>();
                    }
                    else
                    {
                        var matches = new List<string>();
                        var currentIndex = startPosition;
                        while (currentIndex < textToParse.Length)
                        {
                            var index = textToParse.IndexOf(searchPattern, currentIndex,
                                ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal);
                            if (index == -1)
                                break;

                            matches.Add(textToParse.Substring(index, searchPattern.Length));
                            currentIndex = index + searchPattern.Length;
                        }

                        result = matches;
                    }
                }

                ParsedMatches.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error parsing text: {ex.Message}";
                ParsedMatches.Set(context, Array.Empty<string>());
            }

            StatusMessage.Set(context, status);
        }
    }
}