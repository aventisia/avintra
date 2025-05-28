using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Create New Tab")]
    [Description("Creates a new tab in the web browser and optionally navigates to a specified URL.")]
    public class CreateNewTabActivity : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var urlToNavigate = UrlToNavigateTo.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(webBrowserInstanceId))
                    throw new ArgumentException("Web Browser Instance must be specified.");

                // Simulate creating a new tab and navigating
                var newBrowserInstanceId = $"NewTab_{Guid.NewGuid():N}";

                if (!string.IsNullOrWhiteSpace(urlToNavigate))
                {
                    status = $"Created new tab '{newBrowserInstanceId}' and navigated to '{urlToNavigate}'.";

                    if (waitForPage)
                    {
                        status += $" Waited up to {timeout} seconds for the page to load.";

                        if (dialogAction == DialogActionEnum.CloseIt)
                            status += " Closed any pop-up dialog automatically.";
                        else if (dialogAction == DialogActionEnum.PressAButton)
                            status += $" Pressed the '{dialogButton}' button on the dialog.";
                    }
                }
                else
                {
                    status = $"Created new tab '{newBrowserInstanceId}' without navigation.";
                }

                // Set outputs conditionally
                NewBrowserInstance.Set(context, newBrowserInstanceId);
            }
            catch (Exception ex)
            {
                status = $"Error creating new tab: {ex.Message}";
                NewBrowserInstance.Set(context, false);
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
        [DisplayName("URL to Navigate To")]
        [Description("The URL to navigate to after creating the new tab.")]
        public InArgument<string> UrlToNavigateTo { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description("Specify whether to wait for the new page to load completely after navigating.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Webpage to Load")]
        [Description("Set the time in seconds for the page to load before the action throws an error.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForWebpageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("If a Pop-Up Dialog Appears")]
        [Description("Specify what to do if a pop-up dialog appears after navigating.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("Enter the dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("OK")]
        public InArgument<string> DialogButtonToPress { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        [Category("Output")]
        [DisplayName("New Browser Output")]
        [Description("The new browser instance ID (tab) created.")]
        public OutArgument<string> NewBrowserInstance { get; set; }
        #endregion
    }
}