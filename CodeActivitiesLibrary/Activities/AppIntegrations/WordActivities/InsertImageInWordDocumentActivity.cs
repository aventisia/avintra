using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    // Activity to insert an image into a Word document
    [DisplayName("Insert Image in Word Document"), Description("Insert an image to a Word file.")]
    public class InsertImageInWordDocumentActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the Word document.")]
        public InArgument<string> DocumentPath { get; set; }

        [RequiredArgument, Category("Input"), Description("The path to the image file to insert.")]
        public InArgument<string> ImagePath { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var documentPath = DocumentPath.Get(context);
            var imagePath = ImagePath.Get(context);
            var status = "";

            try
            {
                // Simulate inserting an image into the Word document (actual implementation would use Microsoft.Office.Interop.Word)
                status = $"Simulated inserting image '{imagePath}' into Word document at path: {documentPath}";
            }
            catch (Exception ex)
            {
                status = $"Error inserting image into Word document: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}