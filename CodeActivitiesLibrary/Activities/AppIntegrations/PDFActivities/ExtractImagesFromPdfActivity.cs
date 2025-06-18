using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using UglyToad.PdfPig;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("Extract Images from PDF")]
    [Description("Extracts images from a PDF file by specifying the source PDF file and the target folder.")]
    public class ExtractImagesFromPdfActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The path to the source PDF file.")]
        public InArgument<string> SourcePdfPath { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The target folder to save the extracted images.")]
        public InArgument<string> TargetFolder { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

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
                    var imageCount = 0;

                    foreach (var page in document.GetPages())
                    {
                        foreach (var image in page.GetImages())
                        {
                            var imagePath = Path.Combine(targetFolder, $"image_{imageCount++}_{Guid.NewGuid()}.png");

                            image.TryGetPng(out var img);
                            if (img == null) continue;
                            using (var fs = new FileStream(imagePath, FileMode.Create, FileAccess.Write))
                            {
                                fs.Write(img, 0, img.Length);
                            }
                        }
                    }

                    status = $"Successfully extracted {imageCount} images from '{sourcePdfPath}' to '{targetFolder}'.";
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, status);
                }
            }
            catch (Exception ex)
            {
                status = $"Error extracting images from PDF: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}