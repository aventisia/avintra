using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Close Web Browser")]
    [Description("Closes a web browser instance that was previously opened.")]
    public class CloseWebBrowserActivity : CodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to close.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);

                if (string.IsNullOrWhiteSpace(webBrowserInstanceId))
                    throw new ArgumentException("Web Browser Instance must be specified.");

                // Simulate closing the browser
                status = $"Web browser instance '{webBrowserInstanceId}' has been closed.";
            }
            catch (Exception ex)
            {
                status = $"Error closing web browser: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}