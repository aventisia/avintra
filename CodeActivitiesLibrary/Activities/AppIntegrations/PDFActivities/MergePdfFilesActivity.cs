using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{
    // Activity to merge multiple PDF files into a new one
    //[DisplayName("Merge PDF Files"), Description("Merges multiple PDF files into a new one.")]
    //public class MergePdfFilesActivity : CodeActivity
    //{
    //    [RequiredArgument, Category("Input"), Description("The paths of the PDF files to merge.")]
    //    public InArgument<IEnumerable<string>> PdfFilePaths { get; set; }

    //    [RequiredArgument, Category("Input"), Description("The path to save the merged PDF file.")]
    //    public InArgument<string> OutputPdfPath { get; set; }

    //    [Category("Output"), Description("Returns the status message of the operation.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var pdfFilePaths = PdfFilePaths.Get(context);
    //        var outputPdfPath = OutputPdfPath.Get(context);
    //        var status = "";

    //        try
    //        {
    //            // Simulate merging PDF files (actual implementation would use a library like iTextSharp or PDFBox)
    //            using (var pdfWriter = new PdfWriter(outputPdfPath))
    //            {
    //                using (var pdfDocument = new PdfDocument(pdfWriter))
    //                {
    //                    foreach (var pdfFilePath in pdfFilePaths)
    //                    {
    //                        using (var pdfReader = new PdfReader(pdfFilePath))
    //                        {
    //                            using (var pdfDocumentSource = new PdfDocument(pdfReader))
    //                            {
    //                                pdfDocument.CopyPagesFrom(pdfDocumentSource, pdfDocumentSource.GetPageNumbers(), pdfDocument);
    //                            }
    //                        }
    //                    }
    //                }
    //                status = $"PDF files merged successfully to '{outputPdfPath}'.";
    //            }
    //        }
    //        catch (Exception ex)
    //        {
    //            status = $"Error merging PDF files: {ex.Message}";
    //        }

    //        StatusMessage.Set(context, status);
    //    }
    //}
}