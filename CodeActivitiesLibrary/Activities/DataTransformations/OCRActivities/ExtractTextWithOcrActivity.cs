using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Tesseract;

namespace CodeActivitiesLibrary.DataTransformations.OCRActivities
{
    [DisplayName("Extract Text with OCR")]
    [Description("Extract text from a given source using the given OCR engine")]
    public class ExtractTextWithOcrActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Image Path")]
        [Description("The path to the image file.")]
        public InArgument<string> ImagePath { get; set; }


        [DisplayName("Extracted Text")]
        [Description("Returns the extracted text.")]
        public OutArgument<string> ExtractedText { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var imagePath = ImagePath.Get(context);
            var extractedText = "";
            var status = "";
            try
            {
                if (string.IsNullOrEmpty(imagePath) || !System.IO.File.Exists(imagePath))
                {
                    throw new ArgumentException("Image path is invalid or file does not exist.");
                }

                using (var engine = new TesseractEngine(System.IO.Path.GetDirectoryName(imagePath), "eng",
                           EngineMode.Default))
                {
                    using (var img = Pix.LoadFromFile(imagePath))
                    {
                        using (var page = engine.Process(img))
                        {
                            extractedText = page.GetText();
                        }
                    }

                    status = "Text extracted successfully.";
                }

                ExtractedText.Set(context, extractedText);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Text extracted successfully.");
            }
            catch (Exception ex)
            {
                ExtractedText.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error extracting text with OCR: {ex.Message}");
            }

        }
    }
}