using CodeActivitiesLibrary.Extensions;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Go To Web Page")]
    [Description("Navigates a web browser instance to a specified URL, back, forward, or reload.")]
    public class GoToWebPageActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }


        [DisplayName("Navigate Action")]
        [Description("Specifies the type of navigation action to perform.")]
        [DefaultValue(NavigateActionEnum.ToUrl)]
        public InArgument<NavigateActionEnum> NavigateAction { get; set; }


        [DisplayName("URL")]
        [Description("The URL to navigate to when 'Navigate Action' is 'ToUrl'.")]
        [RenderIfCondition(nameof(NavigateAction), "ToUrl")]
        public InArgument<string> Url { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description("If true, waits for the page to fully load before continuing.")]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Page Load")]
        [Description("Maximum time in seconds to wait for the page to load.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForPageLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Handle Dialog")]
        [Description("Specifies what to do if a dialog appears after navigating.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }

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
                var navigateAction = NavigateAction.Get(context);
                var url = Url.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutForPageLoad.Get(context));
                var dialogAction = IfDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                switch (navigateAction)
                {
                    case NavigateActionEnum.ToUrl:
                        if (string.IsNullOrWhiteSpace(url))
                            throw new ArgumentException("URL must be provided when navigating to a specific location.");
                        driver.Navigate().GoToUrl(url);
                        status = $"Navigated to '{url}'.";
                        break;

                    case NavigateActionEnum.Back:
                        driver.Navigate().Back();
                        status = "Navigated back in browser history.";
                        break;

                    case NavigateActionEnum.Forward:
                        driver.Navigate().Forward();
                        status = "Navigated forward in browser history.";
                        break;

                    case NavigateActionEnum.Reload:
                        driver.Navigate().Refresh();
                        status = "Page reloaded successfully.";
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(navigateAction), "Unsupported navigation action.");
                }

                // Optionally wait for page to load
                if (waitForPage && navigateAction == NavigateActionEnum.ToUrl)
                {
                    var wait = new WebDriverWait(driver, timeout);
                    wait.Until(d =>
                        ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));

                    // Optional: handle alert popup
                    if (dialogAction != DialogActionEnum.DoNothing)
                    {
                        try
                        {
                            var alert = driver.SwitchTo().Alert();
                            if (alert != null)
                            {
                                if (dialogAction == DialogActionEnum.CloseIt)
                                    alert.Accept();

                                else if (dialogAction == DialogActionEnum.PressAButton)
                                    alert.SendKeys(dialogButton);
                            }
                        }
                        catch (NoAlertPresentException)
                        {
                            // No alert found — continue
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error during navigation: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum NavigateActionEnum
    {
        [Display(Name = "To URL", Description = "Navigates to the specified URL.")]
        ToUrl,

        [Display(Name = "Back", Description = "Navigates back in the browser history.")]
        Back,

        [Display(Name = "Forward", Description = "Navigates forward in the browser history.")]
        Forward,

        [Display(Name = "Reload Web Page", Description = "Reloads the current web page.")]
        Reload
    }
}