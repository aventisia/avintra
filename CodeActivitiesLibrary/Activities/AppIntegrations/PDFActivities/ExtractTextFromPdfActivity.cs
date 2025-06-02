namespace CodeActivitiesLibrary.AppIntegrations.PDFActivities
{

    // Activity to extract text from a PDF file
    //[DisplayName("Extract Text from PDF"),
    // Description("Extracts text from a PDF file by specifying the source PDF file and the pages to extract from.")]
    //public class ExtractTextFromPdfActivity : Extensions.BaseCodeActivity
    //{
    //    [RequiredArgument, Category("Input"), Description("The path to the source PDF file.")]
    //    public InArgument<string> SourcePdfPath { get; set; }

    //    [Category("Output"), Description("Returns the extracted text from the PDF.")]
    //    public OutArgument<string> Result { get; set; }

    //    
    //    

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var sourcePdfPath = SourcePdfPath.Get(context);
    //        var result = "";
    //        var status = "";

    //        try
    //        {
    //            // Simulate extracting text from PDF (actual implementation would use a library like iTextSharp or PDFBox)
    //            using (var pdfReader = new PdfReader(sourcePdfPath))
    //            {
    //                var textBuilder = new StringBuilder();
    //                for (var page = 1; page <= pdfReader.NumberOfPages; page++)
    //                {
    //                    textBuilder.Append(PdfTextExtractor.GetTextFromPage(pdfReader, page));
    //                }
    //                result = textBuilder.ToString();
    //                status = "Text extracted successfully.";
    //            }
    //        }
    //        catch (Exception ex)
    //        {
    //            result = "";
    //            status = $"Error extracting text from PDF: {ex.Message}";
    //        }

    //        Result.Set(context, result);
    //        StatusMessage.Set(context, status);
    //    }
    //}
}

