using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Save Word")]
    [Description("Saves a previously launched Word instance.")]
    public class SaveWordActivity : BaseCodeActivity
    {
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to save.")]
        [RequiredArgument]
        public InArgument<Application> WordInstance { get; set; }

        [DisplayName("Save Mode")]
        [Description("Specifies how to save the document.")]
        [DefaultValue(SaveModeEnum.SaveDocument)]
        public InArgument<SaveModeEnum> SaveMode { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var saveMode = context.GetValue(SaveMode);

                if (wordApp == null)
                {
                    throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");
                }

                // Perform the specified action
                switch (saveMode)
                {
                    case SaveModeEnum.SaveDocument:
                        // Save the document with its current name and location
                        wordApp.ActiveDocument.Save();
                        break;

                    case SaveModeEnum.SaveDocumentAs:
                        // Prompt the user to save the document with a new name/location
                        wordApp.ActiveDocument.SaveAs2(
                            FileName: "", // User will be prompted to choose a file name
                            FileFormat: WdSaveFormat.wdFormatDocumentDefault
                        );
                        break;

                    default:
                        throw new ArgumentException("Invalid SaveMode option.");
                }

                Console.WriteLine("Document saved successfully.");
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Document saved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error saving Word document:: {ex.Message}");
            }
        }
    }
    public enum SaveModeEnum
    {

        [Display(Name = "Save Document", Description = "Saves the current document with its existing name.")]
        SaveDocument,

        [Display(Name = "Save Document As", Description = "Saves the document with a new name or location.")]
        SaveDocumentAs
    }

}