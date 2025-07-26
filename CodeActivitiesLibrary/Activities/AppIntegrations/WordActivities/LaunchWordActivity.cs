using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Launch Word")]
    [Description("Launches a new Word instance or opens a Word document.")]
    public class LaunchWordActivity : BaseCodeActivity
    {
        [DisplayName("Launch Mode")]
        [Description("Select how to launch Word: 'Blank Document' or 'Open Existing Document'.")]
        [DefaultValue(LaunchWordModeEnum.BlankDocument)]
        public InArgument<LaunchWordModeEnum> LaunchMode { get; set; }

        [DisplayName("Document Path")]
        [Description("The file path of the document to open. Required if 'Launch Mode' is 'Open Existing Document'.")]
        [DefaultValue("")]
        [RenderIfCondition("LaunchMode", LaunchWordModeEnum.OpenExistingDocument)]
        public InArgument<string> DocumentPath { get; set; }

        [DisplayName("Make Instance Visible")]
        [Description("Specifies whether the Word application window should be visible.")]
        [DefaultValue(true)]
        public InArgument<bool> MakeInstanceVisible { get; set; }

        [DisplayName("Word Instance")]
        [Description(
            "The specific Word instance for use with later Word actions. This allows the user to specify which of possibly several Word documents to access.")]
        public OutArgument<Word.Application> WordInstance { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var launchMode = context.GetValue(LaunchMode);
                var documentPath = context.GetValue(DocumentPath);
                var makeInstanceVisible = context.GetValue(MakeInstanceVisible);

                // Initialize Word application
                var wordApp = new Application();

                // Set visibility
                wordApp.Visible = makeInstanceVisible;

                // Determine action based on launch mode
                switch (launchMode)
                {
                    case LaunchWordModeEnum.BlankDocument:
                        // Create a new blank document
                        _Document wordDoc = wordApp.Documents.Add();
                        break;

                    case LaunchWordModeEnum.OpenExistingDocument:
                        // Open an existing document
                        if (!string.IsNullOrEmpty(documentPath))
                        {
                            _Document document = wordApp.Documents.Open(documentPath);
                        }
                        else
                        {
                            throw new ArgumentException(
                                "Document Path is required when launching with 'Open Existing Document'.");
                        }

                        break;

                    default:
                        throw new ArgumentException(
                            "Invalid Launch Mode. Supported values are 'Blank Document' and 'Open Existing Document'.");
                }

                // Set the output WordInstance
                context.SetValue(WordInstance, wordApp);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Word launched successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error launching Word: {ex.Message}");
            }
        }

        public enum LaunchWordModeEnum
        {
            [Display(Name = "Blank Document", Description = "Launches Excel with a blank document.")]
            BlankDocument,

            [Display(Name = "Open Existing Document", Description = "Launches Excel and opens the specified document.")]
            OpenExistingDocument
        }
    }
}