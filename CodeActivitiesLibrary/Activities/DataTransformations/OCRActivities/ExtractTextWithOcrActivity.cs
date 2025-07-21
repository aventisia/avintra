using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Threading.Tasks;
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
            try
            {
                string imagePath = ImagePath.Get(context);
                string langCode = LanguageCode.Get(context) ?? "eng";
                string userProvidedTessdataPath = TessDataPath.Get(context);
                // Validate input image
                if (string.IsNullOrWhiteSpace(imagePath) || !File.Exists(imagePath))
                    throw new FileNotFoundException("Image file not found.", imagePath);
                if (!IsSupportedImageFormat(imagePath))
                    throw new ArgumentException($"Unsupported image format: {Path.GetExtension(imagePath)}");
                // Setup tessdata path (auto-download if needed)
                string validTessdataPath = GetOrCreateTessdata(langCode, userProvidedTessdataPath, out string logMessage);
                // Run OCR
                using (var engine = new TesseractEngine(validTessdataPath, langCode, EngineMode.Default))
                using (var img = Pix.LoadFromFile(imagePath))
                using (var page = engine.Process(img))
                {
                    var text = page.GetText()?.Trim();
                    // Set outputs
                    ExtractedText.Set(context, text);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"OCR completed successfully. {text?.Length ?? 0} characters extracted.\n{logMessage}");
                }
            }
            catch (Exception ex)
            {
                ExtractedText.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"OCR failed: {ex.Message}");
            }
        }
        private string GetOrCreateTessdata(string langCode, string userProvidedPath, out string message)
        {
            var log = "";
            // Try user-provided path first
            if (!string.IsNullOrWhiteSpace(userProvidedPath))
            {
                var trainedDataFile = Path.Combine(userProvidedPath, $"{langCode}.traineddata");
                if (File.Exists(trainedDataFile))
                {
                    message = $"Using user-provided tessdata path: {userProvidedPath}";
                    return userProvidedPath;
                }
                else
                {
                    throw new FileNotFoundException($"Language file '{langCode}.traineddata' not found at: {userProvidedPath}");
                }
            }
            // Fallback directories
            string baseDir = AppDomain.CurrentDomain.BaseDirectory ?? Directory.GetCurrentDirectory();
            string fallbackBase = Path.Combine(baseDir, "tessdata");
            string[] fallbackPaths = {
                fallbackBase,
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "tessdata"),
                @"C:\Tesseract\tessdata"
            };
            foreach (var path in fallbackPaths)
            {
                if (string.IsNullOrWhiteSpace(path)) continue;
                var trainedData = Path.Combine(path, $"{langCode}.traineddata");
                if (Directory.Exists(path) && File.Exists(trainedData))
                {
                    message = $"Using fallback tessdata path: {path}";
                    return path;
                }
            }
            // Ensure fallback directory exists
            if (!Directory.Exists(fallbackBase))
            {
                Directory.CreateDirectory(fallbackBase);
                log += $"Created tessdata directory: {fallbackBase}\n";
            }
            string downloadPath = Path.Combine(fallbackBase, $"{langCode}.traineddata");
            if (!File.Exists(downloadPath))
            {
                try
                {
                    log += $"Downloading '{langCode}.traineddata'... ";
                    DownloadWithRetryAsync(downloadPath, $"https://github.com/tesseract-ocr/tessdata/raw/main/{langCode}.traineddata").Wait();
                    log += "Done.\n";
                }
                catch (Exception ex)
                {
                    throw new Exception($"Failed to download trained data for '{langCode}': {ex.InnerException?.Message ?? ex.Message}");
                }
            }
            message = log + $"Using downloaded tessdata path: {fallbackBase}";
            return fallbackBase;
        }
        private async Task DownloadWithRetryAsync(string saveToPath, string url, int maxRetries = 3)
        {
            using (var client = new System.Net.Http.HttpClient())
            {
                client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
                for (int i = 0; i < maxRetries; i++)
                {
                    try
                    {
                        var response = await client.GetStreamAsync(url);
                        using (var fs = new FileStream(saveToPath, FileMode.Create, FileAccess.Write, FileShare.None))
                        {
                            await response.CopyToAsync(fs);
                        }
                        return;
                    }
                    catch (Exception)
                    {
                        if (i == maxRetries - 1) throw;
                        await Task.Delay(1000); // Wait before retry
                    }
                }
            }
        }
        private bool IsSupportedImageFormat(string filePath)
        {
            string ext = Path.GetExtension(filePath)?.ToLowerInvariant();
            return ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".bmp" || ext == ".tif" || ext == ".tiff";
        }
    }
}