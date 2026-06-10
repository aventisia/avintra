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

                // Validate source PDF file exists
                if (!File.Exists(sourcePdfPath))
                    throw new FileNotFoundException("Source PDF file not found.", sourcePdfPath);

                // Validate target folder exists
                if (!Directory.Exists(targetFolder))
                    throw new DirectoryNotFoundException($"Target folder not found: {targetFolder}");

                // Create target folder if it does not already exist
                if (!Directory.Exists(targetFolder))
                    Directory.CreateDirectory(targetFolder);

                // Open the PDF document
                using (var document = PdfDocument.Open(sourcePdfPath))
                {
                    // Process each page in the PDF
                    foreach (var page in document.GetPages())
                    {
                        // Process each image found on the page
                        foreach (var image in page.GetImages())
                        {
                            detectedImageCount++;

                            string imageName;
                            string imagePath;

                            // Attempt to extract the image as PNG
                            if (!image.TryGetPng(out var pngBytes))
                            {
                                // PdfPig could not convert the image to PNG. For images using filters such as DCTDecode (JPEG), save the original raw image stream instead.
                                var rawBytes = image.RawBytes.ToArray();

                                imageName = $"image_{savedImageCount}_{Guid.NewGuid()}.jpg";
                                imagePath = Path.Combine(targetFolder, imageName);

                                File.WriteAllBytes(imagePath, rawBytes);
                            }
                            else
                            {
                                // PNG extraction succeeded
                                imageName = $"image_{savedImageCount}_{Guid.NewGuid()}.png";
                                imagePath = Path.Combine(targetFolder, imageName);

                                File.WriteAllBytes(imagePath, pngBytes);
                            }

                            savedImageCount++;
                        }
                    }
                }

                // Set activity output status
                IsSuccess.Set(context, true);

                StatusMessage.Set(
                    context,
                    $"Detected {detectedImageCount} images and successfully saved {savedImageCount} images to '{targetFolder}'.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error extracting images: {ex.Message}");
            }
        }
    }
}