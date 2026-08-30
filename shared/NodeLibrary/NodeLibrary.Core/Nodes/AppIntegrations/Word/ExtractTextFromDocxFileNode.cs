using System.IO;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using NodeLibrary.WordNodes.Enums;

namespace NodeLibrary.WordNodes;

[DisplayName("Extract Text From DOCX File"), Description("Reads text content from a .docx document using Open XML SDK.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class ExtractTextFromDocxFileNode : BaseNode
{
    [DisplayName("Document Path"), Description("The full file path to the .docx document to read from.")]
    public required InArgument<string> DocumentPath { get; set; }

    [DisplayName("Retrieve"), Description("Specifies the portion of the document to retrieve.")]
    public InArgument<RetrieveOptionEnum> Retrieve { get; set; } = new InArgument<RetrieveOptionEnum>(RetrieveOptionEnum.WholeDocument);

    [DisplayName("Bookmark Name"), Description("The name of the bookmark to retrieve content from.")]
    [RenderIfCondition(nameof(Retrieve), RetrieveOptionEnum.Bookmark)]
    public InArgument<string> BookmarkName { get; set; } = new InArgument<string>();

    [DisplayName("Word Data"), Description("The value of the retrieved content.")]
    public OutArgument<string> WordData { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var documentPath = DocumentPath.Get(context);
            var retrieveOption = Retrieve.Get(context);
            var bookmarkName = retrieveOption == RetrieveOptionEnum.Bookmark
                ? BookmarkName.Get(context)
                : null;

            if (string.IsNullOrWhiteSpace(documentPath))
                throw new ArgumentException("Document path is required.");

            if (!File.Exists(documentPath))
                throw new FileNotFoundException("The specified Word document does not exist.", documentPath);

            if (retrieveOption == RetrieveOptionEnum.Bookmark && string.IsNullOrWhiteSpace(bookmarkName))
                throw new ArgumentException("Bookmark name is required when retrieving by bookmark.");

            string content = string.Empty;

            using (var wordDoc = WordprocessingDocument.Open(documentPath, isEditable: false))
            {
                switch (retrieveOption)
                {
                    case RetrieveOptionEnum.WholeDocument:
                        content = ExtractAllText(wordDoc);
                        break;

                    case RetrieveOptionEnum.Pages:
                        throw new NotSupportedException(
                            "Page-based retrieval is not supported in Open XML. " +
                            "Use 'Whole Document' or 'Bookmark' instead.");

                    case RetrieveOptionEnum.Bookmark:
                        content = ExtractBookmarkText(wordDoc, bookmarkName!);
                        break;

                    default:
                        throw new ArgumentException("Invalid Retrieve option.");
                }
            }

            WordData.Set(context, content);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Read from Word document successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading from Word document: {ex.Message}");
        }
    }

    private static string ExtractAllText(WordprocessingDocument doc)
    {
        var body = doc.MainDocumentPart?.Document?.Body;
        if (body == null) return string.Empty;

        return string.Join("", body.Descendants<DocumentFormat.OpenXml.Wordprocessing.Text>()
            .Select(t => t.Text ?? string.Empty));
    }

    private static string ExtractBookmarkText(WordprocessingDocument doc, string bookmarkName)
    {
        var mainPart = doc.MainDocumentPart;
        if (mainPart?.Document?.Body == null) return string.Empty;

        var bookmarkStart = mainPart.Document.Body.Descendants<BookmarkStart>()
            .FirstOrDefault(b => b.Name?.Value == bookmarkName);

        if (bookmarkStart == null)
            throw new ArgumentException($"Bookmark '{bookmarkName}' not found in the document.");

        var textParts = new System.Text.StringBuilder();
        var current = bookmarkStart.NextSibling();

        while (current != null)
        {
            if (current is BookmarkEnd be && be.Id?.Value == bookmarkStart.Id?.Value)
                break;

            if (current is DocumentFormat.OpenXml.Wordprocessing.Text t)
                textParts.Append(t.Text);

            current = current.NextSibling();
        }

        return textParts.ToString();
    }
}
