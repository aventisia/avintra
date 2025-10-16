using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;
using UglyToad.PdfPig;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    //[DisplayName("Extract Tables From PDF")]
    //[Description("Extracts tables from a PDF file.")]
    //[ActivityMetaData(nodeImg:"/assets/PDF.svg")]
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

        [DisplayName("Page Number (for Single)")]
        [Description("The specific page number to extract tables from. Only used if Page Selection is set to Single.")]
        [RenderIfCondition(nameof(PageSelection), PageSelectionMode.Single)]
        public InArgument<int> PageNumber { get; set; }

        [DisplayName("From Page Number (for Range)")]
        [Description("The starting page number for extracting tables in a range. Only used if Page Selection is set to Range.")]
        [RenderIfCondition(nameof(PageSelection), PageSelectionMode.Range)]
        public InArgument<int> FromPageNumber { get; set; }

        [DisplayName("To Page Number (for Range)")]
        [Description("The ending page number for extracting tables in a range. Only used if Page Selection is set to Range.")]
        [RenderIfCondition(nameof(PageSelection), PageSelectionMode.Range)]
        public InArgument<int> ToPageNumber { get; set; }

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

        [DisplayName("Extracted Tables")]
        [Description("The output list of DataTables extracted from the PDF.")]

        public OutArgument<List<DataTable>> ExtractedTables { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
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

                var pagesToExtract = new List<int>();
                switch (pageMode)
                {
                    case PageSelectionMode.All:
                        break;
                    case PageSelectionMode.Single:
                        var single = PageNumber.Get(context);
                        if (single < 1) throw new ArgumentException("Page number must be 1 or greater.");
                        pagesToExtract.Add(single);
                        break;
                    case PageSelectionMode.Range:
                        var from = FromPageNumber.Get(context);
                        var to = ToPageNumber.Get(context);
                        if (from < 1 || to < 1 || to < from)
                            throw new ArgumentException("Invalid page range. Ensure: from >= 1, to >= from.");
                        for (var i = from; i <= to; i++) pagesToExtract.Add(i);
                        break;
                }

                using (var document = string.IsNullOrWhiteSpace(password)
                    ? PdfDocument.Open(pdfPath)
                    : PdfDocument.Open(pdfPath, new ParsingOptions { Password = password }))
                {
                    var totalPages = document.NumberOfPages;
                    if (pagesToExtract.Count == 0 && pageMode == PageSelectionMode.All)
                    {
                        pagesToExtract = Enumerable.Range(1, totalPages).ToList();
                    }

                    var globalTable = new DataTable();
                    var firstPage = true;

                    foreach (var pageNumber in pagesToExtract)
                    {
                        if (pageNumber < 1 || pageNumber > totalPages)
                            continue;

                        var page = document.GetPage(pageNumber);
                        var lines = page.GetWords()
                            .GroupBy(w => Math.Round(w.BoundingBox.BottomLeft.Y, 2))
                            .OrderByDescending(g => g.Key)
                            .Select(g => new { Words = g.OrderBy(w => w.BoundingBox.Left).ToList() })
                            .ToList();

                        var table = mergeTables ? globalTable : new DataTable();

                        if (firstPage && useHeaders)
                        {
                            var firstLine = lines.FirstOrDefault();
                            if (firstLine != null && firstLine.Words.Count > 0)
                            {
                                foreach (var word in firstLine.Words.Select(w => w.Text))
                                {
                                    table.Columns.Add(word);
                                }
                                lines.RemoveAt(0);
                            }
                            else
                            {
                                table.Columns.Add("Column1");
                                table.Columns.Add("Column2");
                            }
                        }

                        foreach (var line in lines)
                        {
                            var words = line.Words.Select(w => w.Text).ToArray();
                            if (words.Length == 0) continue;

                            while (table.Columns.Count < words.Length)
                            {
                                table.Columns.Add($"Column{table.Columns.Count + 1}");
                            }

                            var row = table.NewRow();
                            for (int i = 0; i < words.Length; i++)
                            {
                                row[i] = words[i];
                            }

                            table.Rows.Add(row);
                        }

                        if (!mergeTables)
                        {
                            tables.Add(table);
                        }

                        firstPage = false;
                    }

                    if (mergeTables)
                    {
                        if (globalTable.Rows.Count > 0)
                            tables.Add(globalTable);
                    }
                }

                ExtractedTables.Set(context, tables);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Extract Tables From PDF successfully");
            }
            catch (Exception ex)
            {
                ExtractedTables.Set(context, new List<DataTable>());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Failed to extract tables: " + ex.Message);
            }
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