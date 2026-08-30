using UglyToad.PdfPig;

namespace NodeLibrary.PdfNodes;

[DisplayName("Extract Tables From Pdf"), Description("Extracts tabular text from all pages of a Pdf file.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class ExtractTablesFromPdfNode : BaseNode
{
    [DisplayName("Pdf File Path"), Description("Path of the Pdf file.")]
    public required InArgument<string> PdfFilePath { get; set; }

    [DisplayName("Extracted Tables"), Description("List of extracted DataTables.")]
    public OutArgument<List<DataTable>> ExtractedTables { get; set; } = new OutArgument<List<DataTable>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var tables = new List<DataTable>();

        try
        {
            var pdfPath = PdfFilePath.Get(context);

            if (!File.Exists(pdfPath))
                throw new FileNotFoundException("Pdf file not found.", pdfPath);

            using (var document = PdfDocument.Open(pdfPath))
            {
                foreach (var page in document.GetPages())
                {
                    var table = new DataTable();

                    var lines = page.GetWords()
                        .GroupBy(w => Math.Round(w.BoundingBox.BottomLeft.Y, 2))
                        .OrderByDescending(g => g.Key)
                        .Select(g => g.OrderBy(w => w.BoundingBox.Left)
                                      .Select(w => w.Text)
                                      .ToArray())
                        .ToList();

                    if (!lines.Any())
                        continue;

                    int columnCount = lines.Max(l => l.Length);
                    for (int i = 0; i < columnCount; i++)
                    {
                        table.Columns.Add($"Column{i + 1}");
                    }

                    foreach (var rowWords in lines)
                    {
                        var row = table.NewRow();
                        for (int i = 0; i < rowWords.Length; i++)
                        {
                            row[i] = rowWords[i];
                        }
                        table.Rows.Add(row);
                    }

                    if (table.Rows.Count > 0)
                        tables.Add(table);
                }
            }

            ExtractedTables.Set(context, tables);
            status = $"Extracted {tables.Count} table(s) from Pdf.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ExtractedTables.Set(context, new List<DataTable>());
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error extracting tables: {ex.Message}");
        }
    }
}
