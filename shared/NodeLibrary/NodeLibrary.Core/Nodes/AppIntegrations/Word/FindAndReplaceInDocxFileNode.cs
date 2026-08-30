using System.IO;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace NodeLibrary.WordNodes;

[DisplayName("Find And Replace In DOCX File"), Description("Finds text and replaces it with another in a .docx document using Open XML SDK.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class FindAndReplaceInDocxFileNode : BaseNode
{
    [DisplayName("Document Path"), Description("The full file path to the .docx document.")]
    public required InArgument<string> DocumentPath { get; set; }

    [DisplayName("All Matches"), Description("Specifies whether to replace all occurrences or just the first one.")]
    public InArgument<bool> AllMatches { get; set; } = new InArgument<bool>(true);

    [DisplayName("Text to Find"), Description("The text to search for in the document.")]
    public required InArgument<string> TextToFind { get; set; }

    [DisplayName("Text to Replace With"), Description("The text to replace the found text with.")]
    public required InArgument<string> TextToReplaceWith { get; set; }

    [DisplayName("Use Regular Expressions"), Description("If enabled, 'Text to Find' is treated as a .NET regular expression.")]
    public InArgument<bool> UseRegex { get; set; } = new InArgument<bool>(false);

    [DisplayName("Save Document"), Description("Automatically saves the Word document after replacement.")]
    public InArgument<bool> SaveDocument { get; set; } = new InArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var documentPath = DocumentPath.Get(context);
            var textToFind = TextToFind.Get(context);
            var textToReplaceWith = TextToReplaceWith.Get(context) ?? string.Empty;
            var allMatches = AllMatches.Get(context);
            var useRegex = UseRegex.Get(context);
            var saveDocument = SaveDocument.Get(context);

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
        using var wordDoc = WordprocessingDocument.Open(filePath, isEditable: true);

        var body = wordDoc.MainDocumentPart?.Document?.Body;
        if (body == null || string.IsNullOrEmpty(searchText)) return;

        foreach (var paragraph in body.Descendants<Paragraph>().ToList())
        {
            var runs = paragraph.Descendants<Run>().ToList();
            if (!runs.Any()) continue;

            var textElements = runs.SelectMany(r => r.Descendants<Text>()).ToList();
            if (!textElements.Any()) continue;

            string paragraphText = string.Concat(textElements.Select(t => t.Text));

            bool containsMatch = useRegex
                ? Regex.IsMatch(paragraphText, searchText)
                : paragraphText.Contains(searchText);

            if (!containsMatch) continue;

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
                foreach (var run in runs)
                    run.Remove();

                if (updatedText.Contains("\n"))
                {
                    var lines = updatedText.Split(["\n"], StringSplitOptions.None);
                    for (int i = 0; i < lines.Length; i++)
                    {
                        var newRun = new Run();
                        var newText = new Text(lines[i]) { Space = SpaceProcessingModeValues.Preserve };
                        newRun.Append(newText);
                        paragraph.Append(newRun);

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
                    var newRun = new Run();
                    var newText = new Text(updatedText) { Space = SpaceProcessingModeValues.Preserve };
                    newRun.Append(newText);
                    paragraph.Append(newRun);
                }

                if (!replaceAll)
                    break;
            }
        }

        if (saveDocument)
            wordDoc.MainDocumentPart?.Document?.Save();
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
            .Replace("\\n", "\n")
            .Replace("\\r", "\r")
            .Replace("\\t", "\t")
            .Replace("\\\\", "\\");
    }
}
