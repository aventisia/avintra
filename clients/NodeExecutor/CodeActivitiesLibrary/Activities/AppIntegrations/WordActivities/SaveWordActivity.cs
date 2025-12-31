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
    [DisplayName("Save Word")]
    [Description("Saves a previously launched Word instance.")]
    [ActivityMetaData(nodeImg: "/assets/Word.svg")]
    public class SaveWordActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to save.")]

        public InArgument<Word.Application> WordInstance { get; set; }

        [DisplayName("Save Mode")]
        [Description("Specifies how to save the document.")]
        [DefaultValue(SaveModeEnum.SaveDocument)]
        public InArgument<SaveModeEnum> SaveMode { get; set; }

        [DisplayName("Save Path")]
        [Description("The file path to save the document when 'Save Document As' is selected.")]
        [RenderIfCondition(nameof(SaveMode), SaveModeEnum.SaveDocumentAs)]
        public InArgument<string> SavePath { get; set; }

        [DisplayName("Save Format")]
        [Description("Specifies the format to save the document (.docx or .pdf).")]
        [DefaultValue(SaveFormatEnum.Docx)]
        [RenderIfCondition(nameof(SaveMode), SaveModeEnum.SaveDocumentAs)]
        public InArgument<SaveFormatEnum> SaveFormat { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var saveMode = context.GetValue(SaveMode);
                var savePath = context.GetValue(SavePath);
                var saveFormat = context.GetValue(SaveFormat);

                if (wordApp == null)
                    throw new ArgumentNullException(nameof(WordInstance),
                    "WordInstance cannot be null.");

                if (wordApp.Documents.Count == 0)
                    throw new InvalidOperationException("No active documents are open in the Word instance.");

                var activeDoc = wordApp.ActiveDocument;

                switch (saveMode)
                {
                    case SaveModeEnum.SaveDocument:
                        // Save current document
                        activeDoc.Save();
                        StatusMessage.Set(context, "Document saved successfully with existing name and location.");
                        break;

                    case SaveModeEnum.SaveDocumentAs:
                        if (string.IsNullOrWhiteSpace(savePath))
                            throw new ArgumentException("SavePath must be provided when using 'Save Document As'.");

                        // Determine final save format and extension
                        WdSaveFormat format;
                        string finalPath = savePath;

                        switch (saveFormat)
                        {
                            case SaveFormatEnum.Docx:
                                format = WdSaveFormat.wdFormatDocumentDefault;
                                if (!finalPath.EndsWith(".docx", StringComparison.OrdinalIgnoreCase))
                                    finalPath = Path.ChangeExtension(finalPath, ".docx");
                                break;

                            case SaveFormatEnum.Pdf:
                                format = WdSaveFormat.wdFormatPDF;
                                if (!finalPath.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                                    finalPath = Path.ChangeExtension(finalPath, ".pdf");
                                break;

                            default:
                                throw new ArgumentOutOfRangeException(nameof(SaveFormat), "Invalid save format selected.");
                        }

                        // Save as new file
                        activeDoc.SaveAs2(FileName: finalPath, FileFormat: format);
                        StatusMessage.Set(context, $"Document saved successfully as {Path.GetFileName(finalPath)}.");
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(SaveMode), "Invalid save mode selected.");
                }


                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Document saved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error saving Word document: {ex.Message}");
                throw new Exception($"Error saving Word document: {ex.Message}", ex);
            }
        }
    }

    // ---- ENUMS ----
    public enum SaveModeEnum
    {

        [Display(Name = "Save Document", Description = "Saves the current document with its existing name.")]
        SaveDocument,

        [Display(Name = "Save Document As", Description = "Saves the document with a new name or location.")]
        SaveDocumentAs
    }

}