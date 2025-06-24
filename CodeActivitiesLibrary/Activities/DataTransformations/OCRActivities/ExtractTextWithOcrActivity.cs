using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Tesseract;

namespace CodeActivitiesLibrary.DataTransformations.OcrActivities
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
            // Get input arguments
            var imagePath = ImagePath.Get(context);

            try
            {
                // Validate image path
                if (string.IsNullOrEmpty(imagePath) || !System.IO.File.Exists(imagePath))
                {
                    throw new ArgumentException("Image path is invalid or file does not exist.");
                }

                // Initialize Tesseract engine with the correct data directory
                string tessDataPath = @"./tessdata"; // Ensure this points to the actual tessdata directory
                using (var engine = new TesseractEngine(tessDataPath, "eng", EngineMode.Default))
                {
                    // Load the image
                    using (var img = Pix.LoadFromFile(imagePath))
                    {
                        // Process the image and extract text
                        using (var page = engine.Process(img))
                        {
                            var extractedText = page.GetText();
                            ExtractedText.Set(context, extractedText);
                        }
                    }
                }

                // Set success status and message
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