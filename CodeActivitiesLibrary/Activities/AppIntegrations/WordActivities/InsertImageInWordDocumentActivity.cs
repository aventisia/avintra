using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using Bookmark = Microsoft.Office.Interop.Word.Bookmark;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Insert Image in Word Document")]
    [Description("Inserts an image into a Word file at a specified location.")]
    public class InsertImageInWordDocumentActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to use.")]
        public InArgument<Application> WordInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Insert Image To")]
        [Description("Specifies where in the document to insert the image.")]
        [DefaultValue(InsertLocationEnum.EndOfWordFile)]
        public InArgument<InsertLocationEnum> InsertImageTo { get; set; }

        [RequiredArgument]
        [DisplayName("Image Source")]
        [Description("Specifies whether the image is inserted from a file or clipboard.")]
        [DefaultValue(ImageSourceEnum.File)]
        public InArgument<ImageSourceEnum> InsertImageFrom { get; set; }

        [RequiredArgument]
        [DisplayName("Image Path")]
        [Description("The file path of the image to insert (if source is File).")]
        public InArgument<string> ImagePath { get; set; }

        [DisplayName("Bookmark Name")]
        [Description("The name of the bookmark to use for inserting before/after it.")]
        public InArgument<string> BookmarkName { get; set; }

        [DisplayName("Text to Search")]
        [Description("The text to search for when inserting before or after it.")]
        public InArgument<string> TextToSearch { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

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

                _Document activeDocument = wordApp.ActiveDocument;
                if (activeDocument == null)
                    throw new InvalidOperationException("No active Word document found.");

                // Determine range based on insert location
                Range insertionRange = GetInsertionRange(activeDocument, insertLocation, bookmarkName, searchText);

                // Insert image based on source
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
                        wordApp.Selection.Paste();
                        break;

                    default:
                        throw new ArgumentOutOfRangeException();
                }

                status = $"Successfully inserted image into Word document at '{insertLocation}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error inserting image into Word document: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static Range GetInsertionRange(
            _Document document,
            InsertLocationEnum location,
            string bookmarkName,
            string searchText)
        {
            Range range = null;

            switch (location)
            {
                case InsertLocationEnum.BeginningOfWordFile:
                    range = document.Content.Paragraphs[1].Range;
                    range.Collapse(WdCollapseDirection.wdCollapseStart);
                    break;

                case InsertLocationEnum.EndOfWordFile:
                    range = document.Content;
                    range.Collapse(WdCollapseDirection.wdCollapseEnd);
                    break;

                case InsertLocationEnum.BeforeBookmark:
                    if (string.IsNullOrWhiteSpace(bookmarkName))
                        throw new ArgumentException("Bookmark name must be provided for this insert mode.");

                    if (document.Bookmarks.Cast<Bookmark>().Any(b => b.Name == bookmarkName))
                    {
                        range = document.Bookmarks[bookmarkName].Range;
                        range.Collapse(WdCollapseDirection.wdCollapseStart);
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
                        range.Collapse(WdCollapseDirection.wdCollapseEnd);
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

        private static Range FindTextRange(_Document document, string text, bool insertBefore)
        {
            foreach (var foundRange in from Range paragraphRange in document.Paragraphs
                                       where paragraphRange.Text.Contains(text)
                                       select paragraphRange.Duplicate)
            {
                foundRange.Find.ClearFormatting();

                if (!foundRange.Find.Execute(FindText: text)) continue;
                foundRange.Collapse(insertBefore
                    ? WdCollapseDirection.wdCollapseStart
                    : WdCollapseDirection.wdCollapseEnd);

                return foundRange;
            }

            return null;
        }
    }

    public enum InsertLocationEnum
    {
        [Display(Name = "Beginning of Word file", Description = "Inserts content at the beginning of the document.")]
        BeginningOfWordFile,

        [Display(Name = "End of Word file", Description = "Inserts content at the end of the document.")]
        EndOfWordFile,

        [Display(Name = "Before Bookmark", Description = "Inserts content before the specified bookmark.")]
        BeforeBookmark,

        [Display(Name = "After Bookmark", Description = "Inserts content after the specified bookmark.")]
        AfterBookmark,

        [Display(Name = "Before Specific Text",
            Description = "Inserts content before a specific text in the document.")]
        BeforeSpecificText,

        [Display(Name = "After Specific Text", Description = "Inserts content after a specific text in the document.")]
        AfterSpecificText
    }

    public enum ImageSourceEnum
    {
        [Display(Name = "File", Description = "Inserts an image from a file path.")]
        File,

        [Display(Name = "Clipboard", Description = "Inserts an image from the system clipboard.")]
        Clipboard
    }
}