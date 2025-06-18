using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Take Screenshot")]
    [Description(
        "Takes a screenshot of all screens, primary screen, or a specific screen and saves it to clipboard or file.")]
    public class TakeScreenshotActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Capture")]
        [Description("Specifies which part of the screen to capture.")]
        public InArgument<CaptureModeEnum> CaptureMode { get; set; }

        //TODO need empliment logic to select screen by name
        [DisplayName("Screen to Capture")]
        [Description("The handle of the screen/window to capture (required if 'Capture' is 'Select screen').")]
        [RenderIfCondition(nameof(CaptureMode), CaptureModeEnum.SelectScreen)]
        public InArgument<IntPtr> ScreenToCapture { get; set; }

        [DisplayName("Save Screenshot To")]
        [Description("Specifies where to save the screenshot.")]
        public InArgument<SaveModeEnum> SaveMode { get; set; }

        [DisplayName("Image File Path")]
        [Description("The path to save the screenshot file (required if 'Save Screenshot To' is 'File').")]
        [RenderIfCondition(nameof(SaveMode), SaveModeEnum.File)]
        public InArgument<string> ImageFilePath { get; set; }

        [DisplayName("Image Format")]
        [Description("The format in which to save the screenshot (required if 'Save Screenshot To' is 'File').")]
        [DefaultValue(ImageFormatEnum.BMP)]
        [RenderIfCondition(nameof(SaveMode), SaveModeEnum.File)]
        public InArgument<ImageFormatEnum> ImageFormat { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var captureMode = CaptureMode.Get(context);
                var screenToCapture = ScreenToCapture.Get(context);
                var saveMode = SaveMode.Get(context);
                var imageFilePath = ImageFilePath.Get(context);
                var imageFormat = ImageFormat.Get(context);

                switch (captureMode)
                {
                    case CaptureModeEnum.AllScreens:
                        CaptureAllScreens(saveMode, imageFilePath, imageFormat);
                        break;

                    case CaptureModeEnum.PrimaryScreen:
                        CapturePrimaryScreen(saveMode, imageFilePath, imageFormat);
                        break;

                    case CaptureModeEnum.SelectScreen:
                        CaptureSpecificScreen(screenToCapture, saveMode, imageFilePath, imageFormat);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(captureMode));
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error taking screenshot: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static void CaptureAllScreens(SaveModeEnum saveMode, string imageFilePath, ImageFormatEnum imageFormat)
        {
            using (var graphics = Graphics.FromHwnd(IntPtr.Zero))
            {
                var bounds = Screen.AllScreens.Select(s => s.Bounds).Aggregate(Rectangle.Union);
                using (var bitmap = new Bitmap(bounds.Width, bounds.Height, graphics))
                using (var memoryGraphics = Graphics.FromImage(bitmap))
                {
                    memoryGraphics.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);

                    switch (saveMode)
                    {
                        case SaveModeEnum.Clipboard:
                            Clipboard.SetImage(bitmap);
                            break;
                        case SaveModeEnum.File when string.IsNullOrWhiteSpace(imageFilePath):
                            throw new ArgumentException("Image file path cannot be null or empty.");
                        case SaveModeEnum.File:
                            {
                                var format = GetImageFormat(imageFormat);
                                bitmap.Save(imageFilePath, format);
                                break;
                            }
                    }
                }
            }
        }

        private static void CapturePrimaryScreen(SaveModeEnum saveMode, string imageFilePath,
            ImageFormatEnum imageFormat)
        {
            using (var graphics = Graphics.FromHwnd(IntPtr.Zero))
            {
                var bounds = Screen.PrimaryScreen.Bounds;
                using (var bitmap = new Bitmap(bounds.Width, bounds.Height, graphics))
                using (var memoryGraphics = Graphics.FromImage(bitmap))
                {
                    memoryGraphics.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);

                    if (saveMode == SaveModeEnum.Clipboard)
                    {
                        Clipboard.SetImage(bitmap);
                    }
                    else if (saveMode == SaveModeEnum.File)
                    {
                        if (string.IsNullOrWhiteSpace(imageFilePath))
                            throw new ArgumentException("Image file path cannot be null or empty.");

                        var format = GetImageFormat(imageFormat);
                        bitmap.Save(imageFilePath, format);
                    }
                }
            }
        }

        private static void CaptureSpecificScreen(IntPtr screenHandle, SaveModeEnum saveMode, string imageFilePath,
            ImageFormatEnum imageFormat)
        {
            using (var graphics = Graphics.FromHwnd(screenHandle))
            {
                var bounds = Screen.FromHandle(screenHandle).Bounds;
                using (var bitmap = new Bitmap(bounds.Width, bounds.Height, graphics))
                using (var memoryGraphics = Graphics.FromImage(bitmap))
                {
                    memoryGraphics.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);

                    switch (saveMode)
                    {
                        case SaveModeEnum.Clipboard:
                            Clipboard.SetImage(bitmap);
                            break;
                        case SaveModeEnum.File when string.IsNullOrWhiteSpace(imageFilePath):
                            throw new ArgumentException("Image file path cannot be null or empty.");
                        case SaveModeEnum.File:
                            {
                                var format = GetImageFormat(imageFormat);
                                bitmap.Save(imageFilePath, format);
                                break;
                            }
                    }
                }
            }
        }

        private static ImageFormat GetImageFormat(ImageFormatEnum format)
        {
            switch (format)
            {
                case ImageFormatEnum.BMP:
                    return System.Drawing.Imaging.ImageFormat.Bmp;
                case ImageFormatEnum.GIF:
                    return System.Drawing.Imaging.ImageFormat.Gif;
                case ImageFormatEnum.JPG:
                    return System.Drawing.Imaging.ImageFormat.Jpeg;
                case ImageFormatEnum.PNG:
                    return System.Drawing.Imaging.ImageFormat.Png;
                case ImageFormatEnum.TIFF:
                    return System.Drawing.Imaging.ImageFormat.Tiff;
                default:
                    throw new ArgumentOutOfRangeException(nameof(format));
            }
        }
    }

    public enum CaptureModeEnum
    {
        [Display(Name = "All screens", Description = "Captures all available screens.")]
        AllScreens,

        [Display(Name = "Primary screen", Description = "Captures only the primary screen.")]
        PrimaryScreen,

        [Display(Name = "Select screen", Description = "Captures a specific screen/window by handle.")]
        SelectScreen
    }

    public enum SaveModeEnum
    {
        [Display(Name = "Clipboard", Description = "Saves the screenshot to the clipboard.")]
        Clipboard,

        [Display(Name = "File", Description = "Saves the screenshot to a file.")]
        File
    }

    public enum ImageFormatEnum
    {
        [Display(Name = "BMP", Description = "Bitmap format.")]
        BMP,

        [Display(Name = "GIF", Description = "GIF format.")]
        GIF,

        [Display(Name = "JPG", Description = "JPEG format.")]
        JPG,

        [Display(Name = "PNG", Description = "Portable Network Graphics format.")]
        PNG,

        [Display(Name = "TIFF", Description = "Tagged Image File Format.")]
        TIFF
    }
}