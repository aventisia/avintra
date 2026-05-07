using System.IO;
using NodeLibrary.WordNodes.Enums;
using Bookmark = Microsoft.Office.Interop.Word.Bookmark;
using Word = Microsoft.Office.Interop.Word;
using WordRange = Microsoft.Office.Interop.Word.Range;

namespace NodeLibrary.WordNodes;

[DisplayName("Insert Image In Word Document"), Description("Inserts an image into a Word file at a specified location.")]
[NodeMetadata(icon: "/assets/Word.svg")]
public class InsertImageInWordDocumentNode : BaseNode
{
    [DisplayName("Word Instance"), Description("The specific Word instance to use.")]
    public required InArgument<Word.Application> WordInstance { get; set; }

    [DisplayName("Insert Image To"), Description("Specifies where in the document to insert the image.")]
    public required InArgument<InsertLocationEnum> InsertImageTo { get; set; }

    [DisplayName("Image Source"), Description("Specifies whether the image is inserted from a file or clipboard.")]
    public required InArgument<ImageSourceEnum> InsertImageFrom { get; set; }

    [DisplayName("Image Path"), Description("The file path of the image to insert (if source is File).")]
    public required InArgument<string> ImagePath { get; set; }

    [DisplayName("Bookmark Name"), Description("The name of the bookmark to use for inserting before/after it.")]
    public InArgument<string> BookmarkName { get; set; } = new InArgument<string>();

    [DisplayName("Text to Search"), Description("The text to search for when inserting before or after it.")]
    public InArgument<string> TextToSearch { get; set; } = new InArgument<string>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var wordApp = WordInstance.Get(context);
            var insertLocation = InsertImageTo.Get(context);
            var imageSource = InsertImageFrom.Get(context);
            var imagePath = ImagePath.Get(context);
            var bookmarkName = BookmarkName.Get(context);
            var searchText = TextToSearch.Get(context);

            if (wordApp == null)
                throw new ArgumentException("Word application instance cannot be null.");

            Word._Document activeDocument = wordApp.ActiveDocument;
            if (activeDocument == null)
                throw new InvalidOperationException("No active Word document found.");

            WordRange insertionRange = GetInsertionRange(activeDocument, insertLocation, bookmarkName, searchText);

            switch (imageSource)
            {
                case ImageSourceEnum.File:
                    if (string.IsNullOrWhiteSpace(imagePath))
                        throw new ArgumentException("Image path must be provided when source is 'File'.");

                    if (!File.Exists(imagePath))
                        throw new FileNotFoundException("Image file not found.", imagePath);

                    insertionRange.InlineShapes.AddPicture(imagePath);
                    break;

                case ImageSourceEnum.Clipboard:
                    wordApp.Selection.SetRange(insertionRange.Start, insertionRange.End);
                    wordApp.Selection.Paste();
                    break;

                default:
                    throw new ArgumentOutOfRangeException();
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully inserted image into Word document at '{insertLocation}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error inserting image into Word document: {ex.Message}");
        }
    }

    private static WordRange GetInsertionRange(
        Word._Document document,
        InsertLocationEnum location,
        string bookmarkName,
        string searchText)
    {
        WordRange range = null;

        switch (location)
        {
            case InsertLocationEnum.BeginningOfWordFile:
                range = document.Content.Paragraphs[1].Range;
                range.Collapse(Word.WdCollapseDirection.wdCollapseStart);
                break;

            case InsertLocationEnum.EndOfWordFile:
                range = document.Content;
                range.Collapse(Word.WdCollapseDirection.wdCollapseEnd);
                break;

            case InsertLocationEnum.BeforeBookmark:
                if (string.IsNullOrWhiteSpace(bookmarkName))
                    throw new ArgumentException("Bookmark name must be provided for this insert mode.");

                if (document.Bookmarks.Cast<Bookmark>().Any(b => b.Name == bookmarkName))
                {
                    range = document.Bookmarks[bookmarkName].Range;
                    range.Collapse(Word.WdCollapseDirection.wdCollapseStart);
                }
                else
                {
                    throw new ArgumentException($"Bookmark '{bookmarkName}' not found.");
                }
                break;

            case InsertLocationEnum.AfterBookmark:
                if (string.IsNullOrWhiteSpace(bookmarkName))
                    throw new ArgumentException("Bookmark name must be provided for this insert mode.");

                if (document.Bookmarks.Cast<Bookmark>().Any(b => b.Name == bookmarkName))
                {
                    range = document.Bookmarks[bookmarkName].Range;
                    range.Collapse(Word.WdCollapseDirection.wdCollapseEnd);
                }
                else
                {
                    throw new ArgumentException($"Bookmark '{bookmarkName}' not found.");
                }
                break;

            case InsertLocationEnum.BeforeSpecificText:
                range = FindTextRange(document, searchText, insertBefore: true);
                if (range == null)
                    throw new InvalidOperationException($"Text '{searchText}' not found for insertion.");
                break;

            case InsertLocationEnum.AfterSpecificText:
                range = FindTextRange(document, searchText, insertBefore: false);
                if (range == null)
                    throw new InvalidOperationException($"Text '{searchText}' not found for insertion.");
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(location), location, null);
        }

        return range;
    }

    private static WordRange FindTextRange(Word._Document document, string text, bool insertBefore)
    {
        foreach (Word.Paragraph para in document.Paragraphs)
        {
            WordRange paraRange = para.Range.Duplicate;
            paraRange.Find.ClearFormatting();

            if (!string.IsNullOrEmpty(text) && paraRange.Find.Execute(FindText: text))
            {
                paraRange.Collapse(insertBefore
                    ? Word.WdCollapseDirection.wdCollapseStart
                    : Word.WdCollapseDirection.wdCollapseEnd);

                return paraRange;
            }
        }

        return null;
    }
}
