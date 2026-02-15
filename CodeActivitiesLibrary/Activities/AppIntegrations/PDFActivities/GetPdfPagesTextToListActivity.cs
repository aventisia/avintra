using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UglyToad.PdfPig;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("Get PDF Pages Text in List")]
    [Description("Extracts text from each page of a PDF file and returns a list of page texts.")]
    [ActivityMetaData(nodeImg:"/assets/PDF.svg")]
    public class GetPdfPagesTextToListActivity : BaseCodeActivity
    {
        #region Input Arguments

        [RequiredArgument]
        [DisplayName("PDF File Path")]
        [Description("Full path to the PDF file to extract text from (e.g., C:\\docs\\input.pdf).")]
        public InArgument<string> PdfFilePath { get; set; }

        #endregion

        #region Output Arguments

        [DisplayName("Page Texts")]
        [Description("List of strings, where each item contains the extracted text from one page.")]
        public OutArgument<List<string>> ListOfPages { get; set; }

        [DisplayName("Page Count")]
        [Description("Total number of pages processed.")]
        public OutArgument<int> PageCount { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var inputPath = PdfFilePath.Get(context);
            var pageListText = new List<string>();
            int pageCount = 0;

            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(inputPath))
                    throw new ArgumentException("PDF file path is required.");

                if (!File.Exists(inputPath))
                    throw new FileNotFoundException($"PDF file not found: {inputPath}");

                // Open and extract text page by page
                using (var document = PdfDocument.Open(inputPath))
                {
                    pageCount = document.NumberOfPages;

                    for (int i = 1; i <= document.NumberOfPages; i++) // 1-based index
                    {
                        var page = document.GetPage(i);
                        string text = page.Text ?? string.Empty; // Extract all text on page
                        pageListText.Add(text);
                    }
                }

                // Set outputs
                ListOfPages.Set(context, pageListText);
                PageCount.Set(context, pageCount);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully extracted text from {pageCount} page(s).");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error extracting PDF text: {ex.Message}");
                IsSuccess.Set(context, false);
                ListOfPages.Set(context, new List<string>()); 
                PageCount.Set(context, 0);
            }
        }
    }
}
