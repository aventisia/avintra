namespace NodeLibrary.DataTransformations.TextActivities;

using NodeLibrary.DataTransformations.TextActivities.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

[DisplayName("Parse Text"), Description("Parses a text to find the first or all occurrences of a specified subtext or regular expression pattern.")]
[NodeMetadata(icon: "/assets/Text.svg")]
public class ParseTextNode : BaseNode
{
    [DisplayName("Text To Parse"), Description("The text value that will be parsed based on the specified search pattern.")]
    public required InArgument<string> TextToParse { get; set; }

    [DisplayName("Search Pattern"), Description("The subtext or regular expression pattern to search for.")]
    public required InArgument<string> SearchPattern { get; set; }

    [DisplayName("Is Regular Expression"), Description("If true, treats 'Search Pattern' as a regular expression pattern.")]
    public InArgument<bool> IsRegularExpression { get; set; } = new InArgument<bool>(false);

    [DisplayName("Start Parsing At Position"), Description("The index at which to start parsing the text.")]
    public InArgument<int> StartPosition { get; set; } = new InArgument<int>(0);

    [DisplayName("First Occurrence Only"), Description("If true, returns only the first occurrence of the search pattern.")]
    public InArgument<bool> FirstOccurrenceOnly { get; set; } = new InArgument<bool>(true);

    [DisplayName("Ignore Case"), Description("If true, performs a case-insensitive search.")]
    public InArgument<bool> IgnoreCase { get; set; } = new InArgument<bool>(false);

    [DisplayName("Parsed Matches"), Description("Returns the list of matches found in the text.")]
    public OutArgument<IEnumerable<string>> ParsedMatches { get; set; } = new OutArgument<IEnumerable<string>>();

    protected override void Execute(INodeContext context)
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
                    result = match.Success ? [match.Value] : [];
                }
                else
                {
                    result = [..Regex.Matches(textToParse.Substring(startPosition), searchPattern, options)
                        .Cast<Match>()
                        .Select(m => m.Value)];
                }
            }
            else
            {
                var comparison = ignoreCase ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;
                var index = startPosition;
                var matches = new List<string>();

                while (index < textToParse.Length)
                {
                    var foundIndex = textToParse.IndexOf(searchPattern, index, comparison);

                    if (foundIndex == -1)
                        break;

                    matches.Add(searchPattern);

                    if (firstOccurrenceOnly)
                        break;

                    index = foundIndex + searchPattern.Length;
                }

                result = matches;
            }

            ParsedMatches.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Parsed text successfully. Found {result.Count()} match(es).");
        }
        catch (Exception ex)
        {
            ParsedMatches.Set(context, []);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error parsing text: {ex.Message}");
        }
    }
}
