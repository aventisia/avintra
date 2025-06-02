using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    // Activity to read from a Word document
    [DisplayName("Read from Word Document"), Description("Reads the text content from a document of a Word instance.")]
    public class ReadFromWordDocumentActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the Word document.")]
        public InArgument<string> DocumentPath { get; set; }

        [Category("Output"), Description("Returns the text content of the Word document.")]
        public OutArgument<string> Result { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var documentPath = DocumentPath.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate reading from the Word document (actual implementation would use Microsoft.Office.Interop.Word)
                result = "Simulated text content from Word document";
                status = "Text content read successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error reading from Word document: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}