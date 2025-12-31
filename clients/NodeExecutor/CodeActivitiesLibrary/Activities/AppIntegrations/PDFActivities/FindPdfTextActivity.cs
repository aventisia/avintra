using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using UglyToad.PdfPig;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("PDF Regex Contains")]
    [Description("Checks if the PDF contains text matching a regular expression pattern (case-sensitive).")]
    [ActivityMetaData(nodeImg:"/assets/PDF.svg")]
    public class FindPdfTextActivity : BaseCodeActivity
    {
        #region Input Arguments

        [RequiredArgument]
        [DisplayName("PDF File Path")]
        [Description("Full path to the PDF file to search (e.g., C:\\docs\\document.pdf).")]
        public InArgument<string> PdfFilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Regex Pattern")]
        [Description("Regular expression to search for in the PDF (e.g., \"Name:\\s*\\w+\"). Case-sensitive.")]
        public InArgument<string> RegexPattern { get; set; }

        #endregion

        #region Output Arguments

        [DisplayName("Text Found")]
        [Description("True if the regex pattern matches any text in the PDF; otherwise, false.")]
        public OutArgument<bool> TextFound { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            string pdfPath = PdfFilePath.Get(context);
            string pattern = RegexPattern.Get(context);

            try
            {
                // Validate inputs
                if (string.IsNullOrWhiteSpace(pdfPath))
                    throw new ArgumentException("PDF file path is required.");

                if (!System.IO.File.Exists(pdfPath))
                    throw new System.IO.FileNotFoundException($"PDF file not found: {pdfPath}");

                if (string.IsNullOrWhiteSpace(pattern))
                    throw new ArgumentException("Regex pattern is required.");

                // Extract all text from PDF
                string pdfText = ExtractTextFromPdf(pdfPath);

                // Perform case-sensitive regex match
                bool found = Regex.IsMatch(pdfText, pattern);

                TextFound.Set(context, found);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, found
                    ? "Success: Regex pattern matched in PDF."
                    : "Success: No match found for regex pattern.");
            }
            catch (Exception ex)
            {
                TextFound.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }

        private static string ExtractTextFromPdf(string filePath)
        {
            var text = new System.Text.StringBuilder();
            using (var document = PdfDocument.Open(filePath))
            {
                foreach (var page in document.GetPages())
                {
                    text.Append(page.Text);
                }
            }
            return text.ToString();
        }
    }
}