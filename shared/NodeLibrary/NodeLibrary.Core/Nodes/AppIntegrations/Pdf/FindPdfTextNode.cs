using UglyToad.PdfPig;

namespace NodeLibrary.PdfNodes;

[DisplayName("Pdf Regex Contains"), Description("Checks if the Pdf contains text matching a regular expression pattern (case-sensitive).")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class FindPdfTextNode : BaseNode
{
    [DisplayName("Pdf File Path"), Description("Full path to the Pdf file to search (e.g., C:\\docs\\document.pdf).")]
    public required InArgument<string> PdfFilePath { get; set; }

    [DisplayName("Regex Pattern"), Description("Regular expression to search for in the Pdf (e.g., \"Name:\\s*\\w+\"). Case-sensitive.")]
    public required InArgument<string> RegexPattern { get; set; }

    [DisplayName("Text Found"), Description("True if the regex pattern matches any text in the Pdf; otherwise, false.")]
    public OutArgument<bool> TextFound { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            string pdfPath = PdfFilePath.Get(context) ?? string.Empty;
            string pattern = RegexPattern.Get(context) ?? string.Empty;

            if (string.IsNullOrWhiteSpace(pdfPath))
                throw new ArgumentException("Pdf file path is required.");

            if (!File.Exists(pdfPath))
                throw new FileNotFoundException($"Pdf file not found: {pdfPath}");

            if (string.IsNullOrWhiteSpace(pattern))
                throw new ArgumentException("Regex pattern is required.");

            string pdfText = ExtractTextFromPdf(pdfPath);

            bool found = Regex.IsMatch(pdfText, pattern);

            TextFound.Set(context, found);
            status = found
                ? "Success: Regex pattern matched in Pdf."
                : "Success: No match found for regex pattern.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            TextFound.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.Message}");
        }
    }

    private static string ExtractTextFromPdf(string filePath)
    {
        var text = new StringBuilder();
        using (var document = PdfDocument.Open(filePath))
        {
            foreach (var page in document.GetPages())
            {
                text.Append(page.Text);
            }
        }
        return text.ToString();
    }
}
