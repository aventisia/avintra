using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Forms;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    //[DisplayName("Take Screenshot of Web Page")]
    //[Description("Captures a screenshot of the entire web page or a specific UI element. Can save to clipboard or file.")]
    public class TakeScreenshotOfWebPageActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Capture Mode")]
        [Description("Specifies whether to capture the entire page or a specific element.")]
        [DefaultValue(CaptureModeEnum.EntireWebPage)]
        public InArgument<CaptureModeEnum> CaptureMode { get; set; }

        [Category("Input")]
        [DisplayName("Find Type")]
        [Description("Specifies how to locate the element (e.g., ID, XPath, CssSelector).")]
        [RenderIfCondition(nameof(CaptureMode), "SpecificElement")]
        public InArgument<string> FindType { get; set; }

        [Category("Input")]
        [DisplayName("Search Keywords")]
        [Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
        [RenderIfCondition(nameof(CaptureMode), "SpecificElement")]
        public InArgument<string> SearchKeywords { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Save Mode")]
        [Description("Specifies where to store the image: Clipboard or File.")]
        [DefaultValue(SaveModeEnum.Clipboard)]
        public InArgument<SaveModeEnum> SaveMode { get; set; }

        [Category("Input")]
        [DisplayName("Image File Path")]
        [Description("The path to save the image file when 'Save Mode' is 'File'.")]
        [RenderIfCondition(nameof(SaveMode), "File")]
        public InArgument<string> ImageFilePath { get; set; }

        [Category("Input")]
        [DisplayName("Image Format")]
        [Description("The format in which the image will be saved (e.g., PNG, JPG).")]
        [DefaultValue(ImageFormatEnum.Png)]
        public InArgument<ImageFormatEnum> ImageFormat { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var captureMode = CaptureMode.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = SearchKeywords.Get(context);
                var saveMode = SaveMode.Get(context);
                var imageFilePath = ImageFilePath.Get(context);
                var imageFormat = ImageFormat.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                Screenshot fullPageScreenshot;
                ImageFormat imgFormat;

                switch (captureMode)
                {
                    case CaptureModeEnum.EntireWebPage:
                    {
                        ((IJavaScriptExecutor)driver).ExecuteScript("document.body.style.overflow = 'hidden';");
                        var fullScreenDriver = driver as ITakesScreenshot;
                        if (fullScreenDriver == null)
                            throw new InvalidOperationException("Driver does not support taking screenshots.");
                        fullPageScreenshot = fullScreenDriver.GetScreenshot();
                        break;
                    }

                    case CaptureModeEnum.SpecificElement:
                    {
                        var element = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);
                        if (element == null)
                            throw new ArgumentException($"No element found using '{findType}': '{searchKeywords}'");
                        var elementScreenshot = (element as ITakesScreenshot)?.GetScreenshot();
                        fullPageScreenshot = elementScreenshot;
                        break;
                    }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(captureMode), "Unsupported capture mode.");
                }

                // imgFormat = _GetImageFormat(imageFormat);

                // Save screenshot based on mode
                switch (saveMode)
                {
                    case SaveModeEnum.Clipboard:
                    {
                        using (var ms = new MemoryStream(fullPageScreenshot?.AsByteArray))
                        using (var bitmap = new Bitmap(ms))
                        {
                            Clipboard.SetImage(bitmap);
                        }

                        status = $"Screenshot saved to clipboard in {imageFormat} format.";
                        break;
                    }

                    case SaveModeEnum.File:
                    {
                        if (string.IsNullOrWhiteSpace(imageFilePath))
                            throw new ArgumentException("Image file path must be specified when saving to file.");

                        var directory = Path.GetDirectoryName(imageFilePath);
                        if (directory != null && !Directory.Exists(directory))
                            Directory.CreateDirectory(directory);

                        // var format = _GetImageFormat(imageFormat);
                        fullPageScreenshot.SaveAsFile(imageFilePath);
                        status = $"Screenshot saved to '{imageFilePath}' in {imageFormat} format.";
                        break;
                    }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(saveMode), "Unsupported save mode.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error taking screenshot: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        // private static ImageFormat _GetImageFormat(ImageFormatEnum format)
        // {
        //     switch (format)
        //     {
        //         case ImageFormatEnum.Bmp:
        //             return ImageFormats.Bmp;
        //         case ImageFormatEnum.Emf:
        //             return ImageFormat.Emf;
        //         case ImageFormatEnum.Exif:
        //             return ImageFormat.Exif;
        //         case ImageFormatEnum.Gif:
        //             return ImageFormat.Gif;
        //         case ImageFormatEnum.Jpg:
        //             return ImageFormat.Jpeg;
        //         case ImageFormatEnum.Png:
        //             return ImageFormat.Png;
        //         case ImageFormatEnum.Tiff:
        //             return ImageFormat.Tiff;
        //         case ImageFormatEnum.Wmf:
        //             return ImageFormat.Wmf;
        //         default:
        //             return ImageFormat.Png;
        //     }
        // }
    }

    public enum CaptureModeEnum
    {
        [Display(Name = "Entire Web Page", Description = "Captures the full visible web page.")]
        EntireWebPage,

        [Display(Name = "Specific Element", Description = "Captures only a selected UI element.")]
        SpecificElement
    }

    public enum SaveModeEnum
    {
        [Display(Name = "Clipboard", Description = "Stores the image in the system clipboard.")]
        Clipboard,

        [Display(Name = "File", Description = "Saves the image to a file.")]
        File
    }

    public enum ImageFormatEnum
    {
        [Display(Name = "BMP", Description = "Windows Bitmap (.bmp)")]
        Bmp,

        [Display(Name = "EMF", Description = "Enhanced Metafile (.emf)")]
        Emf,

        [Display(Name = "EXIF", Description = "Exchangeable Image File (.exif)")]
        Exif,

        [Display(Name = "GIF", Description = "Graphics Interchange Format (.gif)")]
        Gif,

        [Display(Name = "JPG", Description = "Joint Photographic Experts Group (.jpg)")]
        Jpg,

        [Display(Name = "PNG", Description = "Portable Network Graphics (.png)")]
        Png,

        [Display(Name = "TIFF", Description = "Tagged Image File Format (.tiff)")]
        Tiff,

        [Display(Name = "WMF", Description = "Windows Metafile (.wmf)")]
        Wmf
    }
}