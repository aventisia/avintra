using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    // [DisplayName("Take Screenshot of UI Element")]
    // [Description("Takes a screenshot of a UI element in a window.")]
    public class TakeUiElementScreenshotActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The selector or identifier of the UI element.")]
        public InArgument<string> ElementSelector { get; set; }

        [Category("Output")]
        [Description("Returns the path to the saved screenshot file.")]
        public OutArgument<string> ScreenshotPath { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var elementSelector = ElementSelector.Get(context);
            string screenshotPath = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(elementSelector))
                {
                    throw new ArgumentException("Element selector cannot be null or empty.");
                }

                // Simulate taking a screenshot using a hypothetical API
                screenshotPath = System.IO.Path.GetTempFileName() + ".png";
                StatusMessage.Set(context, "UI element screenshot taken successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error taking UI element screenshot: {ex.Message}";
            }

            ScreenshotPath.Set(context, screenshotPath);
            StatusMessage.Set(context, status);
        }
    }
}