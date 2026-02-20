using CodeActivitiesLibrary.Extensions;
using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.Advanced;
using PdfSharpCore.Pdf.IO;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.PdfActivities
{
    [DisplayName("Validate PDF Content")]
    [Description("Validates whether a PDF file contains text or images based on the selected content type")]
    [ActivityMetaData(nodeImg: "/assets/PDF.svg")]
    public class ValidatePdfExistanceActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("PDF File Path")]
        [Description("Full file path of the PDF document to validate")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("PDF Content Type")]
        [Description("Select whether to check for Text or Image content in the PDF")]
        public InArgument<PdfContentType> ContentType { get; set; }

        [DisplayName("Does Pdf Contain")]
        [Description("Returns true if the selected content type exists in the PDF; otherwise false")]
        public OutArgument<bool> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var isContentFound = false;
            var filePath = FilePath.Get(context);
            var contentType = ContentType.Get(context);

            if (string.IsNullOrWhiteSpace(filePath) || !File.Exists(filePath))
                throw new FileNotFoundException("PDF file not found", filePath);

            using (PdfDocument document = PdfReader.Open(filePath, PdfDocumentOpenMode.ReadOnly))
            {
                foreach (var page in document.Pages)
                {
                    switch (contentType)
                    {
                        case PdfContentType.Image:
                            isContentFound = ContainsImage(page);
                            break;

                        case PdfContentType.Text:
                            isContentFound = ContainsText(page);
                            break;

                        default:
                            throw new NotSupportedException($"Unsupported PDF content type: {contentType}");
                    }

                    if (isContentFound)
                        break;
                }
            }
            IsSuccess.Set(context,true);
            StatusMessage.Set(context, "validate pdf successfully");
            Result.Set(context, isContentFound);
        }

        // Validate Image Validation
        private bool ContainsImage(PdfPage page)
        {
            var resources = page.Elements.GetDictionary("/Resources");
            var xObjects = resources?.Elements.GetDictionary("/XObject");

            if (xObjects == null)
                return false;

            foreach (var item in xObjects.Elements.Values)
            {
                var reference = item as PdfReference;
                var xObject = reference?.Value as PdfDictionary;

                if (xObject != null &&
                    xObject.Elements.GetName("/Subtype") == "/Image")
                {
                    return true;
                }
            }

            return false;
        }

        // Validate the Text
        private bool ContainsText(PdfPage page)
        {
            var content = page.Contents.CreateSingleContent();
            string contentText = Encoding.UTF8.GetString(content.Stream.Value);

            return contentText.Contains("Tj") ||contentText.Contains("TJ") ||contentText.Contains("Tf");
        }
    }

    public enum PdfContentType
    {
        [Display(Name = "Text", Description = "Validate text from the PDF.")]
        Text,

        [Display(Name = "Images", Description = "Validate image from the PDF.")]
        Image 
    }
}
