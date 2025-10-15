using CodeActivitiesLibrary.Extensions;
using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{

    [DisplayName("Smart PDF Page Splitter")]
    [Description("Splits a PDF into pages based on selection mode: All, Odd, Even, Range, Specific Pages, or By Chunk Size.")]
    [ActivityMetaData(nodeImg:"/assets/PDF.svg")]
    public class SelectivePdfSplitterActivity : BaseCodeActivity
    {
        #region Input Arguments

        [RequiredArgument]
        [DisplayName("PDF File Path")]
        [Description("Full path to the source PDF file to split (e.g., C:\\docs\\input.pdf).")]
        public InArgument<string> PdfFilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Output Directory")]
        [Description("Directory where split page PDFs will be saved (e.g., C:\\output).")]
        public InArgument<string> OutputDirectory { get; set; }

        [RequiredArgument]
        [DisplayName("Selection Mode")]
        [Description("Choose how to select pages: All, Odd, Even, Range, Specific Pages, or By Specified Page Size.")]
        [DefaultValue(SelectionModeEnum.All)]
        public InArgument<SelectionModeEnum> SelectionMode { get; set; }

        [DisplayName("Page Range")]
        [Description("For 'Custom Range' mode, specify pages like '1-3,5,7-9'. Ignored for other modes.")]
        [RenderIfCondition(nameof(SelectionMode), SelectionModeEnum.Range)]
        public InArgument<string> PageRange { get; set; }

        [DisplayName("Specific Pages")]
        [Description("For 'Specific Pages' mode, specify individual pages like '10,20,30'. Ignored for other modes.")]
        [RenderIfCondition(nameof(SelectionMode), SelectionModeEnum.Set)]
        public InArgument<string> SpecificPages { get; set; }

        [DisplayName("Pages Per File")]
        [Description("For 'By Pages Per File' mode or 'Specific Pages' grouping, number of pages per output PDF (e.g., 10).")]
        [RenderIfCondition(nameof(SelectionMode), SelectionModeEnum.SpecifiedPage)]
        public InArgument<int> PagesPerFile { get; set; }

        [DisplayName("Page Prefix")]
        [Description("Optional prefix for output filenames (e.g., 'page_' → page_1.pdf or page_chunk_001.pdf).")]
        public InArgument<string> PagePrefix { get; set; } = "page_";

        #endregion


        #region Output Arguments

        [DisplayName("Saved Folder Path")]
        [Description("The folder where all split PDF pages were saved.")]
        public OutArgument<string> SavedFolderPath { get; set; }

        [DisplayName("Page Count")]
        [Description("Total number of pages split (actual pages, excluding padded blanks).")]
        public OutArgument<int> PageCount { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var inputPath = PdfFilePath.Get(context);
            var outputDir = OutputDirectory.Get(context);
            var selectionMode = SelectionMode.Get(context);
            var pageRangeStr = PageRange.Get(context) ?? string.Empty;
            var setOfPagesStr = SpecificPages.Get(context) ?? string.Empty;
            var specifiedPageSize = PagesPerFile.Get(context);
            var prefix = PagePrefix.Get(context) ?? "page_";
            int pageCount = 0;

            try
            {
                // Validate inputs
                if (string.IsNullOrWhiteSpace(inputPath))
                    throw new ArgumentException("Input PDF path is required.");
                if (!File.Exists(inputPath))
                    throw new FileNotFoundException($"PDF file not found: {inputPath}");
                if (string.IsNullOrWhiteSpace(outputDir))
                    throw new ArgumentException("Output directory is required.");

                Directory.CreateDirectory(outputDir);

                using (var inputDoc = PdfReader.Open(inputPath, PdfDocumentOpenMode.Import))
                {
                    int totalPdfPages = inputDoc.PageCount;

                    // Handle modes
                    if (selectionMode == SelectionModeEnum.Range)
                    {
                        // parse ranges and create one PDF per range (e.g. "1-5" => one file containing pages 1..5)
                        var ranges = ParseRanges(pageRangeStr, totalPdfPages);
                        int idx = 1;
                        foreach (var r in ranges)
                        {
                            var outDoc = new PdfDocument();
                            for (int p = r.start; p <= r.end; p++)
                            {
                                outDoc.AddPage(inputDoc.Pages[p - 1]);
                            }

                            string fileName = $"{prefix}range_{r.start}_{r.end}.pdf";
                            string outputPath = Path.Combine(outputDir, fileName);
                            outDoc.Save(outputPath);
                            outDoc.Close();

                            pageCount += (r.end - r.start + 1);
                            idx++;
                        }
                    }
                    else if (selectionMode == SelectionModeEnum.Set)
                    {
                        // Specific pages: group chosen pages into chunks of size PagesPerFile (default 10),
                        // and pad the final chunk with blank pages so each output file has PagesPerFile pages.
                        var pages = ParseSpecificPages(setOfPagesStr, totalPdfPages);
                        int chunkSize = specifiedPageSize > 0 ? specifiedPageSize : 10;
                        int chunkIndex = 1;

                        for (int i = 0; i < pages.Count; i += chunkSize)
                        {
                            var chunk = pages.Skip(i).Take(chunkSize).ToList();
                            var outDoc = new PdfDocument();

                            // Add selected pages (real pages)
                            foreach (int pageNum in chunk)
                            {
                                outDoc.AddPage(inputDoc.Pages[pageNum - 1]);
                            }

                            // Pad with blank pages if needed to reach chunkSize
                            int padCount = chunkSize - chunk.Count;
                            for (int p = 0; p < padCount; p++)
                            {
                                outDoc.AddPage(); // blank page
                            }

                            string fileName = $"{prefix}set_{chunkIndex:D3}.pdf";
                            string outputPath = Path.Combine(outputDir, fileName);
                            outDoc.Save(outputPath);
                            outDoc.Close();

                            pageCount += chunk.Count; // count only actual pages, not padded blanks
                            chunkIndex++;
                        }
                    }
                    else if (selectionMode == SelectionModeEnum.SpecifiedPage)
                    {
                        // Split into multi-page chunks across entire document (e.g., every N pages)
                        if (specifiedPageSize < 1)
                            throw new ArgumentException("PagesPerFile must be at least 1 for chunking mode.");

                        var allPages = Enumerable.Range(1, totalPdfPages).ToList();
                        int chunkIndex = 1;

                        for (int i = 0; i < allPages.Count; i += specifiedPageSize)
                        {
                            var chunk = allPages.Skip(i).Take(specifiedPageSize).ToList();
                            var outDoc = new PdfDocument();

                            foreach (int pageNum in chunk)
                            {
                                outDoc.AddPage(inputDoc.Pages[pageNum - 1]);
                            }

                            string fileName = $"{prefix}page{chunkIndex:D3}.pdf";
                            string outputPath = Path.Combine(outputDir, fileName);
                            outDoc.Save(outputPath);
                            outDoc.Close();

                            chunkIndex++;
                        }

                        pageCount = allPages.Count;
                    }
                    else
                    {
                        // Single-page-per-file modes (All / Odd / Even)
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

                            var outDoc = new PdfDocument();
                            outDoc.AddPage(inputDoc.Pages[pageNum - 1]);

                            string fileName = $"{prefix}{pageNum}.pdf";
                            string outputPath = Path.Combine(outputDir, fileName);
                            outDoc.Save(outputPath);
                            outDoc.Close();

                            pageCount++;
                        }
                    }

                    SavedFolderPath.Set(context, outputDir);
                    PageCount.Set(context, pageCount);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Successfully processed {pageCount} page(s).");
                }
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error splitting PDF: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        // Parse ranges. Returns list of (start,end) tuples. Single page "5" becomes (5,5).
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

        // Parses a comma-separated list like "10,20,30" into page numbers
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

        public enum SelectionModeEnum
        {
            [Display(Name = "All Pages", Description = "Splits every page in the PDF into individual files.")]
            All,

            [Display(Name = "Odd Pages", Description = "Splits only odd-numbered pages (1, 3, 5, ...).")]
            Odd,

            [Display(Name = "Even Pages", Description = "Splits only even-numbered pages (2, 4, 6, ...).")]
            Even,

            [Display(Name = "Custom Range", Description = "Creates one PDF per range spec (e.g., \"1-3,5,7-9\" => files for 1-3, 5-5, 7-9).")]
            Range,

            [Display(Name = "Specific Pages", Description = "Group specified pages into chunked PDFs (defaults to 10 pages per file, padded).")]
            Set,

            [Display(Name = "Split Pages Per File", Description = "Splits the PDF into groups of N pages per output file (e.g., 10 pages per PDF).")]
            SpecifiedPage
        }
    }
}
