using CodeActivitiesLibrary.Extensions;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Text = DocumentFormat.OpenXml.Wordprocessing.Text;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Find and Replace Words in Word Document")]
    [Description("Finds text and replaces it with another in a .docx document using Open XML SDK.")]
    [ActivityMetaData(nodeImg: "/assets/Word.svg")]
    public class FindAndReplaceInDocxFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Document Path")]
        [Description("The full file path to the .docx document.")]
        public InArgument<string> DocumentPath { get; set; }

        [DisplayName("All Matches")]
        [Description("Specifies whether to replace all occurrences or just the first one.")]
        [DefaultValue(true)]
        public InArgument<bool> AllMatches { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Find")]
        [Description("The text to search for in the document.")]
        public InArgument<string> TextToFind { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Replace With")]
        [Description("The text to replace the found text with.")]
        public InArgument<string> TextToReplaceWith { get; set; }

        [DisplayName("Use Regular Expressions")]
        [Description("If enabled, 'Text to Find' is treated as a .NET regular expression.")]
        [DefaultValue(false)]
        public InArgument<bool> UseRegex { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var documentPath = DocumentPath.Get(context);
                var textToFind = TextToFind.Get(context);
                var textToReplaceWith = TextToReplaceWith.Get(context) ?? string.Empty;
                var allMatches = AllMatches.Get(context);
                var useRegex = UseRegex.Get(context);

                if (string.IsNullOrWhiteSpace(documentPath))
                    throw new ArgumentException("Document path is required.");

                if (!File.Exists(documentPath))
                    throw new FileNotFoundException("The specified Word document does not exist.", documentPath);

                if (string.IsNullOrEmpty(textToFind))
                    throw new ArgumentException("No search text provided; no replacements performed.");

                ReplaceTextInDocument(documentPath, textToFind, textToReplaceWith, allMatches, useRegex);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text replaced successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error during find and replace: {ex.Message}");

            }
        }
        private static void ReplaceTextInDocument(string filePath, string searchText, string replaceText, bool replaceAll, bool useRegex)
        {
            using (var wordDoc = WordprocessingDocument.Open(filePath, isEditable: true))
            {
                var body = wordDoc.MainDocumentPart?.Document?.Body;
                if (body == null) return;

                bool replacedFirst = false;

                foreach (var textElement in body.Descendants<Text>().ToList())
                {
                    if (string.IsNullOrEmpty(textElement.Text)) continue;

                    string updatedText;

                    if (useRegex)
                    {
                        try
                        {
                            var regex = new Regex(searchText);
                            if (replaceAll)
                                updatedText = regex.Replace(textElement.Text, replaceText);
                            else
                                updatedText = regex.Replace(textElement.Text, replaceText, 1);
                        }
                        catch (ArgumentException regexEx)
                        {
                            throw new ArgumentException($"Invalid regular expression: {regexEx.Message}", regexEx);
                        }
                    }
                    else
                    {
                        if (replaceAll)
                        {
                            updatedText = textElement.Text.Replace(searchText, replaceText);
                        }
                        else
                        {
                            var index = textElement.Text.IndexOf(searchText, StringComparison.Ordinal);
                            if (index >= 0)
                            {
                                updatedText = textElement.Text.Substring(0, index) + replaceText +
                                              textElement.Text.Substring(index + searchText.Length);
                                replacedFirst = true;
                            }
                            else
                            {
                                updatedText = textElement.Text;
                            }
                        }
                    }

                    if (textElement.Text != updatedText)
                    {
                        textElement.Text = updatedText;
                        if (!replaceAll && !useRegex && !replacedFirst)
                        {
                            replacedFirst = true;
                        }
                    }

                    // Stop after first replacement in non-regex
                    if (!replaceAll && !useRegex && replacedFirst)
                    {
                        break;
                    }
                }
            }
        }
    }
}