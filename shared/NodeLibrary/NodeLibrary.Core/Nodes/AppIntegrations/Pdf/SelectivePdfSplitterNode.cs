using UglyToad.PdfPig;
using UglyToad.PdfPig.Writer;

namespace NodeLibrary.PdfNodes;

[DisplayName("Smart Pdf Page Splitter"), Description("Splits a Pdf into pages based on selection mode: All, Odd, Even, Range, Specific Pages, or By Chunk Size.")]
[NodeMetadata(icon: "/assets/PDF.svg")]
public class SelectivePdfSplitterNode : BaseNode
{
    [DisplayName("Pdf File Path"), Description("Full path to the source Pdf file to split (e.g., C:\\docs\\input.pdf).")]
    public required InArgument<string> PdfFilePath { get; set; }

    [DisplayName("Output Directory"), Description("Directory where split page Pdfs will be saved (e.g., C:\\output).")]
    public required InArgument<string> OutputDirectory { get; set; }

    [DisplayName("Selection Mode"), Description("Choose how to select pages: All, Odd, Even, Range, Specific Pages, or By Specified Page Size.")]
    public required InArgument<SelectionModeEnum> SelectionMode { get; set; } = new InArgument<SelectionModeEnum>(SelectionModeEnum.All);

    [DisplayName("Page Range"), Description("For 'Custom Range' mode, specify pages like '1-3,5,7-9'. Ignored for other modes.")]
    [RenderIfCondition(nameof(SelectionMode), SelectionModeEnum.Range)]
    public InArgument<string> PageRange { get; set; } = new InArgument<string>();

    [DisplayName("Specific Pages"), Description("For 'Specific Pages' mode, specify individual pages like '10,20,30'. Ignored for other modes.")]
    [RenderIfCondition(nameof(SelectionMode), SelectionModeEnum.Set)]
    public InArgument<string> SpecificPages { get; set; } = new InArgument<string>();

    [DisplayName("Pages Per File"), Description("For 'By Pages Per File' mode or 'Specific Pages' grouping, number of pages per output Pdf (e.g., 10).")]
    [RenderIfCondition(nameof(SelectionMode), SelectionModeEnum.SpecifiedPage)]
    public InArgument<int> PagesPerFile { get; set; } = new InArgument<int>();

    [DisplayName("Page Prefix"), Description("Optional prefix for output filenames (e.g., 'page_' → page_1.pdf or page_chunk_001.pdf).")]
    public InArgument<string> PagePrefix { get; set; } = new InArgument<string>("page_");

    [DisplayName("Saved Folder Path"), Description("The folder where all split Pdf pages were saved.")]
    public OutArgument<string> SavedFolderPath { get; set; } = new OutArgument<string>();

    [DisplayName("Page Count"), Description("Total number of pages split (actual pages, excluding padded blanks).")]
    public OutArgument<int> PageCount { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        int pageCount = 0;

        try
        {
            var inputPath = PdfFilePath.Get(context);
            var outputDir = OutputDirectory.Get(context);
            var selectionMode = SelectionMode.Get(context);
            var pageRangeStr = PageRange.Get(context) ?? string.Empty;
            var setOfPagesStr = SpecificPages.Get(context) ?? string.Empty;
            var specifiedPageSize = PagesPerFile.Get(context);
            var prefix = PagePrefix.Get(context) ?? "page_";

            if (string.IsNullOrWhiteSpace(inputPath))
                throw new ArgumentException("Input Pdf path is required.");
            if (!File.Exists(inputPath))
                throw new FileNotFoundException($"Pdf file not found: {inputPath}");
            if (string.IsNullOrWhiteSpace(outputDir))
                throw new ArgumentException("Output directory is required.");

            Directory.CreateDirectory(outputDir);

            using (var inputDoc = PdfDocument.Open(inputPath))
            {
                int totalPdfPages = inputDoc.NumberOfPages;

                if (selectionMode == SelectionModeEnum.Range)
                {
                    var ranges = ParseRanges(pageRangeStr, totalPdfPages);
                    foreach (var r in ranges)
                    {
                        WritePdfPages(inputDoc, outputDir, $"{prefix}range_{r.start}_{r.end}.pdf",
                            Enumerable.Range(r.start, r.end - r.start + 1).ToList());
                        pageCount += (r.end - r.start + 1);
                    }
                }
                else if (selectionMode == SelectionModeEnum.Set)
                {
                    var pages = ParseSpecificPages(setOfPagesStr, totalPdfPages);
                    int chunkSize = specifiedPageSize > 0 ? specifiedPageSize : 10;
                    int chunkIndex = 1;

                    for (int i = 0; i < pages.Count; i += chunkSize)
                    {
                        var chunk = pages.Skip(i).Take(chunkSize).ToList();
                        WritePdfPages(inputDoc, outputDir, $"{prefix}set_{chunkIndex:D3}.pdf", chunk);
                        pageCount += chunk.Count;
                        chunkIndex++;
                    }
                }
                else if (selectionMode == SelectionModeEnum.SpecifiedPage)
                {
                    if (specifiedPageSize < 1)
                        throw new ArgumentException("PagesPerFile must be at least 1 for chunking mode.");

                    var allPages = Enumerable.Range(1, totalPdfPages).ToList();
                    int chunkIndex = 1;

                    for (int i = 0; i < allPages.Count; i += specifiedPageSize)
                    {
                        var chunk = allPages.Skip(i).Take(specifiedPageSize).ToList();
                        WritePdfPages(inputDoc, outputDir, $"{prefix}page{chunkIndex:D3}.pdf", chunk);
                        chunkIndex++;
                    }

                    pageCount = allPages.Count;
                }
                else
                {
                    List<int> pagesToSave;
                    switch (selectionMode)
                    {
                        case SelectionModeEnum.All:
                            pagesToSave = Enumerable.Range(1, totalPdfPages).ToList();
                            break;
                        case SelectionModeEnum.Odd:
                            pagesToSave = Enumerable.Range(1, totalPdfPages).Where(p => p % 2 == 1).ToList();
                            break;
                        case SelectionModeEnum.Even:
                            pagesToSave = Enumerable.Range(1, totalPdfPages).Where(p => p % 2 == 0).ToList();
                            break;
                        default:
                            throw new ArgumentException($"Unknown selection mode: {selectionMode}");
                    }

                    if (pagesToSave.Count == 0)
                        throw new InvalidOperationException("No pages selected to split.");

                    foreach (int pageNum in pagesToSave)
                    {
                        if (pageNum < 1 || pageNum > totalPdfPages)
                            throw new ArgumentOutOfRangeException($"Page {pageNum} is out of range (1-{totalPdfPages}).");

                        WritePdfPages(inputDoc, outputDir, $"{prefix}{pageNum}.pdf", new List<int> { pageNum });
                        pageCount++;
                    }
                }

                SavedFolderPath.Set(context, outputDir);
                PageCount.Set(context, pageCount);
            }

            status = $"Successfully processed {pageCount} page(s).";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error splitting Pdf: {ex.Message}");
        }
    }

    private static void WritePdfPages(PdfDocument sourceDoc, string outputDir, string fileName, List<int> pageNumbers)
    {
        var builder = new PdfDocumentBuilder();
        foreach (int pageNum in pageNumbers)
        {
            builder.AddPage(sourceDoc, pageNum);
        }
        var pdfBytes = builder.Build();
        File.WriteAllBytes(Path.Combine(outputDir, fileName), pdfBytes);
    }

    private static List<(int start, int end)> ParseRanges(string rangeStr, int totalPages)
    {
        if (string.IsNullOrWhiteSpace(rangeStr))
            throw new ArgumentException("Page range is required for 'Range' mode.");

        var result = new List<(int start, int end)>();
        var parts = rangeStr.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var part in parts)
        {
            var trimmed = part.Trim();
            if (string.IsNullOrEmpty(trimmed)) continue;

            if (trimmed.Contains('-'))
            {
                var rangeParts = trimmed.Split('-');
                if (rangeParts.Length != 2)
                    throw new ArgumentException($"Invalid range format: '{trimmed}'");

                if (!int.TryParse(rangeParts[0].Trim(), out int start) ||
                    !int.TryParse(rangeParts[1].Trim(), out int end))
                    throw new ArgumentException($"Invalid numbers in range: '{trimmed}'");

                if (start < 1 || end > totalPages || start > end)
                    throw new ArgumentException($"Range '{trimmed}' is invalid for document with {totalPages} pages.");

                result.Add((start, end));
            }
            else
            {
                if (!int.TryParse(trimmed, out int page))
                    throw new ArgumentException($"Invalid page number: '{trimmed}'");

                if (page < 1 || page > totalPages)
                    throw new ArgumentException($"Page {page} is out of range (1-{totalPages}).");

                result.Add((page, page));
            }
        }

        return result;
    }

    private static List<int> ParseSpecificPages(string pagesStr, int totalPages)
    {
        if (string.IsNullOrWhiteSpace(pagesStr))
            throw new ArgumentException("Set of pages is required for 'Specific Pages' mode.");

        var result = new HashSet<int>();
        var parts = pagesStr.Split(new char[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var part in parts)
        {
            var trimmed = part.Trim();
            if (string.IsNullOrEmpty(trimmed)) continue;

            if (!int.TryParse(trimmed, out int page))
                throw new ArgumentException($"Invalid page number: '{trimmed}'");

            if (page < 1 || page > totalPages)
                throw new ArgumentException($"Page {page} is out of range (1-{totalPages}).");

            result.Add(page);
        }

        if (result.Count == 0)
            throw new ArgumentException("No valid pages provided.");

        return result.OrderBy(x => x).ToList();
    }
}

public enum SelectionModeEnum
{
    [Display(Name = "All Pages", Description = "Splits every page in the Pdf into individual files.")]
    All,

    [Display(Name = "Odd Pages", Description = "Splits only odd-numbered pages (1, 3, 5, ...).")]
    Odd,

    [Display(Name = "Even Pages", Description = "Splits only even-numbered pages (2, 4, 6, ...).")]
    Even,

    [Display(Name = "Custom Range", Description = "Creates one Pdf per range spec (e.g., \"1-3,5,7-9\" => files for 1-3, 5-5, 7-9).")]
    Range,

    [Display(Name = "Specific Pages", Description = "Group specified pages into chunked Pdfs (defaults to 10 pages per file, padded).")]
    Set,

    [Display(Name = "Split Pages Per File", Description = "Splits the Pdf into groups of N pages per output file (e.g., 10 pages per Pdf).")]
    SpecifiedPage
}
