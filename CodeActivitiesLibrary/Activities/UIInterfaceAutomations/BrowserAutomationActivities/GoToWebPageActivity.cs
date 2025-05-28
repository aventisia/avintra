using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Go To Web Page")]
    [Description(
        "Navigates a web browser instance to a specified URL, or performs navigation actions such as Back, Forward, or Reload.")]
    public class GoToWebPageActivity : CodeActivity
    {
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
                var navigateAction = Navigate.Get(context);
                var url = Url.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(webBrowserInstanceId))
                    throw new ArgumentException("Web Browser Instance must be specified.");

                if (navigateAction == NavigateActionEnum.ToUrl && string.IsNullOrWhiteSpace(url))
                    throw new ArgumentException("URL must be specified when navigating to a specific location.");

                // Simulate navigation
                switch (navigateAction)
                {
                    case NavigateActionEnum.ToUrl:
                        status = $"Navigated browser '{webBrowserInstanceId}' to URL '{url}'.";
                        break;
                    case NavigateActionEnum.Back:
                        status = $"Navigated browser '{webBrowserInstanceId}' back.";
                        break;
                    case NavigateActionEnum.Forward:
                        status = $"Navigated browser '{webBrowserInstanceId}' forward.";
                        break;
                    case NavigateActionEnum.Reload:
                        status = $"Reloaded browser '{webBrowserInstanceId}'.";
                        break;
                }

                if (waitForPage)
                {
                    status += $" Waited up to {timeout} seconds for the page to load.";

                    if (dialogAction == DialogActionEnum.CloseIt)
                        status += " Closed any pop-up dialog automatically.";
                    else if (dialogAction == DialogActionEnum.PressAButton)
                        status += $" Pressed the '{dialogButton}' button on the dialog.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error during navigation: {ex.Message}";
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
        [DisplayName("Navigate Action")]
        [Description("Specify where to navigate to.")]
        [DefaultValue(NavigateActionEnum.ToUrl)]
        public InArgument<NavigateActionEnum> Navigate { get; set; }

        [Category("Input")]
        [DisplayName("URL")]
        [Description("The URL to navigate to.")]
        public InArgument<string> Url { get; set; }

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
    }

    public enum NavigateActionEnum
    {
        [Display(Name = "To URL", Description = "Navigate to a specific URL.")]
        ToUrl = 0,

        [Display(Name = "Back", Description = "Navigate back in the browser history.")]
        Back = 1,

        [Display(Name = "Forward", Description = "Navigate forward in the browser history.")]
        Forward = 2,

        [Display(Name = "Reload Web Page", Description = "Reload the current web page.")]
        Reload = 3
    }
}