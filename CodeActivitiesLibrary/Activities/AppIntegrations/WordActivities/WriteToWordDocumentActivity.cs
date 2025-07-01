using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.Activities.Statements;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Write to Word Document")]
    [Description("Writes or appends text to a Word file.")]
    public class WriteToWordDocumentActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to use.")]
        public InArgument<Word.Application> WordInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Write")]
        [Description("The text to be written or appended to the Word document.")]

        public InArgument<string> TextToWrite { get; set; }

        [DisplayName("Append New Line")]
        [Description("Specifies whether to append a new line after the text.")]
        [DefaultValue(true)]
        public InArgument<bool> AppendNewLine { get; set; }

        [DisplayName("Write Text To")]
        [Description("Specifies the location in the Word document where the text should be written.")]
        [DefaultValue(WriteLocation.BeginningOfWordFile)]
        public InArgument<WriteLocation> WriteTextTo { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var textToWrite = context.GetValue(TextToWrite);
                var appendNewLine = context.GetValue(AppendNewLine);
                var writeLocation = context.GetValue(WriteTextTo);

                // Ensure Word is open and has at least one document
                if (wordApp == null || wordApp.Documents.Count == 0)
                {
                    throw new InvalidOperationException("No active Word document found.");
                }

                // Get the active document
                _Document activeDocument = wordApp.ActiveDocument;

                // Insert text based on the selected location
                switch (writeLocation)
                {
                    case WriteLocation.BeginningOfWordFile:
                        InsertAtBeginning(activeDocument, textToWrite, appendNewLine);
                        break;

                    case WriteLocation.EndOfWordFile:
                        InsertAtEnd(activeDocument, textToWrite, appendNewLine);
                        break;

                    case WriteLocation.BeforeBookmark:
                        InsertBeforeBookmark(activeDocument, textToWrite, appendNewLine);
                        break;

                    case WriteLocation.AfterBookmark:
                        InsertAfterBookmark(activeDocument, textToWrite, appendNewLine);
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

        #region Helper Methods

        private void InsertAtBeginning(_Document document, string text, bool appendNewLine)
        {
            // Insert text at the beginning of the document
            document.Content.InsertBefore(text);
            if (appendNewLine)
            {
                document.Content.InsertBefore("\r\n");
            }
        }

        private void InsertAtEnd(_Document document, string text, bool appendNewLine)
        {
            // Insert text at the end of the document
            document.Content.InsertAfter(text);
            if (appendNewLine)
            {
                document.Content.InsertAfter("\r\n");
            }
        }

        private void InsertBeforeBookmark(_Document document, string text, bool appendNewLine)
        {
            // Find the first bookmark in the document
            object bookmarkName = "_DefaultBookmark"; // Example bookmark name
            Range bookmarkRange = document.Bookmarks[bookmarkName].Range;

            // Insert text before the bookmark
            bookmarkRange.Text = text + (appendNewLine ? "\r\n" : "");
        }

        private void InsertAfterBookmark(_Document document, string text, bool appendNewLine)
        {
            // Find the first bookmark in the document
            object bookmarkName = "_DefaultBookmark"; // Example bookmark name
            Range bookmarkRange = document.Bookmarks[bookmarkName].Range;

            // Insert text after the bookmark
            bookmarkRange.Collapse(WdCollapseDirection.wdCollapseEnd);
            bookmarkRange.Text = text + (appendNewLine ? "\r\n" : "");
        }

        #endregion
    }

    public enum WriteLocation
    {
        [Display(Name = "Beginning of Word file", Description = "Writes content at the beginning of the document.")]
        BeginningOfWordFile,

        [Display(Name = "End of Word file", Description = "Writes content at the end of the document.")]
        EndOfWordFile,

        [Display(Name = "Before Bookmark", Description = "Writes content before the specified bookmark.")]
        BeforeBookmark,

        [Display(Name = "After Bookmark", Description = "Writes content after the specified bookmark.")]
        AfterBookmark
    }

}