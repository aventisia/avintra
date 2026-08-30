using UglyToad.PdfPig;

namespace NodeLibrary.PdfNodes;

[DisplayName("Validate Pdf Content"), Description("Validates whether a Pdf file contains text or images based on the selected content type.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class ValidatePdfExistanceNode : BaseNode
{
    [DisplayName("Pdf File Path"), Description("Full file path of the Pdf document to validate.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Pdf Content Type"), Description("Select whether to check for Text or Image content in the Pdf.")]
    public required InArgument<PdfContentType> ContentType { get; set; } = new InArgument<PdfContentType>(PdfContentType.Text);

    [DisplayName("Does Pdf Contain"), Description("Returns true if the selected content type exists in the Pdf; otherwise false.")]
    public OutArgument<bool> Result { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var isContentFound = false;
            var filePath = FilePath.Get(context);
            var contentType = ContentType.Get(context);

            if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
                throw new FileNotFoundException("Pdf file not found", filePath);

            using (var document = PdfDocument.Open(filePath))
            {
                foreach (var page in document.GetPages())
                {
                    switch (contentType)
                    {
                        case PdfContentType.Image:
                            isContentFound = page.GetImages().Any();
                            break;

                        case PdfContentType.Text:
                            isContentFound = !string.IsNullOrWhiteSpace(page.Text);
                            break;

                        default:
                            throw new NotSupportedException($"Unsupported Pdf content type: {contentType}");
                    }

                    if (isContentFound)
                        break;
                }
            }

            Result.Set(context, isContentFound);
            status = "Validated Pdf successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Result.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error validating Pdf: {ex.Message}");
        }
    }
}

public enum PdfContentType
{
    [Display(Name = "Text", Description = "Validate text from the Pdf.")]
    Text,

    [Display(Name = "Images", Description = "Validate image from the Pdf.")]
    Image
}
