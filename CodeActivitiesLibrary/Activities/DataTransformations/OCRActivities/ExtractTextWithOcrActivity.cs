using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
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

        [DisplayName("Language Code")]
        [Description("The language code used by Tesseract (e.g., 'eng', 'deu', 'fra').")]
        [DefaultValue("eng")]
        public InArgument<string> LanguageCode { get; set; }

        [DisplayName("TessData Path")]
        [Description("The directory containing Tesseract language data files (tessdata).")]
        [DefaultValue(@"C:\Program Files\Tesseract-OCR\tessdata")]
        public InArgument<string> TessDataPath { get; set; }

        [DisplayName("Extracted Text")]
        [Description("Returns the extracted text.")]
        public OutArgument<string> ExtractedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var imagePath = ImagePath.Get(context);
            var languageCode = LanguageCode.Get(context);
            var tessDataPath = TessDataPath.Get(context);

            try
            {
                // Validate image path
                if (string.IsNullOrWhiteSpace(imagePath) || !System.IO.File.Exists(imagePath))
                {
                    throw new ArgumentException("Image path is invalid or file does not exist.");
                }

                // Validate tessdata path
                if (string.IsNullOrWhiteSpace(tessDataPath) || !Directory.Exists(tessDataPath))
                {
                    throw new ArgumentException("TessData path is invalid or directory does not exist.");
                }

                // Check if the required language file exists
                string languageFile = Path.Combine(tessDataPath, $"{languageCode}.traineddata");
                if (!System.IO.File.Exists(languageFile))
                {
                    throw new FileNotFoundException($"Language file '{languageFile}' not found. Ensure the correct language data is installed.");
                }

                // Initialize Tesseract engine
                using (var engine = new TesseractEngine(tessDataPath, languageCode, EngineMode.Default))
                {
                    // Load the image
                    using (var img = Pix.LoadFromFile(imagePath))
                    {
                          // Process the image and extract text
                        using (var page = engine.Process(img))
                        {
                            string extractedText = page.GetText();
                            ExtractedText.Set(context, extractedText.Trim());
                        }
                    }
                }
               
                StatusMessage.Set(context, "OCR text extraction completed successfully.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                ExtractedText.Set(context, null);
                StatusMessage.Set(context, $"Error during OCR extraction: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}