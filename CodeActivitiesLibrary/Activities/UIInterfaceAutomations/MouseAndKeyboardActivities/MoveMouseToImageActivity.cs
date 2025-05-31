namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    //[DisplayName("Move Mouse to Image")]
    //[Description("Moves the mouse cursor to the center of a specified image on the screen.")]
    //public class MoveMouseToImageActivity : CodeActivity
    //{
    //    [RequiredArgument]
    //    [Category("Input")]
    //    [Description("The path to the image file to locate.")]
    //    public InArgument<string> ImagePath { get; set; }

    //    [Category("Output")]
    //    [Description("Returns the status message.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var imagePath = ImagePath.Get(context);
    //        string status = "";

    //        try
    //        {
    //            if (string.IsNullOrEmpty(imagePath))
    //            {
    //                throw new ArgumentException("Image path cannot be null or empty.");
    //            }

    //            // Load the target image
    //            var targetBitmap = new Bitmap(imagePath);

    //            // Capture the current screen
    //            var screenBitmap = CaptureScreen();

    //            // Search for the target image in the screen bitmap
    //            var imageLocation = FindImage(screenBitmap, targetBitmap);

    //            if (imageLocation == null)
    //            {
    //                status = "Image not found on the screen.";
    //                StatusMessage.Set(context, status);
    //                return;
    //            }

    //            // Calculate the center of the image
    //            var centerX = imageLocation.X + targetBitmap.Width / 2;
    //            var centerY = imageLocation.Y + targetBitmap.Height / 2;

    //            // Move the mouse cursor to the center of the image
    //            MoveMouseToPosition(centerX, centerY);

    //            status = $"Mouse moved to the center of the image at ({centerX}, {centerY}).";
    //            StatusMessage.Set(context, status);
    //        }
    //        catch (Exception ex)
    //        {
    //            status = $"Error moving mouse to image: {ex.Message}";
    //        }

    //        StatusMessage.Set(context, status);
    //    }

    //    private static Bitmap CaptureScreen()
    //    {
    //        var bounds = Screen.PrimaryScreen.Bounds;
    //        var bmpScreenshot = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb);
    //        var graphics = Graphics.FromImage(bmpScreenshot);
    //        graphics.CopyFromScreen(bounds.X, bounds.Y, 0, 0, bounds.Size, CopyPixelOperation.SourceCopy);
    //        return bmpScreenshot;
    //    }

    //    private static Point? FindImage(Bitmap screenBitmap, Bitmap targetBitmap)
    //    {
    //        // Use AForge.NET or another library for image matching
    //        // For simplicity, this example assumes a basic pixel comparison
    //        // You can replace this with a more robust image recognition library like OpenCV or AForge.NET

    //        for (int x = 0; x <= screenBitmap.Width - targetBitmap.Width; x++)
    //        {
    //            for (int y = 0; y <= screenBitmap.Height - targetBitmap.Height; y++)
    //            {
    //                bool match = true;
    //                for (int dx = 0; dx < targetBitmap.Width; dx++)
    //                {
    //                    for (int dy = 0; dy < targetBitmap.Height; dy++)
    //                    {
    //                        if (screenBitmap.GetPixel(x + dx, y + dy) != targetBitmap.GetPixel(dx, dy))
    //                        {
    //                            match = false;
    //                            break;
    //                        }
    //                    }
    //                    if (!match)
    //                    {
    //                        break;
    //                    }
    //                }
    //                if (match)
    //                {
    //                    return new Point(x, y);
    //                }
    //            }
    //        }
    //        return null;
    //    }

    //    private static void MoveMouseToPosition(int x, int y)
    //    {
    //        // Use Windows Input Simulator or similar library to move the mouse
    //        // For simplicity, we use SendKeys here
    //        Cursor.Position = new Point(x, y);
    //    }
    //}
}