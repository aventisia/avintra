using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    // [DisplayName("Wait for Image")]
    // [Description("Suspends execution until a specific image appears on the screen.")]
    public class WaitForImageActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The path to the image file to wait for.")]
        public InArgument<string> ImagePath { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The maximum time to wait (in seconds).")]
        public InArgument<int> TimeoutSeconds { get; set; }

        [Category("Output")]
        [Description("Returns true if the image was found, false otherwise.")]
        public OutArgument<bool> Result { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        

        protected override void Execute(CodeActivityContext context)
        {
            var imagePath = ImagePath.Get(context);
            var timeoutSeconds = TimeoutSeconds.Get(context);
            var result = false;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(imagePath))
                {
                    throw new ArgumentException("Image path cannot be null or empty.");
                }

                if (timeoutSeconds < 0)
                {
                    throw new ArgumentException("Timeout must be a non-negative value.");
                }

                // Load the target image
                var targetBitmap = new Bitmap(imagePath);

                // Start the timer
                var startTime = DateTime.Now;
                var endTime = startTime.AddSeconds(timeoutSeconds);

                while (DateTime.Now < endTime)
                {
                    // Capture the current screen
                    var screenBitmap = CaptureScreen();

                    // Search for the target image in the screen bitmap
                    if (FindImage(screenBitmap, targetBitmap))
                    {
                        result = true;
                        break;
                    }

                    // Wait for a short interval before retrying
                    Thread.Sleep(500); // Adjust as needed
                }

                if (result)
                {
                    StatusMessage.Set(context, "Image found successfully.");
                }
                else
                {
                    StatusMessage.Set(context, "Image not found within the specified timeout.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error waiting for image: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }

        private static Bitmap CaptureScreen()
        {
            var bounds = Screen.PrimaryScreen.Bounds;
            var bmpScreenshot = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb);
            var graphics = Graphics.FromImage(bmpScreenshot);
            graphics.CopyFromScreen(bounds.X, bounds.Y, 0, 0, bounds.Size, CopyPixelOperation.SourceCopy);
            return bmpScreenshot;
        }

        private static bool FindImage(Bitmap screenBitmap, Bitmap targetBitmap)
        {
            // Use AForge.NET or another library for image matching
            // For simplicity, this example assumes a basic pixel comparison
            // You can replace this with a more robust image recognition library like OpenCV or AForge.NET

            for (var x = 0; x <= screenBitmap.Width - targetBitmap.Width; x++)
            {
                for (var y = 0; y <= screenBitmap.Height - targetBitmap.Height; y++)
                {
                    var match = true;
                    for (var dx = 0; dx < targetBitmap.Width; dx++)
                    {
                        for (var dy = 0; dy < targetBitmap.Height; dy++)
                        {
                            if (screenBitmap.GetPixel(x + dx, y + dy) != targetBitmap.GetPixel(dx, dy))
                            {
                                match = false;
                                break;
                            }
                        }
                        if (!match)
                        {
                            break;
                        }
                    }
                    if (match)
                    {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}