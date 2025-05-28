using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    // Activity to write or append text to a Word document
    [DisplayName("Write to Word Document"), Description("Write or append text to a Word file.")]
    public class WriteToWordDocumentActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the Word document.")]
        public InArgument<string> DocumentPath { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to write or append.")]
        public InArgument<string> TextToWrite { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var documentPath = DocumentPath.Get(context);
            var textToWrite = TextToWrite.Get(context);
            var status = "";

            try
            {
                // Simulate writing to the Word document (actual implementation would use Microsoft.Office.Interop.Word)
                status = $"Simulated writing text to Word document at path: {documentPath}";
            }
            catch (Exception ex)
            {
                status = $"Error writing to Word document: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}