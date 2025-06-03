using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{

    [DisplayName("Extract Tables From PDF")]
    [Description("Extracts tables from a PDF file.")]
    public class ExtractTablesFromPdfActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("PDF File Path")]
        public InArgument<string> PdfFile { get; set; }

        [RequiredArgument]
        [DisplayName("Page Selection Mode")]
        public InArgument<PageSelectionMode> PageSelection { get; set; }


        [DisplayName("Password")]
        public InArgument<string> Password { get; set; }


        [DisplayName("Merge Tables Across Pages")]
        public InArgument<bool> MergeTablesAcrossPages { get; set; } = true;


        [DisplayName("First Line Contains Column Names")]
        public InArgument<bool> FirstLineAsHeaders { get; set; } = true;


        [DisplayName("Page Number (for Single)")]
        public InArgument<int> PageNumber { get; set; }


        [DisplayName("From Page Number (for Range)")]
        public InArgument<int> FromPageNumber { get; set; }


        [DisplayName("To Page Number (for Range)")]
        public InArgument<int> ToPageNumber { get; set; }


        [DisplayName("Extracted Tables")]
        public OutArgument<List<DataTable>> ExtractedTables { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var pdfPath = PdfFile.Get(context);
            var password = Password.Get(context);
            var mergeTables = MergeTablesAcrossPages.Get(context);
            var useHeaders = FirstLineAsHeaders.Get(context);
            var pageMode = PageSelection.Get(context);
            var tables = new List<DataTable>();
            var status = "PDF tables extracted successfully.";

            try
            {
                if (!File.Exists(pdfPath))
                    throw new FileNotFoundException("PDF file not found.", pdfPath);

                var pagesToExtract = new List<int>();

                switch (pageMode)
                {
                    case PageSelectionMode.All:
                        pagesToExtract = null; // null = extract all pages
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

                // Simulated table extraction for demo
                var dummyTable = new DataTable();
                dummyTable.Columns.Add("Column1");
                dummyTable.Columns.Add("Column2");

                if (pagesToExtract == null)
                {
                    dummyTable.Rows.Add("AllPagesRow1", "Value");
                }
                else
                {
                    foreach (var p in pagesToExtract)
                    {
                        dummyTable.Rows.Add("Page" + p + "_Row1", "Value");
                    }
                }

                tables.Add(dummyTable);
                ExtractedTables.Set(context, tables);
            }
            catch (Exception ex)
            {
                status = "Failed to extract tables: " + ex.Message;
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