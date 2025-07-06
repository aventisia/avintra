using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using Tesseract;

namespace CodeActivitiesLibrary.DataTransformations.OcrActivities
{
    [DisplayName("Extract Text with OCR")]
    [Description("Extracts text from an image file using Tesseract OCR engine.")]
    public class ExtractTextWithOcrActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Image Path")]
        [Description("The path to the image file (e.g., .png, .jpg).")]
        public InArgument<string> ImagePath { get; set; }

        [DisplayName("Language Code")]
        [Description("The language code used by Tesseract (e.g., eng for English, deu for German).")]
        [DefaultValue("eng")]
        public InArgument<string> LanguageCode { get; set; }

        [DisplayName("TessData Path")]
        [Description("The directory containing Tesseract language data files (tessdata folder). Leave empty to auto-detect.")]
        public InArgument<string> TessDataPath { get; set; }

        [DisplayName("Extracted Text")]
        [Description("Output extracted text from the image.")]
        public OutArgument<string> ExtractedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string status = "Operation started.";

            try
            {
                string imagePath = ImagePath.Get(context);
                string langCode = LanguageCode.Get(context);
                string tessDataPath = TessDataPath.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(imagePath) || !File.Exists(imagePath))
                    throw new FileNotFoundException("Image file not found.", imagePath);

                // Normalize tessDataPath
                tessDataPath = GetValidTessDataPath(tessDataPath);

                if (!Directory.Exists(tessDataPath))
                    throw new DirectoryNotFoundException($"TessData directory not found: {tessDataPath}");

                string trainedDataFile = Path.Combine(tessDataPath, $"{langCode}.traineddata");
                if (!File.Exists(trainedDataFile))
                    throw new FileNotFoundException($"Language file '{trainedDataFile}' not found. Install required language data.");

                // Validate image format
                if (!IsSupportedImageFormat(imagePath))
                    throw new ArgumentException($"Unsupported image format for OCR: {Path.GetExtension(imagePath)}");

                // Initialize Tesseract engine
                using (var engine = new TesseractEngine(tessDataPath, langCode, EngineMode.TesseractOnly))
                {
                    using (var img = Pix.LoadFromFile(imagePath))
                    {
                        if (img == null)
                            throw new Exception("Failed to load image into Tesseract Pix object.");

                        using (var page = engine.Process(img))
                        {
                            string result = page.GetText()?.Trim() ?? "";
                            ExtractedText.Set(context, result);
                            status = $"Successfully extracted {result.Length} characters.";
                        }
                    }
                }

                StatusMessage.Set(context, status);
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                ExtractedText.Set(context, null);
                StatusMessage.Set(context, $"OCR failed: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private string GetValidTessDataPath(string userProvidedPath)
        {
            if (!string.IsNullOrWhiteSpace(userProvidedPath) && Directory.Exists(userProvidedPath))
            {
                return userProvidedPath;
            }

            // Common fallback locations
            var possiblePaths = new[]
            {
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tessdata"),
                @"C:\Tesseract\tessdata",
                @"C:\Program Files\Tesseract-OCR\tessdata",
                @"C:\Program Files (x86)\Tesseract-OCR\tessdata"
            };

            foreach (var path in possiblePaths)
            {
                if (Directory.Exists(path))
                    return path;
            }

            return null;
        }

        private bool IsSupportedImageFormat(string filePath)
        {
            string ext = Path.GetExtension(filePath)?.ToLower();
            return ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".bmp" || ext == ".tif" || ext == ".tiff";
        }
    }
}