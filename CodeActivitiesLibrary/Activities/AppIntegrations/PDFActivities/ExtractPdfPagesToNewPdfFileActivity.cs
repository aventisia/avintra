using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Writer;

namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{
    [DisplayName("Extract PDF Pages to New File")]
    [Description("Extracts specific pages from a PDF file and saves them as a new PDF.")]
    public class ExtractPdfPagesToNewPdfFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source PDF File Path")]
        [Description("The path to the source PDF file from which pages will be extracted.")]
        public InArgument<string> SourcePdfPath { get; set; }

        [RequiredArgument]
        [DisplayName("Output PDF File Path")]
        [Description("The path where the new PDF file with extracted pages will be saved.")]
        public InArgument<string> OutputPdfPath { get; set; }

        [RequiredArgument]
        [DisplayName("Page Selection Mode")]
        [Description("The mode for selecting pages to extract: All, Single, or Range.")]
        public InArgument<PageSelectionModeEnum> PageSelection { get; set; }

        [DisplayName("Password")]
        [Description("The password for the source PDF file, if it is encrypted. Leave empty if not applicable.")]
        public InArgument<string> Password { get; set; }

        [DisplayName("Page Number (for Single)")]
        [Description("The specific page number to extract when using Single page selection mode.")]
        public InArgument<int> PageNumber { get; set; }

        [DisplayName("From Page Number (for Range)")]
        [Description("The starting page number for the range of pages to extract.")]
        public InArgument<int> FromPageNumber { get; set; }

        [DisplayName("To Page Number (for Range)")]
        [Description("The ending page number for the range of pages to extract.")]
        public InArgument<int> ToPageNumber { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var inputPath = SourcePdfPath.Get(context);
                var outputPath = OutputPdfPath.Get(context);
                var pageMode = PageSelection.Get(context);
                var password = Password.Get(context);

                if (!File.Exists(inputPath))
                    throw new FileNotFoundException("Source PDF file not found.", inputPath);

                if (File.Exists(outputPath))
                    File.Delete(outputPath); // Optional: overwrite existing

                var pagesToExtract = new List<int>();

                switch (pageMode)
                {
                    case PageSelectionModeEnum.All:
                        // Will be filled after reading document
                        break;

                    case PageSelectionModeEnum.Single:
                        var page = PageNumber.Get(context);
                        if (page < 1)
                            throw new ArgumentException("Page number must be at least 1.");
                        pagesToExtract.Add(page);
                        break;

                    case PageSelectionModeEnum.Range:
                        var from = FromPageNumber.Get(context);
                        var to = ToPageNumber.Get(context);
                        if (from < 1 || to < 1 || to < from)
                            throw new ArgumentException("Invalid page range specified.");

                        for (var i = from; i <= to; i++)
                        {
                            pagesToExtract.Add(i);
                        }

                        break;

                    default:
                        throw new ArgumentOutOfRangeException();
                }

                using (var document = string.IsNullOrWhiteSpace(password)
                           ? PdfDocument.Open(inputPath)
                           : PdfDocument.Open(inputPath, new ParsingOptions() { Password = password }))
                {
                    var totalPages = document.NumberOfPages;

                    if (pagesToExtract.Count == 0 && pageMode == PageSelectionModeEnum.All)
                    {
                        pagesToExtract = Enumerable.Range(1, totalPages).ToList();
                    }

                    using (var writer = new PdfDocumentBuilder())
                    {
                        foreach (var pageNumber in pagesToExtract)
                        {
                            if (pageNumber > totalPages || pageNumber < 1)
                                throw new ArgumentOutOfRangeException(nameof(pageNumber),
                                    $"Page {pageNumber} does not exist. Total pages: {totalPages}");

                            var page = document.GetPage(pageNumber);
                            var builderPage = writer.AddPage(page.Width, page.Height);
                            builderPage.CopyFrom(page);
                        }
                    }

                    status = $"Successfully extracted {pagesToExtract.Count} page(s) to '{outputPath}'.";
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, status);
                }
            }
            catch (Exception ex)
            {
                status = $"Error extracting PDF pages: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }

    public enum PageSelectionModeEnum
    {
        [Description("Extract all pages from the PDF.")]
        All,

        [Description("Extract only the specified single page.")]
        Single,

        [Description("Extract a range of pages from the PDF.")]
        Range
    }
}