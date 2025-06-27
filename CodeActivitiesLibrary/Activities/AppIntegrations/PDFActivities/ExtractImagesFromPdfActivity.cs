using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using CodeActivitiesLibrary.Extensions;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    //[DisplayName("Extract Images from PDF")]
    //[Description("Extracts images from a PDF file by specifying the source PDF file and the target folder.")]
    public class ExtractImagesFromPdfActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source PDF Path")]
        [Description("The path to the source PDF file.")]
        public InArgument<string> SourcePdfPath { get; set; }

        [RequiredArgument]
        [DisplayName("Target Folder")]
        [Description("The target folder to save the extracted images.")]
        public InArgument<string> TargetFolder { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var imageCount = 0;

            try
            {
                // Retrieve input arguments
                var sourcePdfPath = SourcePdfPath.Get(context);
                var targetFolder = TargetFolder.Get(context);

                // Validate input paths
                if (!File.Exists(sourcePdfPath))
                    throw new FileNotFoundException("Source PDF file not found.", sourcePdfPath);

                if (!Directory.Exists(targetFolder))
                    Directory.CreateDirectory(targetFolder);

                // Open the PDF document
                using (var document = PdfDocument.Open(sourcePdfPath))
                {
                    // Process each page in the PDF
                    foreach (var page in document.GetPages())
                    {
                        // Extract images from the current page
                        foreach (var image in page.GetImages())
                        {
                            // Generate a unique filename for the image
                            var imageName = $"image_{imageCount++}_{Guid.NewGuid()}.png";
                            var imagePath = Path.Combine(targetFolder, imageName);

                            // Attempt to retrieve the PNG representation of the image
                            if (!image.TryGetPng(out var img)) continue;
                            // Save the image to disk
                            using (var fs = new FileStream(imagePath, FileMode.Create, FileAccess.Write))
                            {
                                fs.Write(img, 0, img.Length);
                            }
                        }
                    }

                    // Update status message with the number of extracted images
                    status = $"Successfully extracted {imageCount} images from '{sourcePdfPath}' to '{targetFolder}'.";
                }

                // Set success status and message
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                // Handle errors gracefully
                status = $"Error extracting images from PDF: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}