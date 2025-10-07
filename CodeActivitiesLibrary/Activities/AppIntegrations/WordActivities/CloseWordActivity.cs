using CodeActivitiesLibrary.AppIntegrations.WordActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Close Word")]
    [Description("Closes a Word instance.")]
    [ActivityMetaData(nodeImg: "/assets/Word.svg")]
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

        [DisplayName("Save Path")]
        [Description("The file path to save the document when 'Save Document As' is selected.")]
        [RenderIfCondition(nameof(BeforeClosingWord), CloseOption.SaveDocumentAs)]
        public InArgument<string> SavePath { get; set; }

        [DisplayName("Save Format")]
        [Description("The file format to use when saving the document (.docx or .pdf).")]
        [RenderIfCondition(nameof(BeforeClosingWord), (int)CloseOption.SaveDocumentAs)]
        [DefaultValue(SaveFormatEnum.Docx)]
        public InArgument<SaveFormatEnum> SaveFormat { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var closeOption = context.GetValue(BeforeClosingWord);
                var savePath = context.GetValue(SavePath);
                var saveFormat = context.GetValue(SaveFormat);

                if (wordApp == null)
                    throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");

                if (wordApp.Documents.Count == 0)
                    throw new InvalidOperationException("No active documents are open in the Word instance.");

                var activeDoc = wordApp.ActiveDocument;

                switch (closeOption)
                {
                    case CloseOption.DoNotSaveDocument:
                        // Close without saving
                        wordApp.Quit(WdSaveOptions.wdDoNotSaveChanges);
                        break;

                    case CloseOption.SaveDocument:
                        activeDoc.Save();
                        wordApp.Quit(WdSaveOptions.wdSaveChanges);
                        break;

                    case CloseOption.SaveDocumentAs:
                        if (string.IsNullOrWhiteSpace(savePath))
                            throw new ArgumentException("SavePath must be provided when using 'Save Document As'.");

                        WdSaveFormat wordFormat;
                        string finalPath = savePath;

                        switch (saveFormat)
                        {
                            case SaveFormatEnum.Docx:
                                wordFormat = WdSaveFormat.wdFormatDocumentDefault;
                                if (!finalPath.EndsWith(".docx", StringComparison.OrdinalIgnoreCase))
                                    finalPath = Path.ChangeExtension(finalPath, ".docx");
                                break;

                            case SaveFormatEnum.Pdf:
                                wordFormat = WdSaveFormat.wdFormatPDF;
                                if (!finalPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                                    finalPath = Path.ChangeExtension(finalPath, ".pdf");
                                break;

                            default:
                                throw new ArgumentOutOfRangeException(nameof(SaveFormat), "Invalid save format selected.");
                        }

                        activeDoc.SaveAs2(FileName: finalPath, FileFormat: wordFormat);
                        wordApp.Quit(WdSaveOptions.wdDoNotSaveChanges);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(BeforeClosingWord), "Invalid close option selected.");
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context,
                    $"Word closed successfully. {(closeOption == CloseOption.SaveDocumentAs ? $"Saved as {Path.GetFileName(savePath)}" : string.Empty)}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error closing Word: {ex.Message}");
                throw new Exception($"Error closing Word: {ex.Message}", ex);
            }
        }
    }

    // ENUMS

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