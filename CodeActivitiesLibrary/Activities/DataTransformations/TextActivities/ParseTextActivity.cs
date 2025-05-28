using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Parse Text"),
     Description(
         "Parses a text to find the first or all occurrences of a specified subtext or regular expression pattern.")]
    public class ParseTextActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument, Category("Input"), DisplayName("Text To Parse"), Description("The text to parse.")]
        public InArgument<string> TextToParse { get; set; }

        [RequiredArgument, Category("Input"), DisplayName("Search Pattern"),
         Description("The subtext or regular expression pattern to search for.")]
        public InArgument<string> SearchPattern { get; set; }

        [Category("Input"), DisplayName("Find All Occurrences"),
         Description("Specifies whether to find all occurrences or just the first one.")]
        public InArgument<bool> FindAllOccurrences { get; set; } = new InArgument<bool>(false);

        [Category("Output"), DisplayName("Result Matches"),
         Description("The resulting list of matches or the first match found.")]
        public OutArgument<IEnumerable<string>> ResultMatches { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var textToParse = TextToParse.Get(context);
                var searchPattern = SearchPattern.Get(context);
                var findAllOccurrences = FindAllOccurrences.Get(context);

                if (string.IsNullOrWhiteSpace(textToParse))
                    throw new ArgumentException("TextToParse cannot be empty.");

                if (string.IsNullOrWhiteSpace(searchPattern))
                    throw new ArgumentException("SearchPattern cannot be empty.");

                IEnumerable<string> result;
                if (Regex.IsMatch(searchPattern, @"[\^$.|?*+(){}[\]]"))
                {
                    var regex = new Regex(searchPattern);
                    if (findAllOccurrences)
                    {
                        result = regex.Matches(textToParse).Cast<Match>().Select(m => m.Value);
                    }
                    else
                    {
                        var match = regex.Match(textToParse);
                        result = match.Success ? new[] { match.Value } : Array.Empty<string>();
                    }
                }
                else
                {
                    if (findAllOccurrences)
                    {
                        result = textToParse.Split(new[] { searchPattern }, StringSplitOptions.None);
                    }
                    else
                    {
                        var index = textToParse.IndexOf(searchPattern);
                        result = index != -1 ? new[] { textToParse.Substring(index, searchPattern.Length) } : Array.Empty<string>();
                    }
                }

                ResultMatches.Set(context, result);
                StatusMessage.Set(context, "Parsing completed successfully.");
            }
            catch (Exception ex)
            {
                ResultMatches.Set(context, Array.Empty<string>());
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }
    }
}
