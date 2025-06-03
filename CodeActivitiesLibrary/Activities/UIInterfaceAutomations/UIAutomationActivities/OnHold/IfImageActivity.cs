using System;
using System.Activities;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    // [DisplayName("If Image")]
    // [Description("Checks if a specific image exists on the screen.")]
    public class IfImageActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The path to the image file to check for.")]
        public InArgument<string> ImagePath { get; set; }


        [Description("Returns true if the image is found, false otherwise.")]
        public OutArgument<bool> Result { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var imagePath = ImagePath.Get(context);
            var result = false;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(imagePath))
                {
                    throw new ArgumentException("Image path cannot be null or empty.");
                }

                // Load the target image
                var targetBitmap = new Bitmap(imagePath);

                // Capture the current screen
                var screenBitmap = CaptureScreen();

                // Search for the target image in the screen bitmap
                result = FindImage(screenBitmap, targetBitmap);

                if (result)
                {
                    StatusMessage.Set(context, "Image found successfully.");
                }
                else
                {
                    StatusMessage.Set(context, "Image not found.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error checking for image: {ex.Message}";
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

