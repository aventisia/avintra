using NodeLibrary.WordNodes.Enums;
using NodeLibrary.Office;

namespace NodeLibrary.WordNodes;

[DisplayName("Write To Word Document"), Description("Writes or appends text to a Word file.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class WriteToWordDocumentNode : BaseNode
{
    [DisplayName("Word Instance"), Description("The specific Word instance to use.")]
    public required InArgument<object> WordInstance { get; set; }

    [DisplayName("Text to Write"), Description("The text to be written or appended to the Word document.")]
    public required InArgument<string> TextToWrite { get; set; }

    [DisplayName("Append New Line"), Description("Specifies whether to append a new line after the text.")]
    public InArgument<bool> AppendNewLine { get; set; } = new InArgument<bool>(true);

    [DisplayName("Write Text To"), Description("Specifies the location in the Word document where the text should be written.")]
    public InArgument<WriteLocationEnum> WriteTextTo { get; set; } = new InArgument<WriteLocationEnum>(WriteLocationEnum.BeginningOfWordFile);

    [DisplayName("Bookmark Name"), Description("The name of the bookmark to use when writing before or after a bookmark.")]
    [RenderIfCondition(nameof(WriteTextTo), WriteLocationEnum.BeforeBookmark)]
    [RenderIfOperator(LogicalOperatorEnum.OR)]
    [RenderIfCondition(nameof(WriteTextTo), WriteLocationEnum.AfterBookmark)]
    public InArgument<string> BookmarkName { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var wordAppArg = WordInstance.Get(context);
            var textToWrite = TextToWrite.Get(context);
            var appendNewLine = AppendNewLine.Get(context);
            var writeLocation = WriteTextTo.Get(context);
            var bookmarkName = BookmarkName.Get(context);

            if (wordAppArg == null)
                throw new InvalidOperationException("No active Word document found.");

            dynamic wordApp = wordAppArg;

            if (wordApp.Documents.Count == 0)
                throw new InvalidOperationException("No active Word document found.");

            if ((writeLocation == WriteLocationEnum.BeforeBookmark || writeLocation == WriteLocationEnum.AfterBookmark) &&
                string.IsNullOrWhiteSpace(bookmarkName))
            {
                throw new ArgumentException("Bookmark Name is required when writing before or after a bookmark.");
            }

            dynamic activeDocument = wordApp.ActiveDocument;

            switch (writeLocation)
            {
                case WriteLocationEnum.BeginningOfWordFile:
                    InsertAtBeginning(activeDocument, textToWrite, appendNewLine);
                    break;

                case WriteLocationEnum.EndOfWordFile:
                    InsertAtEnd(activeDocument, textToWrite, appendNewLine);
                    break;

                case WriteLocationEnum.BeforeBookmark:
                    InsertBeforeBookmark(activeDocument, bookmarkName, textToWrite, appendNewLine);
                    break;

                case WriteLocationEnum.AfterBookmark:
                    InsertAfterBookmark(activeDocument, bookmarkName, textToWrite, appendNewLine);
                    break;

                default:
                    throw new ArgumentException("Invalid Write Location.");
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Text written to Word document successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error writing to Word document: {ex.Message}");
        }
    }

    private static void InsertAtBeginning(dynamic document, string text, bool appendNewLine)
    {
        document.Content.InsertBefore(text);
        if (appendNewLine)
            document.Content.InsertBefore("\r\n");
    }

    private static void InsertAtEnd(dynamic document, string text, bool appendNewLine)
    {
        document.Content.InsertAfter(text);
        if (appendNewLine)
            document.Content.InsertAfter("\r\n");
    }

    private static void InsertBeforeBookmark(dynamic document, string bookmarkName, string text, bool appendNewLine)
    {
        if (!document.Bookmarks.Exists(bookmarkName))
            throw new ArgumentException($"Bookmark '{bookmarkName}' not found in the document.");

        dynamic bookmarkRange = document.Bookmarks[bookmarkName].Range;
        bookmarkRange.Text = text + (appendNewLine ? "\r\n" : "");
    }

    private static void InsertAfterBookmark(dynamic document, string bookmarkName, string text, bool appendNewLine)
    {
        if (!document.Bookmarks.Exists(bookmarkName))
            throw new ArgumentException($"Bookmark '{bookmarkName}' not found in the document.");

        dynamic bookmarkRange = document.Bookmarks[bookmarkName].Range;
        bookmarkRange.Collapse(OfficeConstants.WdCollapseEnd);
        bookmarkRange.Text = text + (appendNewLine ? "\r\n" : "");
    }
}
