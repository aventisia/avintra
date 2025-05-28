using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{

    // Activity to find and replace words in a Word document
    [DisplayName("Find and Replace Words in Word Document"),
     Description("Finds text and replaces it with another in the active document of a Word instance.")]
    public class FindAndReplaceWordsInWordDocumentActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the Word document.")]
        public InArgument<string> DocumentPath { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to find.")]
        public InArgument<string> FindText { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to replace with.")]
        public InArgument<string> ReplaceText { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var documentPath = DocumentPath.Get(context);
            var findText = FindText.Get(context);
            var replaceText = ReplaceText.Get(context);
            var status = "";

            try
            {
                // Simulate finding and replacing text in the Word document (actual implementation would use Microsoft.Office.Interop.Word)
                status = $"Simulated finding and replacing text in Word document at path: {documentPath}";
            }
            catch (Exception ex)
            {
                status = $"Error finding and replacing text in Word document: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}