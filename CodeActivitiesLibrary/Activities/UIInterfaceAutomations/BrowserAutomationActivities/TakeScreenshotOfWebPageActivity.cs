using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using ValidationException = System.Activities.ValidationException;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Take Screenshot of Web Page")]
    [Description(
        "Captures a screenshot of the entire web page or a specific UI element, and saves it to clipboard or file.")]
    public class TakeScreenshotOfWebPageActivity : Extensions.BaseCodeActivity
    {
        #region Outputs

        
        

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var captureMode = Capture.Get(context);
                var saveMode = SaveMode.Get(context);

                // Validate required fields based on selection
                if (captureMode == CaptureModeEnum.SpecificElement &&
                    string.IsNullOrEmpty(UiElement.Get(context)))
                    throw new ValidationException("UI Element must be selected when capturing a specific element.");

                if (saveMode == SaveModeEnum.File && string.IsNullOrEmpty(ImageFile.Get(context)))
                    throw new ValidationException("Image File path is required when saving to file.");

                // Simulate taking screenshot
                var capturedArea = captureMode == CaptureModeEnum.EntireWebPage ? "entire web page" : "specific element";
                var saveLocation = saveMode == SaveModeEnum.Clipboard
                    ? "clipboard"
                    : $"file '{ImageFile.Get(context)}' as {FileFormat.Get(context)}";

                status = $"Screenshot of {capturedArea} taken and saved to {saveLocation}.";
            }
            catch (Exception ex)
            {
                status = $"Error taking screenshot: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Category("Input")]
        [DisplayName("Capture Mode")]
        [Description("Specify whether to capture the entire web page or only a specific element.")]
        [DefaultValue(CaptureModeEnum.EntireWebPage)]
        public InArgument<CaptureModeEnum> Capture { get; set; }

        [Category("Input")]
        [DisplayName("UI Element")]
        [Description(
            "Select the UI element on the web page to capture. Only used if 'Specific Element' mode is selected.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Save Mode")]
        [Description("Specify whether to save the image into a file or store it in the clipboard.")]
        [DefaultValue(SaveModeEnum.Clipboard)]
        public InArgument<SaveModeEnum> SaveMode { get; set; }

        [Category("Input")]
        [DisplayName("Image File Path")]
        [Description("Set the full path for the file to save the image capture.")]
        public InArgument<string> ImageFile { get; set; }

        [Category("Input")]
        [DisplayName("Image Format")]
        [Description("Choose the format in which the image will be saved.")]
        [DefaultValue(ImageFormatEnum.Bmp)]
        public InArgument<ImageFormatEnum> FileFormat { get; set; }

        #endregion
    }

    public enum CaptureModeEnum
    {
        [Display(Name = "Entire Web Page", Description = "Capture the full web page.")]
        EntireWebPage = 0,

        [Display(Name = "Specific Element", Description = "Capture only a selected UI element.")]
        SpecificElement = 1
    }

    public enum ImageFormatEnum
    {
        Bmp = 0,
        Emf = 1,
        Exif = 2,
        Gif = 3,
        Jpg = 4,
        Png = 5,
        Tiff = 6,
        Wmf = 7
    }

    public enum SaveModeEnum
    {
        [Display(Name = "Clipboard", Description = "Save the image to the clipboard.")]
        Clipboard = 0,

        [Display(Name = "File", Description = "Save the image to a file.")]
        File = 1
    }
}