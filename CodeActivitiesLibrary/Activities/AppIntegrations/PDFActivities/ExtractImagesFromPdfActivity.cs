using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{
    // Activity to extract images from a PDF file
    [DisplayName("Extract Images from PDF"),
     Description("Extracts images from a PDF file by specifying the source PDF file and the pages to extract from.")]
    public class ExtractImagesFromPdfActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The path to the source PDF file.")]
        public InArgument<string> SourcePdfPath { get; set; }

        [RequiredArgument, Category("Input"), Description("The target folder to save the extracted images.")]
        public InArgument<string> TargetFolder { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourcePdfPath = SourcePdfPath.Get(context);
            var targetFolder = TargetFolder.Get(context);
            var status = "";

            try
            {
                // Simulate extracting images from PDF (actual implementation would use a library like iTextSharp or PDFBox)
                status = $"Simulated extraction of images from '{sourcePdfPath}' to '{targetFolder}'.";
            }
            catch (Exception ex)
            {
                status = $"Error extracting images from PDF: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}