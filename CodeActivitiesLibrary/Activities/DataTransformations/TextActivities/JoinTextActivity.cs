using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.DataTransformations.TextActivities
{
    [DisplayName("Join Text")]
    [Description("Converts a list into a text value by separating its items with a specified delimiter.")]
    public class JoinTextActivity : CodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Text List")]
        [Description("The list of strings to join.")]
        public InArgument<IEnumerable<string>> TextList { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Delimiter Type")]
        [Description("Specifies how to separate the items in the list.")]
        public InArgument<StringJoinDelimiterTypeEnum> DelimiterType { get; set; }

        [Category("Input")]
        [DisplayName("Standard Delimiter")]
        [Description("The standard delimiter to use when 'Delimiter Type' is 'Standard'.")]
        [RenderIfCondition(nameof(DelimiterType), "Standard")]
        public InArgument<StandardStringJoinDelimiterEnum> StandardDelimiter { get; set; }

        [Category("Input")]
        [DisplayName("Custom Delimiter")]
        [Description("The custom delimiter to use when 'Delimiter Type' is 'Custom'.")]
        [RenderIfCondition(nameof(DelimiterType), "Custom")]
        public InArgument<string> CustomDelimiter { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Joined Text")]
        [Description("Returns the resulting joined text after applying the delimiter.")]
        public OutArgument<string> JoinedText { get; set; }

        [Category("Output")] public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var textList = TextList.Get(context);
                var delimiterType = DelimiterType.Get(context);

                if (textList == null)
                    throw new ArgumentException("Text List cannot be null.");

                string delimiter;

                switch (delimiterType)
                {
                    case StringJoinDelimiterTypeEnum.Standard:
                        var standardDelimiter = StandardDelimiter.Get(context);

                        switch (standardDelimiter)
                        {
                            case StandardStringJoinDelimiterEnum.None:
                                delimiter = string.Empty;
                                break;

                            case StandardStringJoinDelimiterEnum.Comma:
                                delimiter = ",";
                                break;

                            case StandardStringJoinDelimiterEnum.Semicolon:
                                delimiter = ";";
                                break;

                            case StandardStringJoinDelimiterEnum.Pipe:
                                delimiter = "|";
                                break;

                            default:
                                throw new ArgumentException("Invalid Standard Delimiter.");
                        }

                        break;

                    case StringJoinDelimiterTypeEnum.Custom:
                        var customDelimiter = CustomDelimiter.Get(context);

                        if (string.IsNullOrWhiteSpace(customDelimiter))
                            throw new ArgumentException("Custom Delimiter cannot be empty.");

                        delimiter = customDelimiter;
                        break;

                    default:
                        throw new ArgumentException("Invalid Delimiter Type.");
                }

                var result = string.Join(delimiter, textList);
                JoinedText.Set(context, result);
            }
            catch (Exception ex)
            {
                status = $"Error joining text: {ex.Message}";
                JoinedText.Set(context, string.Empty);
            }

            StatusMessage.Set(context, status);
        }
    }
}