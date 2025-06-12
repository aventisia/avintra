using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Launch Word")]
    [Description("Launches a new Word instance or opens a Word document.")]
    public class LaunchWordActivity : BaseCodeActivity
    {
        [DisplayName("Launch Mode")]
        [Description("Select how to launch Word: 'Blank Document' or 'Open Existing Document'.")]
        [DefaultValue("Blank Document")]
        public InArgument<string> LaunchMode { get; set; }

        [DisplayName("Document Path")]
        [Description("The file path of the document to open. Required if 'Launch Mode' is 'Open Existing Document'.")]
        [DefaultValue("")]
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
                if (launchMode == "Blank Document")
                {
                    // Create a new blank document
                    _Document wordDoc = wordApp.Documents.Add();
                }
                else if (launchMode == "Open Existing Document")
                {
                    // Open an existing document
                    if (!string.IsNullOrEmpty(documentPath))
                    {
                        _Document wordDoc = wordApp.Documents.Open(documentPath);
                    }
                    else
                    {
                        throw new ArgumentException(
                            "Document Path is required when launching with 'Open Existing Document'.");
                    }
                }
                else
                {
                    throw new ArgumentException(
                        "Invalid Launch Mode. Supported values are 'Blank Document' and 'Open Existing Document'.");
                }

                // Set the output WordInstance
                context.SetValue(WordInstance, wordApp);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to launch Word.", ex);
            }
        }
    }
}