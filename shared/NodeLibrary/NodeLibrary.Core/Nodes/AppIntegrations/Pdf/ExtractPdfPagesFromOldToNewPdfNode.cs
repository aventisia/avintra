using UglyToad.PdfPig;
using UglyToad.PdfPig.Writer;

namespace NodeLibrary.PdfNodes;

[DisplayName("Extract Pdf Pages from existing Pdf to New Pdf file"), Description("Extracts specific pages from a Pdf file and saves them as a New Pdf file.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class ExtractPdfPagesFromOldToNewPdfNode : BaseNode
{
    [DisplayName("Source Pdf File Path"), Description("The path to the source Pdf file from which pages will be extracted.")]
    public required InArgument<string> SourcePdfPath { get; set; }

    [DisplayName("Output Pdf File Path"), Description("The path where the new Pdf file with extracted pages will be saved.")]
    public required InArgument<string> NewPdfPath { get; set; }

    [DisplayName("Page Selection Mode"), Description("The mode for selecting pages to extract: All, Single, or Range.")]
    public required InArgument<PageSelectionModeEnum> PageSelection { get; set; } = new InArgument<PageSelectionModeEnum>(PageSelectionModeEnum.All);

    [DisplayName("Password"), Description("The password for the source Pdf file, if it is encrypted. Leave empty if not applicable.")]
    public InArgument<SecureString> Password { get; set; } = new InArgument<SecureString>();

    [DisplayName("Page Number (for Single)"), Description("The specific page number to extract when using Single page selection mode.")]
    [RenderIfCondition(nameof(PageSelection), PageSelectionModeEnum.Single)]
    public InArgument<int> PageNumber { get; set; } = new InArgument<int>();

    [DisplayName("From Page Number (for Range)"), Description("The starting page number for the range of pages to extract.")]
    [RenderIfCondition(nameof(PageSelection), PageSelectionModeEnum.Range)]
    public InArgument<int> FromPageNumber { get; set; } = new InArgument<int>();

    [DisplayName("To Page Number (for Range)"), Description("The ending page number for the range of pages to extract.")]
    [RenderIfCondition(nameof(PageSelection), PageSelectionModeEnum.Range)]
    public InArgument<int> ToPageNumber { get; set; } = new InArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var sourcePath = SourcePdfPath.Get(context);
            var outputPath = NewPdfPath.Get(context) ?? string.Empty;
            var pageMode = PageSelection.Get(context);
            var password = SecureStringHelper.ConvertSecureStringToString(Password.Get(context)!);

            if (!File.Exists(sourcePath))
                throw new FileNotFoundException("Source Pdf file not found.", sourcePath);

            if (File.Exists(outputPath))
                File.Delete(outputPath);

            var pagesToExtract = new List<int>();

            using (var document = string.IsNullOrWhiteSpace(password)
                    ? PdfDocument.Open(sourcePath)
                    : PdfDocument.Open(sourcePath, new ParsingOptions { Password = password }))
            {
                int totalPages = document.NumberOfPages;

                switch (pageMode)
                {
                    case PageSelectionModeEnum.All:
                        pagesToExtract = Enumerable.Range(1, totalPages).ToList();
                        break;

                    case PageSelectionModeEnum.Single:
                        int page = PageNumber.Get(context);
                        if (page < 1 || page > totalPages)
                            throw new ArgumentException("Invalid page number.");
                        pagesToExtract.Add(page);
                        break;

                    case PageSelectionModeEnum.Range:
                        int from = FromPageNumber.Get(context);
                        int to = ToPageNumber.Get(context);

                        if (from < 1 || to < 1 || to < from || to > totalPages)
                            throw new ArgumentException("Invalid page range.");

                        for (int i = from; i <= to; i++)
                            pagesToExtract.Add(i);
                        break;
                }

                using (var builder = new PdfDocumentBuilder())
                {
                    foreach (int pageNumber in pagesToExtract)
                    {
                        var pg = document.GetPage(pageNumber);
                        var newPage = builder.AddPage(pg.Width, pg.Height);
                        newPage.CopyFrom(pg);
                    }

                    var pdfBytes = builder.Build();
                    File.WriteAllBytes(outputPath, pdfBytes);
                }
            }

            status = $"Successfully extracted {pagesToExtract.Count} page(s).";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "Error: " + ex.Message);
        }
    }
}

public enum PageSelectionModeEnum
{
    [Display(Name = "All", Description = "Extract all pages from the Pdf.")]
    All,

    [Display(Name = "Single", Description = "Extract only the specified single page.")]
    Single,

    [Display(Name = "Range", Description = "Extract a range of pages from the Pdf.")]
    Range
}
