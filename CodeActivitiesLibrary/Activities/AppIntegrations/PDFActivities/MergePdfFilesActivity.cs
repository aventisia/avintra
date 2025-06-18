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
    [DisplayName("Merge PDF Files")]
    [Description("Merges multiple PDF files into a new one.")]
    public class MergePdfFilesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("PDF File Paths")]
        [Description("The paths of the PDF files to merge.")]
        public InArgument<List<string>> PdfFilePaths { get; set; }

        [RequiredArgument]
        [DisplayName("Output PDF Path")]
        [Description("The path to save the merged PDF file.")]
        public InArgument<string> OutputPdfPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var pdfFilePaths = PdfFilePaths.Get(context);
                var outputPdfPath = OutputPdfPath.Get(context);

                if (pdfFilePaths == null || !pdfFilePaths.Any())
                    throw new ArgumentException("No PDF files provided for merging.");

                if (string.IsNullOrWhiteSpace(outputPdfPath))
                    throw new ArgumentException("Output PDF path must be specified.");

                if (File.Exists(outputPdfPath))
                    File.Delete(outputPdfPath); // Optional: overwrite existing

                using (var writer = new PdfDocumentBuilder())
                {
                    foreach (var filePath in pdfFilePaths)
                    {
                        if (!File.Exists(filePath))
                            throw new FileNotFoundException("One or more PDF files were not found.", filePath);

                        using (var document = PdfDocument.Open(filePath))
                            writer.AddPage(document, document.NumberOfPages + 1);
                    }

                    var pdf = writer.Build();
                    using (var stream = new FileStream(outputPdfPath, FileMode.Create, FileAccess.Write))
                        stream.Write(pdf, 0, pdf.Length);

                    status = $"Successfully merged {pdfFilePaths.Count()} PDF file(s) into '{outputPdfPath}'.";
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, status);
                }
            }
            catch (Exception ex)
            {
                status = $"Error merging PDF files: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}