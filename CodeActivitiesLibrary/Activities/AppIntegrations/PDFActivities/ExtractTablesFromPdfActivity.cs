using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;
using UglyToad.PdfPig;

namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{
    [DisplayName("Extract Tables From PDF (PDFPig)")]
    [Description("Extracts tables from a PDF file using PdfPig library.")]
    public class ExtractTablesFromPdfActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("PDF File Path")]
        [Description("The path to the PDF file from which to extract tables.")]
        public InArgument<string> PdfFile { get; set; }

        [RequiredArgument]
        [DisplayName("Page Selection Mode")]
        [Description("Select how to choose pages for table extraction: All, Single, or Range.")]
        public InArgument<PageSelectionMode> PageSelection { get; set; }

        [DisplayName("Password")]
        [Description("Optional password for encrypted PDF files. Leave empty if not required.")]
        public InArgument<string> Password { get; set; }

        [DisplayName("Merge Tables Across Pages")]
        [Description(
            "If true, merges tables across pages into a single table. If false, creates separate tables for each page.")]
        public InArgument<bool> MergeTablesAcrossPages { get; set; } = true;

        [DisplayName("First Line Contains Column Names")]
        [Description(
            "If true, uses the first line of each page as column headers. If false, uses default column names.")]
        public InArgument<bool> FirstLineAsHeaders { get; set; } = true;

        [DisplayName("Page Number (for Single)")]
        [Description("The specific page number to extract tables from. Only used if Page Selection is set to Single.")]
        public InArgument<int> PageNumber { get; set; }

        [DisplayName("From Page Number (for Range)")]
        [Description(
            "The starting page number for extracting tables in a range. Only used if Page Selection is set to Range.")]
        public InArgument<int> FromPageNumber { get; set; }

        [DisplayName("To Page Number (for Range)")]
        [Description(
            "The ending page number for extracting tables in a range. Only used if Page Selection is set to Range.")]

        public InArgument<int> ToPageNumber { get; set; }

        [DisplayName("Extracted Tables")]
        [Description("The output list of DataTables extracted from the PDF.")]
        public OutArgument<List<DataTable>> ExtractedTables { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var tables = new List<DataTable>();

            try
            {
                var pdfPath = PdfFile.Get(context);
                var password = Password.Get(context);
                var mergeTables = MergeTablesAcrossPages.Get(context);
                var useHeaders = FirstLineAsHeaders.Get(context);
                var pageMode = PageSelection.Get(context);

                if (!File.Exists(pdfPath))
                    throw new FileNotFoundException("PDF file not found.", pdfPath);

                // Determine pages to extract
                var pagesToExtract = new List<int>();
                switch (pageMode)
                {
                    case PageSelectionMode.All:
                        // Will process all pages
                        break;

                    case PageSelectionMode.Single:
                        var page = PageNumber.Get(context);
                        if (page < 1)
                            throw new ArgumentException("Page number must be 1 or greater.");
                        pagesToExtract.Add(page);
                        break;

                    case PageSelectionMode.Range:
                        var from = FromPageNumber.Get(context);
                        var to = ToPageNumber.Get(context);
                        if (from < 1 || to < 1 || to < from)
                            throw new ArgumentException("Invalid page range. Ensure: from >= 1, to >= from.");

                        for (var i = from; i <= to; i++)
                        {
                            pagesToExtract.Add(i);
                        }

                        break;

                    default:
                        throw new InvalidOperationException("Invalid PageSelection mode.");
                }

                // Open PDF document
                using (var document = string.IsNullOrWhiteSpace(password)
                           ? PdfDocument.Open(pdfPath)
                           : PdfDocument.Open(pdfPath, new ParsingOptions() { Password = password }))
                {
                    var totalPages = document.NumberOfPages;

                    // If no specific pages selected, extract all
                    if (pagesToExtract.Count == 0 && pageMode != PageSelectionMode.All)
                    {
                        pagesToExtract = Enumerable.Range(1, totalPages).ToList();
                    }

                    var globalTable = new DataTable();
                    var firstPage = true;

                    foreach (var pageNumber in pagesToExtract)
                    {
                        if (pageNumber > totalPages || pageNumber < 1)
                            throw new ArgumentOutOfRangeException(nameof(pageNumber),
                                $"Page {pageNumber} does not exist. Total pages: {totalPages}");

                        var page = document.GetPage(pageNumber);
                        var lines = page.GetWords().GroupBy(w => Math.Round(w.BoundingBox.BottomLeft.Y, 2))
                            .OrderByDescending(g => g.Key)
                            .Select(g => new { Words = g.OrderBy(w => w.BoundingBox.Left).ToList() })
                            .ToList();

                        // Create table per page unless merging
                        var table = mergeTables && !firstPage ? globalTable : new DataTable();

                        if (mergeTables && firstPage && useHeaders)
                        {
                            // Optional: Use first line as header
                            var firstLine = lines.FirstOrDefault();
                            if (firstLine != null)
                            {
                                foreach (var word in firstLine.Words.Select(w => w.Text))
                                {
                                    table.Columns.Add(word);
                                }

                                lines.RemoveAt(0);
                            }
                            else
                            {
                                // Default column names
                                table.Columns.Add("Column1");
                                table.Columns.Add("Column2");
                            }
                        }

                        foreach (var line in lines)
                        {
                            var row = table.NewRow();
                            var words = line.Words.Select(w => w.Text).ToArray();

                            if (words.Length == 0) continue;

                            for (var i = 0; i < Math.Min(table.Columns.Count, words.Length); i++)
                            {
                                row[i] = words[i];
                            }

                            table.Rows.Add(row);
                        }

                        if (!mergeTables)
                        {
                            tables.Add(table);
                        }
                        else if (firstPage && !useHeaders)
                        {
                            // Set headers based on first line
                            var firstWords = lines.FirstOrDefault()?.Words.Select(w => w.Text).ToArray();
                            if (firstWords?.Length > 0)
                            {
                                foreach (var word in firstWords)
                                {
                                    globalTable.Columns.Add(word);
                                }

                                lines.RemoveAt(0);
                            }
                            else
                            {
                                globalTable.Columns.Add("Column1");
                                globalTable.Columns.Add("Column2");
                            }

                            // Add current page rows
                            foreach (var line in lines)
                            {
                                var row = globalTable.NewRow();
                                var words = line.Words.Select(w => w.Text).ToArray();
                                for (var i = 0; i < Math.Min(globalTable.Columns.Count, words.Length); i++)
                                {
                                    row[i] = words[i];
                                }

                                globalTable.Rows.Add(row);
                            }
                        }
                        else if (!firstPage)
                        {
                            foreach (var line in lines)
                            {
                                var row = globalTable.NewRow();
                                var words = line.Words.Select(w => w.Text).ToArray();
                                for (var i = 0; i < Math.Min(globalTable.Columns.Count, words.Length); i++)
                                {
                                    row[i] = words[i];
                                }

                                globalTable.Rows.Add(row);
                            }
                        }

                        firstPage = false;
                    }

                    if (mergeTables)
                    {
                        tables.Add(globalTable);
                    }
                }

                ExtractedTables.Set(context, tables);
            }
            catch (Exception ex)
            {
                status = "Failed to extract tables: " + ex.Message;
                ExtractedTables.Set(context, new List<DataTable>());
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum PageSelectionMode
    {
        [Description("Extract all pages from the PDF.")]
        All,

        [Description("Extract only the specified single page.")]
        Single,

        [Description("Extract a range of pages from the PDF.")]
        Range
    }
}