namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{

    //Activity to extract PDF file pages to a new PDF file
    //[DisplayName("Extract PDF File Pages to New PDF File"),
    // Description("Creates a new PDF file by extracting pages from an existing PDF file.")]
    // public class ExtractPdfPagesToNewPdfFileActivity : BaseCodeActivity
    // {
    //     [RequiredArgument, Category("Input"), Description("The path to the source PDF file.")]
    //     public InArgument<string> SourcePdfPath { get; set; }

    //     [RequiredArgument, Category("Input"), Description("The path to save the new PDF file.")]
    //     public InArgument<string> OutputPdfPath { get; set; }

    //     
    //     

    //     protected override void Execute(CodeActivityContext context)
    //     {
    //         var sourcePdfPath = SourcePdfPath.Get(context);
    //         var outputPdfPath = OutputPdfPath.Get(context);
    //         var status = "";

    //         try
    //         {
    //             // Simulate extracting PDF pages to a new PDF file (actual implementation would use a library like iTextSharp or PDFBox)
    //             using (var pdfReader = new PdfReader(sourcePdfPath))
    //             {
    //                 using (var pdfStamper = new PdfStamper(pdfReader, new FileStream(outputPdfPath, FileMode.Create)))
    //                 {
    //                     for (var page = 1; page <= pdfReader.NumberOfPages; page++)
    //                     {
    //                         pdfStamper.NewPage();
    //                         pdfStamper.AddPage(pdfStamper.GetImportedPage(pdfReader, page));
    //                     }
    //                 }
    //                 status = $"PDF pages extracted successfully to '{outputPdfPath}'.";
    //             }
    //         }
    //         catch (Exception ex)
    //         {
    //             status = $"Error extracting PDF pages: {ex.Message}";
    //         }

    //         StatusMessage.Set(context, status);
    //     }
    // }
}