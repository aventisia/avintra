using UglyToad.PdfPig;
using Page = UglyToad.PdfPig.Content.Page;

namespace NodeLibrary.PdfNodes;

[DisplayName("Extract Text from Pdf"), Description("Extracts text or images from a Pdf file based on selection.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class ExtractTextFromPdfNode : BaseNode
{
    [DisplayName("Pdf File"), Description("The path to the source Pdf file.")]
    public required InArgument<string> SourcePdfPath { get; set; }

    [DisplayName("Page Selection Mode"), Description("Select how to choose pages for extraction: All, Single, or Range.")]
    public required InArgument<PdfPageSelectionModeEnum> PageSelection { get; set; }

    [DisplayName("Extraction Type"), Description("Select the type of extraction: Text, Images, or Both.")]
    public required InArgument<PdfExtractionTypeEnum> ExtractionType { get; set; }

    [DisplayName("Page Number (for Single)"), Description("The specific page number to extract from. Only used if Page Selection is set to Single.")]
    [RenderIfCondition(nameof(PageSelection), PdfPageSelectionModeEnum.Single)]
    public InArgument<int> PageNumber { get; set; } = new InArgument<int>();

    [DisplayName("From Page Number (for Range)"), Description("The starting page number for extraction. Only used if Page Selection is set to Range.")]
    [RenderIfCondition(nameof(PageSelection), PdfPageSelectionModeEnum.Range)]
    public InArgument<int> FromPageNumber { get; set; } = new InArgument<int>();

    [DisplayName("To Page Number (for Range)"), Description("The ending page number for extraction. Only used if Page Selection is set to Range.")]
    [RenderIfCondition(nameof(PageSelection), PdfPageSelectionModeEnum.Range)]
    public InArgument<int> ToPageNumber { get; set; } = new InArgument<int>();

    [DisplayName("Password"), Description("Optional password for encrypted Pdf files. Leave empty if not required.")]
    public InArgument<SecureString> Password { get; set; } = new InArgument<SecureString>();

    [DisplayName("Output Folder Path"), Description("The folder where extracted images will be saved.")]
    [RenderIfCondition(nameof(ExtractionType), PdfExtractionTypeEnum.Images)]
    [RenderIfOperator(LogicalOperatorEnum.OR)]
    [RenderIfCondition(nameof(ExtractionType), PdfExtractionTypeEnum.Both)]
    public InArgument<string> OutputFolderPath { get; set; } = new InArgument<string>();

    [DisplayName("Extracted Text"), Description("Returns the extracted text from the Pdf.")]
    [RenderIfCondition(nameof(ExtractionType), PdfExtractionTypeEnum.Text)]
    [RenderIfOperator(LogicalOperatorEnum.OR)]
    [RenderIfCondition(nameof(ExtractionType), PdfExtractionTypeEnum.Both)]
    public OutArgument<string> ExtractedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation started.";
        var resultText = string.Empty;

        try
        {
            var sourcePdfPath = SourcePdfPath.Get(context);
            var pageSelection = PageSelection.Get(context);
            var extractionType = ExtractionType.Get(context);
            var password = SecureStringHelper.ConvertSecureStringToString(Password.Get(context));
            var outputFolderPath = OutputFolderPath.Get(context);

            if (!File.Exists(sourcePdfPath))
                throw new FileNotFoundException("Source Pdf file not found.", sourcePdfPath);

            if ((extractionType == PdfExtractionTypeEnum.Images || extractionType == PdfExtractionTypeEnum.Both) &&
                !string.IsNullOrEmpty(outputFolderPath))
            {
                if (!Directory.Exists(outputFolderPath))
                    Directory.CreateDirectory(outputFolderPath);
            }
            else if ((extractionType == PdfExtractionTypeEnum.Images || extractionType == PdfExtractionTypeEnum.Both) &&
                     string.IsNullOrEmpty(outputFolderPath))
            {
                throw new ArgumentException("Output Folder Path is required when extracting images.");
            }

            PdfDocument document;
            try
            {
                var parsingOptions = string.IsNullOrEmpty(password)
                    ? new ParsingOptions()
                    : new ParsingOptions { Password = password };
                document = PdfDocument.Open(sourcePdfPath, parsingOptions);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error opening Pdf file: {ex.Message}");
            }

            var totalPages = document.GetPages().Count();
            var textBuilder = new StringBuilder();

            switch (pageSelection)
            {
                case PdfPageSelectionModeEnum.All:
                    foreach (var page in document.GetPages())
                    {
                        if (extractionType == PdfExtractionTypeEnum.Text ||
                            extractionType == PdfExtractionTypeEnum.Both)
                            textBuilder.AppendLine(page.Text);

                        if (extractionType == PdfExtractionTypeEnum.Images ||
                            extractionType == PdfExtractionTypeEnum.Both)
                            ExtractImages(page, outputFolderPath);
                    }
                    status += $"\nProcessed all pages.";
                    break;

                case PdfPageSelectionModeEnum.Single:
                    var pageNumber = PageNumber.Get(context);
                    if (pageNumber < 1 || pageNumber > totalPages)
                        throw new ArgumentException(
                            $"Invalid page number: {pageNumber}. Must be between 1 and {totalPages}.");
                    var singlePage = document.GetPage(pageNumber);
                    if (extractionType == PdfExtractionTypeEnum.Text ||
                        extractionType == PdfExtractionTypeEnum.Both)
                        textBuilder.AppendLine(singlePage.Text);

                    if (extractionType == PdfExtractionTypeEnum.Images ||
                        extractionType == PdfExtractionTypeEnum.Both)
                        ExtractImages(singlePage, outputFolderPath);

                    status += $"\nProcessed page {pageNumber}.";
                    break;

                case PdfPageSelectionModeEnum.Range:
                    var fromPageNumber = FromPageNumber.Get(context);
                    var toPageNumber = ToPageNumber.Get(context);
                    if (fromPageNumber < 1 || fromPageNumber > totalPages)
                        throw new ArgumentException(
                            $"Invalid 'From Page Number': {fromPageNumber}. Must be between 1 and {totalPages}.");
                    if (toPageNumber < 1 || toPageNumber > totalPages)
                        throw new ArgumentException(
                            $"Invalid 'To Page Number': {toPageNumber}. Must be between 1 and {totalPages}.");
                    if (fromPageNumber > toPageNumber)
                        throw new ArgumentException(
                            "'From Page Number' must be less than or equal to 'To Page Number'.");

                    for (var i = fromPageNumber; i <= toPageNumber; i++)
                    {
                        var page = document.GetPage(i);
                        if (extractionType == PdfExtractionTypeEnum.Text ||
                            extractionType == PdfExtractionTypeEnum.Both)
                            textBuilder.AppendLine(page.Text);

                        if (extractionType == PdfExtractionTypeEnum.Images ||
                            extractionType == PdfExtractionTypeEnum.Both)
                            ExtractImages(page, outputFolderPath);
                    }
                    status += $"\nProcessed pages {fromPageNumber} to {toPageNumber}.";
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(pageSelection));
            }

            resultText = textBuilder.ToString();
            status = $"Successfully processed '{sourcePdfPath}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
            ExtractedText.Set(context, resultText);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error processing Pdf: {ex.Message}");
            ExtractedText.Set(context, string.Empty);
        }
    }

    private static void ExtractImages(Page page, string outputFolderPath)
    {
        foreach (var image in page.GetImages())
        {
            var rawBytes = image.RawBytes.ToArray();
            if (rawBytes == null || rawBytes.Length <= 0) continue;
            var imageName = $"{Guid.NewGuid()}.png";
            var imagePath = Path.Combine(outputFolderPath, imageName);

            using (var stream = new MemoryStream(rawBytes))
            using (var imageStream = new FileStream(imagePath, FileMode.Create, FileAccess.Write))
            {
                stream.CopyTo(imageStream);
            }
        }
    }
}

public enum PdfPageSelectionModeEnum
{
    [Display(Name = "All", Description = "Extract text and images from all pages.")]
    All,

    [Display(Name = "Single", Description = "Extract text and images from a single page.")]
    Single,

    [Display(Name = "Range", Description = "Extract text and images from a range of pages.")]
    Range
}

public enum PdfExtractionTypeEnum
{
    [Display(Name = "Text", Description = "Extract only text from the Pdf.")]
    Text,

    [Display(Name = "Images", Description = "Extract only images from the Pdf.")]
    Images,

    [Display(Name = "Both", Description = "Extract both text and images from the Pdf.")]
    Both
}
