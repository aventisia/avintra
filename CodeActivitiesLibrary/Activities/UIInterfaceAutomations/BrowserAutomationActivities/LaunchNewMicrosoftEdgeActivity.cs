using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Launch New Microsoft Edge")]
    [Description("Launches a new Microsoft Edge instance or attaches to an existing browser session.")]
    public class LaunchNewMicrosoftEdgeActivity : Extensions.BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var launchMode = LaunchMode.Get(context);
                var attachMode = AttachToInternetExplorerTab.Get(context);
                var initialUrl = InitialUrl.Get(context);
                var tabTitle = TabTitle.Get(context);
                var tabUrl = TabUrl.Get(context);
                var windowState = WindowState.Get(context);
                var targetDesktop = TargetDesktop.Get(context);
                var clearCache = ClearCache.Get(context);
                var clearCookies = ClearCookies.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeoutPageLoad = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);
                var launchTimeout = TimeOut.Get(context);

                var browserInstanceId = "";

                switch (launchMode)
                {
                    case LaunchModeEnum.LaunchNewInstance:
                        // Simulate launching new Edge instance
                        if (string.IsNullOrWhiteSpace(initialUrl))
                            throw new ArgumentException(
                                "Initial URL must be provided when launching a new browser instance.");

                        browserInstanceId = $"Edge_{Guid.NewGuid():N}";

                        status = $"Launched new Microsoft Edge instance '{browserInstanceId}'.";

                        if (clearCache)
                            status += " Cleared browser cache.";

                        if (clearCookies)
                            status += " Cleared browser cookies.";

                        if (waitForPage)
                        {
                            status += $" Navigated to '{initialUrl}'.";
                            status += $" Waited up to {timeoutPageLoad} seconds for the page to load.";

                            if (dialogAction == DialogActionEnum.CloseIt)
                                status += " Closed pop-up dialog automatically.";
                            else if (dialogAction == DialogActionEnum.PressAButton)
                                status += $" Pressed '{dialogButton}' on dialog.";
                        }

                        break;

                    case LaunchModeEnum.AttachToRunningInstance:

                        // Simulate attaching to existing browser
                        if (attachMode == AttachModeEnum.ByTitle && string.IsNullOrWhiteSpace(tabTitle))
                            throw new ArgumentException("Tab Title must be provided when attaching by title.");

                        if (attachMode == AttachModeEnum.ByUrl && string.IsNullOrWhiteSpace(tabUrl))
                            throw new ArgumentException("Tab URL must be provided when attaching by URL.");

                        browserInstanceId = "Existing_IE_Instance_12345";

                        status = $"Attached to browser instance '{browserInstanceId}'.";

                        break;

                    default:
                        throw new InvalidOperationException("Invalid launch mode selected.");
                }

                // Set outputs
                BrowserInstance.Set(context, browserInstanceId);
            }
            catch (Exception ex)
            {
                status = $"Error during launch: {ex.Message}";
                BrowserInstance.Set(context, false);
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [Category("Basic")]
        [DisplayName("Launch Mode")]
        [Description("Specify whether to launch a new browser instance or attach to an existing one.")]
        [DefaultValue(LaunchModeEnum.LaunchNewInstance)]
        public InArgument<LaunchModeEnum> LaunchMode { get; set; }

        [Category("Basic")]
        [DisplayName("Attach To Internet Explorer Tab")]
        [Description("Specify how to attach to an existing Internet Explorer tab.")]
        public InArgument<AttachModeEnum> AttachToInternetExplorerTab { get; set; }

        [Category("Basic")]
        [DisplayName("Initial URL")]
        [Description("Enter the URL of the website to visit when launching a new browser instance.")]
        public InArgument<string> InitialUrl { get; set; }

        [Category("Basic")]
        [DisplayName("Tab Title")]
        [Description("Enter the title (or part of it) of the IE tab to attach to.")]
        public InArgument<string> TabTitle { get; set; }

        [Category("Basic")]
        [DisplayName("Tab URL")]
        [Description("Enter the URL (or part of it) of the IE tab to attach to.")]
        public InArgument<string> TabUrl { get; set; }

        [Category("Basic")]
        [DisplayName("Window State")]
        [Description("Specify whether to launch the browser window in normal, minimized, or maximized state.")]
        [DefaultValue(WindowStateEnum.Normal)]
        public InArgument<WindowStateEnum> WindowState { get; set; }

        [Category("Basic")]
        [DisplayName("Target Desktop")]
        [Description("Set the connection string of the target desktop where the browser should launch.")]
        [DefaultValue(TargetDesktopEnum.LocalComputer)]
        public InArgument<TargetDesktopEnum> TargetDesktop { get; set; }

        [Category("Advanced")]
        [DisplayName("Clear Cache")]
        [Description("Specify whether to clear the entire cache of the web browser right after launching it.")]
        [DefaultValue(false)]
        public InArgument<bool> ClearCache { get; set; }

        [Category("Advanced")]
        [DisplayName("Clear Cookies")]
        [Description("Specify whether to clear all stored cookies in the web browser right after launching it.")]
        [DefaultValue(false)]
        public InArgument<bool> ClearCookies { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description("Specify whether to wait for the initial page to load completely before proceeding.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Webpage to Load")]
        [Description("Set the time in seconds for the page to load before the action fails.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForWebpageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("If a Pop-Up Dialog Appears")]
        [Description("Specify what to do if a pop-up dialog appears while loading the initial web page.")]
        [DefaultValue(DialogActionEnum.CloseIt)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("Enter the dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("OK")]
        public InArgument<string> DialogButtonToPress { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout")]
        [Description("Set the time in seconds to wait for the browser to open before the action fails.")]
        [DefaultValue(60)]
        public InArgument<int> TimeOut { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [DisplayName("Browser Output")]
        [Description("The new browser instance ID to use for automation actions.")]
        public OutArgument<string> BrowserInstance { get; set; }



        
        

        #endregion
    }
}