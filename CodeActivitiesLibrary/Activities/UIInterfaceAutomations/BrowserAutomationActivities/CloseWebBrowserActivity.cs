using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Close Web Browser")]
    [Description("Closes a web browser instance or all instances if needed.")]
    public class CloseWebBrowserActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("The WebDriver instance to close.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }


        [DisplayName("Close All Instances")]
        [Description("If true, closes all open browser windows and disposes of the driver.")]
        public InArgument<bool> CloseAllInstances { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var closeAll = CloseAllInstances.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web Browser Instance cannot be null.");

                if (closeAll)
                {
                    // Close all windows and dispose of the driver
                    driver.Quit();
                    status = "Successfully closed all browser windows and disposed of the WebDriver.";
                }
                else
                {
                    // Close only current window
                    driver.Close();
                    status = "Successfully closed the current browser window.";
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error closing web browser: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}