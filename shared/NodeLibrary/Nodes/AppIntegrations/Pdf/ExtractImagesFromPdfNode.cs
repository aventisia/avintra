using UglyToad.PdfPig;

namespace NodeLibrary.PdfNodes;

[DisplayName("Extract Images from Pdf"), Description("Extracts images from a Pdf file by specifying the source Pdf file and the target folder.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class ExtractImagesFromPdfNode : BaseNode
{
    [DisplayName("Source Pdf Path"), Description("The path to the source Pdf file.")]
    public required InArgument<string> SourcePdfPath { get; set; }

    [DisplayName("Target Folder"), Description("The target folder to save the extracted images.")]
    public required InArgument<string> TargetFolder { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var savedImageCount = 0;
        var detectedImageCount = 0;

        try
        {
            var sourcePdfPath = SourcePdfPath.Get(context);
            var targetFolder = TargetFolder.Get(context);

            if (!File.Exists(sourcePdfPath))
                throw new FileNotFoundException("Source Pdf file not found.", sourcePdfPath);

            if (!Directory.Exists(targetFolder))
                Directory.CreateDirectory(targetFolder);

            using (var document = PdfDocument.Open(sourcePdfPath))
            {
                foreach (var page in document.GetPages())
                {
                    foreach (var image in page.GetImages())
                    {
                        detectedImageCount++;

                        if (!image.TryGetPng(out var pngBytes))
                            continue;

                        var imageName = $"image_{savedImageCount}_{Guid.NewGuid()}.png";
                        var imagePath = Path.Combine(targetFolder, imageName);

                        File.WriteAllBytes(imagePath, pngBytes);
                        savedImageCount++;
                    }
                }
            }

            status = $"Successfully Saved {savedImageCount} images to '{targetFolder}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting images: {ex.Message}");
        }
    }
}
