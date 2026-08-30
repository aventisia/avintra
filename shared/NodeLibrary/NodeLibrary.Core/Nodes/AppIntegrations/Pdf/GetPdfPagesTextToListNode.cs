using UglyToad.PdfPig;

namespace NodeLibrary.PdfNodes;

[DisplayName("Get Pdf Pages Text in List"), Description("Extracts text from each page of a Pdf file and returns a list of page texts.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class GetPdfPagesTextToListNode : BaseNode
{
    [DisplayName("Pdf File Path"), Description("Full path to the Pdf file to extract text from (e.g., C:\\docs\\input.pdf).")]
    public required InArgument<string> PdfFilePath { get; set; }

    [DisplayName("Page Texts"), Description("List of strings, where each item contains the extracted text from one page.")]
    public OutArgument<List<string>> ListOfPages { get; set; } = new OutArgument<List<string>>();

    [DisplayName("Page Count"), Description("Total number of pages processed.")]
    public OutArgument<int> PageCount { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var pageListText = new List<string>();
        int pageCount = 0;

        try
        {
            var inputPath = PdfFilePath.Get(context);

            if (string.IsNullOrWhiteSpace(inputPath))
                throw new ArgumentException("Pdf file path is required.");

            if (!File.Exists(inputPath))
                throw new FileNotFoundException($"Pdf file not found: {inputPath}");

            using (var document = PdfDocument.Open(inputPath))
            {
                pageCount = document.NumberOfPages;

                for (int i = 1; i <= document.NumberOfPages; i++)
                {
                    var page = document.GetPage(i);
                    string text = page.Text ?? string.Empty;
                    pageListText.Add(text);
                }
            }

            ListOfPages.Set(context, pageListText);
            PageCount.Set(context, pageCount);
            status = $"Successfully extracted text from {pageCount} page(s).";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting Pdf text: {ex.Message}");
            ListOfPages.Set(context, []);
            PageCount.Set(context, 0);
        }
    }
}
