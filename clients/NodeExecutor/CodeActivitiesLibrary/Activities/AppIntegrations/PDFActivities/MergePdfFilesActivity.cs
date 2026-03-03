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
    [ActivityMetaData(nodeImg: "/assets/PDF.svg")]
    public class MergePdfFilesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("PDF File Paths")]
        [Description("The paths of the PDF files to merge.")]
        public InArgument<List<string>> PdfFilePaths { get; set; }

        [RequiredArgument]
        [DisplayName("Output PDF Path")]
        [Description("The full file path where the merged PDF will be saved. Include the complete path with the new PDF filename and .pdf extension (e.g., C:\\Documents\\MergedFile.pdf)")]
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

                var outputDir = Path.GetDirectoryName(outputPdfPath);
                if (!string.IsNullOrEmpty(outputDir) && !Directory.Exists(outputDir))
                    Directory.CreateDirectory(outputDir);

                if (File.Exists(outputPdfPath))
                    File.Delete(outputPdfPath);

                using (var writer = new PdfDocumentBuilder())
                {
                    foreach (var filePath in pdfFilePaths)
                    {
                        if (!File.Exists(filePath))
                            throw new FileNotFoundException($"PDF file not found: '{filePath}'", filePath);

                        using (var document = PdfDocument.Open(filePath))
                        {
                            // Add ALL pages from this document (1-based indexing)
                            for (int pageNumber = 1; pageNumber <= document.NumberOfPages; pageNumber++)
                            {
                                writer.AddPage(document, pageNumber);
                            }
                        }
                    }
                    var pdfBytes = writer.Build();
                    File.WriteAllBytes(outputPdfPath, pdfBytes);

                    status = $"Successfully merged {pdfFilePaths.Count} PDF file(s) into '{outputPdfPath}'.";
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