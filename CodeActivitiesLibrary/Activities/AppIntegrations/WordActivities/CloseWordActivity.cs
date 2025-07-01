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
    [DisplayName("Close Word")]
    [Description("Closes a Word instance.")]
    public class CloseWordActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to close.")]
        public InArgument<Word.Application> WordInstance { get; set; }

        [DisplayName("Before Closing Word")]
        [Description("Specifies whether to save the document before closing Word.")]
        [DefaultValue(CloseOption.DoNotSaveDocument)]
        public InArgument<CloseOption> BeforeClosingWord { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var beforeClosingWord = context.GetValue(BeforeClosingWord);

                if (wordApp == null)
                {
                    throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");
                }

                // Perform the specified action before closing
                switch (beforeClosingWord)
                {
                    case CloseOption.DoNotSaveDocument:
                        // Close without saving
                        wordApp.Quit(SaveChanges: WdSaveOptions.wdDoNotSaveChanges);
                        break;

                    case CloseOption.SaveDocument:
                        // Save and close
                        wordApp.Quit(SaveChanges: WdSaveOptions.wdSaveChanges);
                        break;

                    case CloseOption.SaveDocumentAs:
                        // Prompt to save as
                        wordApp.ActiveDocument.SaveAs2(
                            FileName: "", // User will be prompted to choose a file name
                            FileFormat: WdSaveFormat.wdFormatDocumentDefault
                        );
                        wordApp.Quit(SaveChanges: WdSaveOptions.wdDoNotSaveChanges);
                        break;

                    default:
                        throw new ArgumentException("Invalid BeforeClosingWord option.");
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Word closed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error closing Word: {ex.Message}");
                throw new Exception($"Error closing Word:", ex);
            }
        }
    }
    public enum CloseOption
    {
        [Display(Name = "Do not save document", Description = "Closes the document without saving.")]
        DoNotSaveDocument,

        [Display(Name = "Save document", Description = "Saves the document before closing.")]
        SaveDocument,

        [Display(Name = "Save document as", Description = "Saves the document with a new name before closing.")]
        SaveDocumentAs
    }
}