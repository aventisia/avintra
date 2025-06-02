using System;
using System.Activities;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text.RegularExpressions;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Split Text")]
    [Description(
        "Creates a list containing the substrings of a text that is separated by a specified delimiter or regular expression.")]
    public class SplitTextActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Text to Split")]
        [Description("The text value that will be split into parts based on the specified delimiter or pattern.")]
        public InArgument<string> TextToSplit { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Delimiter Type")]
        [Description("Specifies how to split the text.")]
        public InArgument<DelimiterTypeEnum> DelimiterType { get; set; }

        [Category("Input")]
        [DisplayName("Standard Delimiter")]
        [Description("The standard delimiter to use when 'Delimiter Type' is 'Standard'.")]
        [RenderIfCondition(nameof(DelimiterType), nameof(DelimiterTypeEnum.Standard))]
        public InArgument<StandardDelimiterEnum> StandardDelimiter { get; set; }

        [Category("Input")]
        [DisplayName("Times")]
        [Description("The number of times to split the text using the standard delimiter.")]
        [RenderIfCondition(nameof(DelimiterType), nameof(DelimiterTypeEnum.Standard))]
        public InArgument<int> Times { get; set; }

        [Category("Input")]
        [DisplayName("Split Width")]
        [Description("The width of each substring when 'Delimiter Type' is 'Number of Characters'.")]
        [RenderIfCondition(nameof(DelimiterType), nameof(DelimiterTypeEnum.NumberOfCharacters))]
        public InArgument<int> SplitWidth { get; set; }

        [Category("Input")]
        [DisplayName("Custom Delimiter")]
        [Description("The custom delimiter to use when 'Delimiter Type' is 'Custom'.")]
        [RenderIfCondition(nameof(DelimiterType), nameof(DelimiterTypeEnum.Custom))]
        public InArgument<string> CustomDelimiter { get; set; }

        [Category("Input")]
        [DisplayName("Is Regular Expression")]
        [Description("Indicates whether the custom delimiter is a regular expression pattern.")]
        [RenderIfCondition(nameof(DelimiterType), nameof(DelimiterTypeEnum.Custom))]
        public InArgument<bool> IsRegularExpression { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Text List")]
        [Description("Returns the list of substrings after splitting the original text.")]
        public OutArgument<IList> TextList { get; set; }

        [Category("Output")]
        

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var textToSplit = TextToSplit.Get(context);
                var delimiterType = DelimiterType.Get(context);

                if (string.IsNullOrWhiteSpace(textToSplit))
                    throw new ArgumentException("Text to Split cannot be empty.");

                List<string> result = null;

                switch (delimiterType)
                {
                    case DelimiterTypeEnum.Standard:
                        var standardDelimiter = StandardDelimiter.Get(context);
                        var times = Times.Get(context);

                        switch (standardDelimiter)
                        {
                            case StandardDelimiterEnum.Tab:
                                result = textToSplit.Split(new[] { '\t' }, times).ToList();
                                break;
                            case StandardDelimiterEnum.NewLine:
                                result = textToSplit.Split(new[] { '\r', '\n' }, times,
                                    StringSplitOptions.RemoveEmptyEntries).ToList();
                                break;
                            default:
                                throw new ArgumentException("Invalid Standard Delimiter.");
                        }

                        break;

                    case DelimiterTypeEnum.NumberOfCharacters:
                        var splitWidth = SplitWidth.Get(context);

                        if (splitWidth <= 0)
                            throw new ArgumentException("Split Width must be greater than zero.");

                        result = SplitByCharacterWidth(textToSplit, splitWidth);
                        break;

                    case DelimiterTypeEnum.Custom:
                        var customDelimiter = CustomDelimiter.Get(context);
                        var isRegex = IsRegularExpression.Get(context);

                        if (string.IsNullOrEmpty(customDelimiter))
                            throw new ArgumentException("Custom Delimiter cannot be empty.");

                        result = isRegex
                            ? Regex.Split(textToSplit, customDelimiter).ToList()
                            : textToSplit.Split(new[] { customDelimiter }, StringSplitOptions.None).ToList();

                        break;

                    default:
                        throw new ArgumentException("Invalid Delimiter Type.");
                }

                TextList.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error splitting text: {ex.Message}";
                TextList.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }

        private static List<string> SplitByCharacterWidth(string text, int width)
        {
            var result = new List<string>();
            var index = 0;

            while (index < text.Length)
            {
                var length = Math.Min(width, text.Length - index);
                result.Add(text.Substring(index, length));
                index += length;
            }

            return result;
        }
    }
}