using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Save Image")]
    [Description("Saves a screenshot of a UI element or region to disk.")]
    public class SaveImageActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Image Source")]
        [Description("The source of the image (e.g., screen region, control).")]
        public InArgument<Bitmap> ImageSource { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("Full path where the image will be saved (e.g., C:\\temp\\image.png).")]
        public InArgument<string> FilePath { get; set; }

        [DisplayName("Image Format")]
        [Description("Format of the saved image (e.g., PNG, JPEG). Default: PNG.")]
        public InArgument<string> Format { get; set; } = "PNG";

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var imageSource = ImageSource.Get(context);
                var filePath = FilePath.Get(context);
                var formatStr = Format.Get(context).ToUpper();
                var continueOnError = ContinueOnError.Get(context);

                if (imageSource == null)
                    throw new ArgumentException("Image Source cannot be null.");
                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File Path is required.");

                ImageFormat format;
                switch (formatStr)
                {
                    case "JPEG":
                        format = ImageFormat.Jpeg;
                        break;
                    case "PNG":
                        format = ImageFormat.Png;
                        break;
                    case "BMP":
                        format = ImageFormat.Bmp;
                        break;
                    default:
                        format = ImageFormat.Png;
                        break;
                }

                // Ensure directory exists
                var dir = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(dir))
                    Directory.CreateDirectory(dir);

                // Save image
                imageSource.Save(filePath, format);

                StatusMessage.Set(context, $"Image saved successfully to: {filePath}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error saving image: {ex.Message}";
                StatusMessage.Set(context, errorMsg);
                IsSuccess.Set(context, false);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }
    }
}