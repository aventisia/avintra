using UglyToad.PdfPig;
using UglyToad.PdfPig.Writer;

namespace NodeLibrary.PdfNodes;

[DisplayName("Merge Pdf Files"), Description("Merges multiple Pdf files into a new one.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class MergePdfFilesNode : BaseNode
{
    [DisplayName("Pdf File Paths"), Description("The paths of the Pdf files to merge.")]
    public required InArgument<List<string>> PdfFilePaths { get; set; }

    [DisplayName("Output Pdf Path"), Description("The full file path where the merged Pdf will be saved. Include the complete path with the new Pdf filename and .pdf extension (e.g., C:\\Documents\\MergedFile.pdf)")]
    public required InArgument<string> OutputPdfPath { get; set; }

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var pdfFilePaths = PdfFilePaths.Get(context);
            var outputPdfPath = OutputPdfPath.Get(context);

            if (pdfFilePaths == null || !pdfFilePaths.Any())
                throw new ArgumentException("No Pdf files provided for merging.");

            if (string.IsNullOrWhiteSpace(outputPdfPath))
                throw new ArgumentException("Output Pdf path must be specified.");

            var outputDir = Path.GetDirectoryName(outputPdfPath);
            if (!string.IsNullOrEmpty(outputDir) && !Directory.Exists(outputDir))
                Directory.CreateDirectory(outputDir);

            if (File.Exists(outputPdfPath))
                File.Delete(outputPdfPath);

            using (var writer = new PdfDocumentBuilder())
            {
                foreach (var filePath in pdfFilePaths)
                {
                    if (!File.Exists(filePath))
                        throw new FileNotFoundException($"Pdf file not found: '{filePath}'", filePath);

                    using (var document = PdfDocument.Open(filePath))
                    {
                        for (int pageNumber = 1; pageNumber <= document.NumberOfPages; pageNumber++)
                        {
                            writer.AddPage(document, pageNumber);
                        }
                    }
                }

                var pdfBytes = writer.Build();
                File.WriteAllBytes(outputPdfPath, pdfBytes);
            }

            status = $"Successfully merged {pdfFilePaths.Count} Pdf file(s) into '{outputPdfPath}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error merging Pdf files: {ex.Message}");
        }
    }
}
