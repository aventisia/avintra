using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using CodeActivitiesLibrary.Extensions;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("Extract Images from PDF")]
    [Description("Extracts images from a PDF file by specifying the source PDF file and the target folder.")]
    [ActivityMetaData(nodeImg: "/assets/PDF.svg")]
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
            var savedImageCount = 0;
            var detectedImageCount = 0;

            try
            {
                var sourcePdfPath = SourcePdfPath.Get(context);
                var targetFolder = TargetFolder.Get(context);

                if (!File.Exists(sourcePdfPath))
                    throw new FileNotFoundException("Source PDF file not found.", sourcePdfPath);

                if (!Directory.Exists(targetFolder))
                    Directory.CreateDirectory(targetFolder);

                using (var document = PdfDocument.Open(sourcePdfPath))
                {
                    foreach (var page in document.GetPages())
                    {
                        foreach (var image in page.GetImages())
                        {
                            detectedImageCount++;

                            // Try to convert image to PNG
                            if (!image.TryGetPng(out var pngBytes))
                            {
                                // Image detected but NOT extractable as PNG
                                continue;
                            }

                            var imageName = $"image_{savedImageCount}_{Guid.NewGuid()}.png";
                            var imagePath = Path.Combine(targetFolder, imageName);

                            File.WriteAllBytes(imagePath, pngBytes);
                            savedImageCount++;
                        }
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully Saved {savedImageCount} images to '{targetFolder}'.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error extracting images: {ex.Message}");
            }
        }


    }
}