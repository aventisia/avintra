using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Writer;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("Extract PDF Pages from existing PDF to New PDF file")]
    [Description("Extracts specific pages from a PDF file and saves them as a New PDF file.")]
    [ActivityMetaData(nodeImg:"/assets/PDF.svg")]
    public class ExtractPdfPagesFromOldToNewPdfActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Source PDF File Path")]
        [Description("The path to the source PDF file from which pages will be extracted.")]
        public InArgument<string> SourcePdfPath { get; set; }

        [RequiredArgument]
        [DisplayName("Output PDF File Path")]
        [Description("The path where the new PDF file with extracted pages will be saved.")]
        public InArgument<string> NewPdfPath { get; set; }

        [RequiredArgument]
        [DisplayName("Page Selection Mode")]
        [Description("The mode for selecting pages to extract: All, Single, or Range.")]
        public InArgument<PageSelectionModeEnum> PageSelection { get; set; }

        [DisplayName("Password")]
        [Description("The password for the source PDF file, if it is encrypted. Leave empty if not applicable.")]
        [FieldType(FieldType.Password)]
        public InArgument<string> Password { get; set; }

        [DisplayName("Page Number (for Single)")]
        [Description("The specific page number to extract when using Single page selection mode.")]
        [RenderIfCondition(nameof(PageSelection), PageSelectionModeEnum.Single)]
        public InArgument<int> PageNumber { get; set; }

        [DisplayName("From Page Number (for Range)")]
        [Description("The starting page number for the range of pages to extract.")]
        [RenderIfCondition(nameof(PageSelection), PageSelectionModeEnum.Range)]
        public InArgument<int> FromPageNumber { get; set; }

        [DisplayName("To Page Number (for Range)")]
        [Description("The ending page number for the range of pages to extract.")]
        [RenderIfCondition(nameof(PageSelection), PageSelectionModeEnum.Range)]
        public InArgument<int> ToPageNumber { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var sourcePath = SourcePdfPath.Get(context);
                var outputPath = NewPdfPath.Get(context);
                var pageMode = PageSelection.Get(context);
                var password = Password.Get(context);

                if (!File.Exists(sourcePath))
                    throw new FileNotFoundException("Source PDF file not found.", sourcePath);

                if (File.Exists(outputPath))
                    File.Delete(outputPath);

                var pagesToExtract = new List<int>();

                using (var document = string.IsNullOrWhiteSpace(password)
                    ? PdfDocument.Open(sourcePath)
                    : PdfDocument.Open(sourcePath, new ParsingOptions { Password = password }))
                {
                    int totalPages = document.NumberOfPages;

                    switch (pageMode)
                    {
                        case PageSelectionModeEnum.All:
                            pagesToExtract = Enumerable.Range(1, totalPages).ToList();
                            break;

                        case PageSelectionModeEnum.Single:
                            int page = PageNumber.Get(context);
                            if (page < 1 || page > totalPages)
                                throw new ArgumentException("Invalid page number.");
                            pagesToExtract.Add(page);
                            break;

                        case PageSelectionModeEnum.Range:
                            int from = FromPageNumber.Get(context);
                            int to = ToPageNumber.Get(context);

                            if (from < 1 || to < 1 || to < from || to > totalPages)
                                throw new ArgumentException("Invalid page range.");

                            for (int i = from; i <= to; i++)
                                pagesToExtract.Add(i);
                            break;
                    }

                    using (var builder = new PdfDocumentBuilder())
                    {
                        foreach (int pageNumber in pagesToExtract)
                        {
                            var page = document.GetPage(pageNumber);
                            var newPage = builder.AddPage(page.Width, page.Height);
                            newPage.CopyFrom(page);
                        }

                        // Correct PdfPig save
                        var pdfBytes = builder.Build();
                        File.WriteAllBytes(outputPath, pdfBytes);
                    }
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully extracted {pagesToExtract.Count} page(s).");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Error: " + ex.Message);
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