using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.IO;
using System.Net;
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
        [Description("The language code used by Tesseract (e.g., eng for English).")]
        [DefaultValue("eng")]
        public InArgument<string> LanguageCode { get; set; }

        [DisplayName("TessData Path")]
        [Description("Directory containing the tessdata folder. Leave blank for auto setup.")]
        public InArgument<string> TessDataPath { get; set; }

        [DisplayName("Extracted Text")]
        [Description("Output extracted text from the image.")]
        public OutArgument<string> ExtractedText { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string imagePath = ImagePath.Get(context);
            string langCode = LanguageCode.Get(context) ?? "eng";
            string userProvidedTessdataPath = TessDataPath.Get(context);
            string status = "";

            try
            {
                if (string.IsNullOrWhiteSpace(imagePath) || !File.Exists(imagePath))
                    throw new FileNotFoundException("Image file not found.", imagePath);

                if (!IsSupportedImageFormat(imagePath))
                    throw new ArgumentException($"Unsupported image format: {Path.GetExtension(imagePath)}");

                // Setup tessdata path and ensure language file exists
                string validTessdataPath = GetOrCreateTessdata(langCode, userProvidedTessdataPath, out string logMessage);
                status += logMessage + Environment.NewLine;

                using (var engine = new TesseractEngine(validTessdataPath, langCode, EngineMode.Default))
                using (var img = Pix.LoadFromFile(imagePath))
                using (var page = engine.Process(img))
                {
                    var text = page.GetText()?.Trim();
                    ExtractedText.Set(context, text);
                    IsSuccess.Set(context, true);
                    status += $"OCR success: {text?.Length ?? 0} characters extracted.";
                }
                status += $" OCR completed successfully for language '{langCode}'." + Environment.NewLine;
                StatusMessage.Set(context, status);
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                ExtractedText.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"OCR failed: {ex.Message}\n{status}");
            }
        }

        private string GetOrCreateTessdata(string langCode, string userProvidedPath, out string message)
        {
            var fallbackBase = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tessdata");
            var log = "";

            string[] searchPaths = {
                userProvidedPath,
                fallbackBase,
                @"C:\Program Files\Tesseract-OCR\tessdata",
                @"C:\Tesseract\tessdata"
            };

            foreach (var path in searchPaths)
            {
                if (string.IsNullOrWhiteSpace(path) || !Directory.Exists(path)) continue;

                var trainedData = Path.Combine(path, $"{langCode}.traineddata");
                if (File.Exists(trainedData))
                {
                    message = $"Using existing tessdata from: {path}";
                    return path;
                }
            }

            // If not found, create fallback and download traineddata
            Directory.CreateDirectory(fallbackBase);
            string downloadPath = Path.Combine(fallbackBase, $"{langCode}.traineddata");

            if (!File.Exists(downloadPath))
            {
                try
                {
                    log += $"Downloading missing language data '{langCode}'... ";
                    using (var client = new WebClient())
                    {
                        string url = $"https://github.com/tesseract-ocr/tessdata/raw/master/{langCode}.traineddata";
                        client.DownloadFile(url, downloadPath);
                    }
                    log += "done." + Environment.NewLine;
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to download trained data for '{langCode}': {ex.Message}");
                }
            }

            message = log + $"Using fallback tessdata path: {fallbackBase}";
            return fallbackBase;
        }

        private bool IsSupportedImageFormat(string filePath)
        {
            string ext = Path.GetExtension(filePath)?.ToLower();
            return ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".bmp" || ext == ".tif" || ext == ".tiff";
        }
    }
}