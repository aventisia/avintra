using CodeActivitiesLibrary.Extensions;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Find and Replace in DOCX file")]
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

        [DisplayName("Save Document")]
        [Description("Automatically saves the Word document after replacement.")]
        public InArgument<bool> SaveDocument { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var documentPath = DocumentPath.Get(context);
                var textToFind = TextToFind.Get(context);
                var textToReplaceWith = TextToReplaceWith.Get(context) ?? string.Empty;
                var allMatches = AllMatches.Get(context);
                var useRegex = UseRegex.Get(context);
                var saveDocument = SaveDocument.Expression == null ? true : SaveDocument.Get(context);

                if (string.IsNullOrWhiteSpace(documentPath))
                    throw new ArgumentException("Document path is required.");

                if (!File.Exists(documentPath))
                    throw new FileNotFoundException("The specified Word document does not exist.", documentPath);

                if (string.IsNullOrEmpty(textToFind))
                    throw new ArgumentException("No search text provided; no replacements performed.");

                // Process escape sequences in replacement text
                textToReplaceWith = UnescapeString(textToReplaceWith);

                ReplaceTextInDocument(documentPath, textToFind, textToReplaceWith, allMatches, useRegex, saveDocument);

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text replaced successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error during find and replace: {ex.Message}");

            }
        }
        
        private static void ReplaceTextInDocument(string filePath, string searchText, string replaceText, bool replaceAll, bool useRegex, bool saveDocument)
        {
            using (var wordDoc = WordprocessingDocument.Open(filePath, isEditable: true))
            {
                var body = wordDoc.MainDocumentPart?.Document?.Body;
                if (body == null || string.IsNullOrEmpty(searchText)) return;

                // Work at the paragraph level to handle text split across runs
                foreach (var paragraph in body.Descendants<Paragraph>().ToList())
                {
                    var runs = paragraph.Descendants<Run>().ToList();
                    if (!runs.Any()) continue;

                    // Get all text elements in this paragraph
                    var textElements = runs.SelectMany(r => r.Descendants<Text>()).ToList();
                    if (!textElements.Any()) continue;

                    // Concatenate all text in the paragraph
                    string paragraphText = string.Concat(textElements.Select(t => t.Text));

                    // Check if search text exists
                    bool containsMatch = useRegex
                        ? Regex.IsMatch(paragraphText, searchText)
                        : paragraphText.Contains(searchText);

                    if (!containsMatch) continue;

                    // Perform replacement on concatenated text
                    string updatedText;
                    if (useRegex)
                    {
                        var regex = new Regex(searchText);
                        updatedText = replaceAll
                            ? regex.Replace(paragraphText, replaceText)
                            : regex.Replace(paragraphText, replaceText, 1);
                    }
                    else
                    {
                        updatedText = replaceAll
                            ? paragraphText.Replace(searchText, replaceText)
                            : ReplaceFirstOccurrence(paragraphText, searchText, replaceText);
                    }

                    if (paragraphText != updatedText)
                    {
                        // Clear existing runs
                        foreach (var run in runs)
                        {
                            run.Remove();
                        }

                        // Handle newlines by creating separate runs with breaks
                        if (updatedText.Contains("\n"))
                        {
                            var lines = updatedText.Split(new[] { "\n" }, StringSplitOptions.None);
                            for (int i = 0; i < lines.Length; i++)
                            {
                                var newRun = new Run();
                                var newText = new Text(lines[i])
                                {
                                    Space = SpaceProcessingModeValues.Preserve
                                };
                                newRun.Append(newText);
                                paragraph.Append(newRun);

                                // Add line break after each line except the last
                                if (i < lines.Length - 1)
                                {
                                    var breakRun = new Run();
                                    breakRun.Append(new Break());
                                    paragraph.Append(breakRun);
                                }
                            }
                        }
                        else
                        {
                            // No newlines, just add as single run
                            var newRun = new Run();
                            var newText = new Text(updatedText)
                            {
                                Space = SpaceProcessingModeValues.Preserve
                            };
                            newRun.Append(newText);
                            paragraph.Append(newRun);
                        }

                        if (!replaceAll)
                            break;
                    }
                }

                if (saveDocument)
                {
                    wordDoc.MainDocumentPart.Document.Save();
                }
            }
        }

        private static string ReplaceFirstOccurrence(string text, string searchText, string replaceText)
        {
            var index = text.IndexOf(searchText, StringComparison.Ordinal);
            if (index < 0) return text;

            return text.Substring(0, index) + replaceText + text.Substring(index + searchText.Length);
        }

        private static string UnescapeString(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;

            return input
                .Replace("\\n", "\n")   // Newline
                .Replace("\\r", "\r")   // Carriage return
                .Replace("\\t", "\t")   // Tab
                .Replace("\\\\", "\\");  // Backslash (must be last)
        }
    }
}