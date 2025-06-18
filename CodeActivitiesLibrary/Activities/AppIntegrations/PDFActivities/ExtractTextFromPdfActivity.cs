using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using UglyToad.PdfPig;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("Extract Text from PDF (PDFPig)")]
    [Description("Extracts text from a PDF file using PdfPig library.")]
    public class ExtractTextFromPdfActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The path to the source PDF file.")]
        public InArgument<string> SourcePdfPath { get; set; }

        [Category("Output")]
        [DisplayName("Extracted Text")]
        [Description("Returns the extracted text from the PDF.")]
        public OutArgument<string> ExtractedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var resultText = "";

            try
            {
                var sourcePdfPath = SourcePdfPath.Get(context);

                if (!File.Exists(sourcePdfPath))
                    throw new FileNotFoundException("Source PDF file not found.", sourcePdfPath);

                // Open PDF document using PdfPig
                using (var document = PdfDocument.Open(sourcePdfPath))
                {
                    var textBuilder = new System.Text.StringBuilder();

                    foreach (var page in document.GetPages())
                    {
                        textBuilder.AppendLine(page.Text);
                    }

                    resultText = textBuilder.ToString();
                    status = $"Successfully extracted text from '{sourcePdfPath}'.";


                    ExtractedText.Set(context, resultText);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, status);
                }
            }
            catch (Exception ex)
            {
                resultText = "";
                status = $"Error extracting text from PDF: {ex.Message}";
                ExtractedText.Set(context, resultText);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}