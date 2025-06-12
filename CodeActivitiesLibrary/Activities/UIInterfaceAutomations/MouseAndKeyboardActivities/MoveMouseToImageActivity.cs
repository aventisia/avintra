using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities.Helpers;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Move Mouse to Image")]
    [Description("Moves the mouse cursor to the center of a specified image on the screen using template matching.")]
    public class MoveMouseToImageActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Image to Move Mouse To")]
        [Description("The path to the image file to locate.")]
        public InArgument<string> ImagePath { get; set; }


        [DisplayName("Similarity Threshold")]
        [Description("The similarity threshold for image matching (0.0 to 1.0). Default is 0.9.")]
        [DefaultValue(0.9)]
        public InArgument<double> SimilarityThreshold { get; set; }


        [DisplayName("Search Area")]
        [Description("The search area (Left, Top, Right, Bottom). Leave empty for full screen.")]
        public InArgument<Rectangle> SearchArea { get; set; }


        [DisplayName("Mouse Movement Style")]
        [Description("Specifies how the mouse should move to the target position.")]
        [DefaultValue(MouseMovementStyleEnum.Instant)]
        public InArgument<MouseMovementStyleEnum> MouseMovementStyle { get; set; }


        [DisplayName("Occurrence")]
        [Description("Which occurrence of the image to find (1-based index).")]
        [DefaultValue(1)]
        public InArgument<int> Occurrence { get; set; }


        [DisplayName("Send a Click After Moving Mouse")]
        [Description("If true, sends a click after moving the mouse.")]
        public InArgument<bool> SendClickAfterMoving { get; set; }


        [DisplayName("Click Type")]
        [Description("The type of click to perform after moving the mouse.")]
        [DefaultValue(ClickTypeEnum.LeftClick)]
        public InArgument<ClickTypeEnum> ClickType { get; set; }


        [DisplayName("Wait for Image to Appear")]
        [Description("If true, waits for the image to appear before moving the mouse.")]
        public InArgument<bool> WaitForImage { get; set; }


        [DisplayName("Fail Timeout")]
        [Description("Maximum time in seconds to wait for the image to appear.")]
        [DefaultValue(5)]
        public InArgument<int> FailTimeout { get; set; }


        [DisplayName("Offset X")]
        [Description("Horizontal offset from the center of the image.")]
        [DefaultValue(0)]
        public InArgument<int> OffsetX { get; set; }


        [DisplayName("Offset Y")]
        [Description("Vertical offset from the center of the image.")]
        [DefaultValue(0)]
        public InArgument<int> OffsetY { get; set; }


        [DisplayName("Tolerance")]
        [Description("Percentage tolerance for image matching (0-100).")]
        [DefaultValue(10)]
        public InArgument<int> Tolerance { get; set; }


        [DisplayName("Search Mode")]
        [Description("Specifies whether to search the entire screen or a specified region.")]
        [DefaultValue(SearchModeEnum.EntireScreen)]
        public InArgument<SearchModeEnum> SearchMode { get; set; }


        [DisplayName("Search Subregion")]
        [Description("Coordinates of the subregion to search (X1, Y1, X2, Y2).")]
        [RenderIfCondition(nameof(SearchMode), SearchModeEnum.Subregion)]
        public InArgument<Rectangle> SearchSubregion { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Is Found")]
        [Description("Returns true if the image was found and mouse was moved.")]
        public OutArgument<bool> IsFound { get; set; }


        [DisplayName("Found Position")]
        [Description("The position where the image was found (X,Y).")]
        public OutArgument<Point> FoundPosition { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var imagePath = ImagePath.Get(context);
            var threshold = SimilarityThreshold.Get(context);
            var searchArea = SearchArea.Get(context);
            var movementStyle = MouseMovementStyle.Get(context);
            var occurrence = Occurrence.Get(context);
            var sendClick = SendClickAfterMoving.Get(context);
            var clickType = ClickType.Get(context);
            var waitForImage = WaitForImage.Get(context);
            var timeout = FailTimeout.Get(context);
            var offsetX = OffsetX.Get(context);
            var offsetY = OffsetY.Get(context);
            var tolerance = Tolerance.Get(context);
            var searchMode = SearchMode.Get(context);
            var searchRegion = SearchSubregion.Get(context);

            string status;
            var isFound = false;
            var foundPosition = Point.Empty;

            try
            {
                if (string.IsNullOrEmpty(imagePath)) throw new ArgumentException("Image path cannot be null or empty.");

                if (threshold < 0.5 || threshold > 1.0) threshold = 0.9; // Default threshold

                // Load the target image
                using (var targetBitmap = new Bitmap(imagePath))
                {
                    // Capture the screen or search area
                    Bitmap screenBitmap = null;
                    switch (searchMode)
                    {
                        case SearchModeEnum.EntireScreen:
                            screenBitmap = CaptureFullScreen();
                            break;
                        case SearchModeEnum.Subregion:
                            screenBitmap = CaptureScreenArea(searchRegion);
                            break;
                        default:
                            throw new ArgumentOutOfRangeException(nameof(searchMode));
                    }

                    // Find the image using template matching
                    var matchResults = FindImagesUsingTemplateMatching(
                        screenBitmap,
                        targetBitmap,
                        threshold,
                        tolerance);

                    if (matchResults.Count >= occurrence)
                    {
                        var matchResult = matchResults[occurrence - 1];

                        // Adjust position if searching in a specific area
                        var absoluteX = searchArea.IsEmpty
                            ? matchResult.Position.X
                            : searchArea.Left + matchResult.Position.X;
                        var absoluteY = searchArea.IsEmpty
                            ? matchResult.Position.Y
                            : searchArea.Top + matchResult.Position.Y;

                        // Calculate center of the found image
                        var centerX = absoluteX + targetBitmap.Width / 2 + offsetX;
                        var centerY = absoluteY + targetBitmap.Height / 2 + offsetY;

                        // Move the mouse
                        MoveMouse(centerX, centerY, movementStyle);

                        isFound = true;
                        foundPosition = new Point(centerX, centerY);
                        status =
                            $"Mouse moved to image at ({centerX}, {centerY}) with similarity {matchResult.Similarity:P0}";

                        // Optionally send a click
                        if (sendClick) PerformClick(clickType, centerX, centerY);
                    }
                    else
                    {
                        var similarity = matchResults.Any()
                            ? matchResults.First().Similarity
                            : 0.0;
                        status = $"Image not found (best similarity: {similarity:P0})";
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error: {ex.Message}";
            }

            IsFound.Set(context, isFound);
            FoundPosition.Set(context, foundPosition);
            StatusMessage.Set(context, status);
        }

        private static Bitmap CaptureFullScreen()
        {
            var bounds = Screen.PrimaryScreen.Bounds;
            var screenshot = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb);

            using (var graphics = Graphics.FromImage(screenshot))
            {
                graphics.CopyFromScreen(bounds.X, bounds.Y, 0, 0, bounds.Size, CopyPixelOperation.SourceCopy);
            }

            return screenshot;
        }

        private static Bitmap CaptureScreenArea(Rectangle area)
        {
            var screenshot = new Bitmap(area.Width, area.Height, PixelFormat.Format32bppArgb);

            using (var graphics = Graphics.FromImage(screenshot))
            {
                graphics.CopyFromScreen(area.Left, area.Top, 0, 0, area.Size, CopyPixelOperation.SourceCopy);
            }

            return screenshot;
        }

        private static List<MatchResult> FindImagesUsingTemplateMatching(Bitmap screenBitmap, Bitmap targetBitmap,
            double threshold, int tolerance)
        {
            // Convert bitmaps to byte arrays for faster processing
            var screenData = GetBitmapData(screenBitmap);
            var targetData = GetBitmapData(targetBitmap);

            var results = new List<MatchResult>();

            // Search only possible positions where template fits
            for (var y = 0; y <= screenBitmap.Height - targetBitmap.Height; y++)
                for (var x = 0; x <= screenBitmap.Width - targetBitmap.Width; x++)
                {
                    var similarity = CalculateSimilarity(
                        screenData,
                        screenBitmap.Width,
                        targetData,
                        targetBitmap.Width,
                        targetBitmap.Height,
                        x, y);

                    if (similarity >= threshold) results.Add(new MatchResult(true, new Point(x, y), similarity));
                }

            return results.OrderByDescending(r => r.Similarity).ToList();
        }

        private static byte[] GetBitmapData(Bitmap bitmap)
        {
            var rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
            var bitmapData = bitmap.LockBits(rect, ImageLockMode.ReadOnly, bitmap.PixelFormat);

            try
            {
                var bytes = Math.Abs(bitmapData.Stride) * bitmap.Height;
                var rgbValues = new byte[bytes];
                Marshal.Copy(bitmapData.Scan0, rgbValues, 0, bytes);
                return rgbValues;
            }
            finally
            {
                bitmap.UnlockBits(bitmapData);
            }
        }

        private static double CalculateSimilarity(byte[] screenData, int screenWidth,
            byte[] targetData, int targetWidth,
            int targetHeight, int startX, int startY)
        {
            var matchCount = 0;
            var totalPixels = targetWidth * targetHeight;
            var screenStride = screenWidth * 4; // 32bpp = 4 bytes per pixel
            var targetStride = targetWidth * 4;

            for (var y = 0; y < targetHeight; y++)
            {
                var screenY = startY + y;
                var screenIndex = screenY * screenStride + startX * 4;
                var targetIndex = y * targetStride;

                for (var x = 0; x < targetWidth; x++)
                {
                    // Compare BGR (ignore alpha channel)
                    if (screenData[screenIndex] == targetData[targetIndex] && // B
                        screenData[screenIndex + 1] == targetData[targetIndex + 1] && // G
                        screenData[screenIndex + 2] == targetData[targetIndex + 2]) // R
                        matchCount++;

                    screenIndex += 4;
                    targetIndex += 4;
                }
            }

            return (double)matchCount / totalPixels;
        }

        [DllImport("user32.dll")]
        private static extern bool SetCursorPos(int x, int y);

        private static void MoveMouse(int x, int y, MouseMovementStyleEnum movementStyle)
        {
            switch (movementStyle)
            {
                case MouseMovementStyleEnum.Instant:
                    SetCursorPos(x, y);
                    break;
                case MouseMovementStyleEnum.AnimationLowSpeed:
                    AnimateMouseMove(x, y, 10); // Slow speed
                    break;
                case MouseMovementStyleEnum.AnimationNormalSpeed:
                    AnimateMouseMove(x, y, 5); // Normal speed
                    break;
                case MouseMovementStyleEnum.AnimationHighSpeed:
                    AnimateMouseMove(x, y, 2); // Fast speed
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(movementStyle));
            }
        }

        private static void AnimateMouseMove(int targetX, int targetY, int stepDelay)
        {
            var currentPoint = Cursor.Position;
            var deltaX = targetX - currentPoint.X;
            var deltaY = targetY - currentPoint.Y;

            for (var i = 0; i < Math.Max(Math.Abs(deltaX), Math.Abs(deltaY)); i++)
            {
                var newX = currentPoint.X + i * Math.Sign(deltaX);
                var newY = currentPoint.Y + i * Math.Sign(deltaY);

                SetCursorPos(newX, newY);
                Thread.Sleep(stepDelay);
            }

            SetCursorPos(targetX, targetY);
        }

        private static void PerformClick(ClickTypeEnum clickType, int x, int y)
        {
            switch (clickType)
            {
                case ClickTypeEnum.LeftClick:
                    MouseHelper.MouseClick(x, y, MouseButtonsEnum.Left);
                    break;
                case ClickTypeEnum.RightClick:
                    MouseHelper.MouseClick(x, y, MouseButtonsEnum.Right);
                    break;
                case ClickTypeEnum.DoubleClick:
                    MouseHelper.MouseDoubleClick(x, y, MouseButtonsEnum.Left);
                    break;
                case ClickTypeEnum.LeftButtonDown:
                    MouseHelper.MouseDown(x, y, MouseButtonsEnum.Left);
                    break;
                case ClickTypeEnum.LeftButtonUp:
                    MouseHelper.MouseUp(x, y, MouseButtonsEnum.Left);
                    break;
                case ClickTypeEnum.RightButtonDown:
                    MouseHelper.MouseDown(x, y, MouseButtonsEnum.Right);
                    break;
                case ClickTypeEnum.RightButtonUp:
                    MouseHelper.MouseUp(x, y, MouseButtonsEnum.Right);
                    break;
                case ClickTypeEnum.MiddleClick:
                    MouseHelper.MouseClick(x, y, MouseButtonsEnum.Middle);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(clickType));
            }
        }

        private struct MatchResult
        {
            public bool Success { get; }
            public Point Position { get; }
            public double Similarity { get; }

            public MatchResult(bool success, Point position, double similarity)
            {
                Success = success;
                Position = position;
                Similarity = similarity;
            }
        }

        public enum MouseMovementStyleEnum
        {
            [Display(Name = "Instant", Description = "Moves the mouse instantly to the target position.")]
            Instant,

            [Display(Name = "With animation (low speed)", Description = "Moves the mouse with low speed animation.")]
            AnimationLowSpeed,

            [Display(Name = "With animation (normal speed)",
                Description = "Moves the mouse with normal speed animation.")]
            AnimationNormalSpeed,

            [Display(Name = "With animation (high speed)", Description = "Moves the mouse with high speed animation.")]
            AnimationHighSpeed
        }

        public enum ClickTypeEnum
        {
            [Display(Name = "Left click", Description = "Performs a left mouse button click.")]
            LeftClick,

            [Display(Name = "Right click", Description = "Performs a right mouse button click.")]
            RightClick,

            [Display(Name = "Double click", Description = "Performs a double-click action.")]
            DoubleClick,

            [Display(Name = "Left button down", Description = "Presses the left mouse button down.")]
            LeftButtonDown,

            [Display(Name = "Left button up", Description = "Releases the left mouse button up.")]
            LeftButtonUp,

            [Display(Name = "Right button down", Description = "Presses the right mouse button down.")]
            RightButtonDown,

            [Display(Name = "Right button up", Description = "Releases the right mouse button up.")]
            RightButtonUp,

            [Display(Name = "Middle click", Description = "Performs a middle mouse button click.")]
            MiddleClick
        }

        public enum SearchModeEnum
        {
            [Display(Name = "Entire screen", Description = "Searches the entire screen for the image.")]
            EntireScreen,

            [Display(Name = "Specified subregion",
                Description = "Searches a specific subregion of the screen for the image.")]
            Subregion
        }
    }
}