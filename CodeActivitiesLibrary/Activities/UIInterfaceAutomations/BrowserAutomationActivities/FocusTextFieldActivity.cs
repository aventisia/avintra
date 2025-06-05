using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Focus Text Field on Web Page")]
    [Description("Focuses a specific text field in a web browser. Optionally waits for page load and handles dialogs.")]
    public class FocusTextFieldActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The selector used to locate the text field on the page.")]
        public InArgument<string> UiElement { get; set; }

        [RequiredArgument]
        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        public InArgument<string> FindType { get; set; }

        [DisplayName("Wait for Page to Load")]
        [Description("If true, waits for the page to fully load before proceeding.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [DisplayName("Timeout for Page Load")]
        [Description("Maximum time (in seconds) to wait for the page to load before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForPageLoad { get; set; }

        [DisplayName("Handle Dialog")]
        [Description("Specifies what to do if a dialog appears after focusing the field.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfDialogAppears { get; set; }

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
                var uiElement = UiElement.Get(context);
                var findType = FindType.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForPageLoad.Get(context);
                var dialogAction = IfDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("UI Element must be specified.");

                if (string.IsNullOrWhiteSpace(findType))
                    throw new ArgumentException("Find type must be specified.");

                // Wait for the page to load
                if (waitForPage && timeout > 0)
                {
                    var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeout));
                    wait.Until(d =>
                        ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));
                }

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, uiElement);
                if (by == null)
                    throw new ArgumentException("Invalid find type provided.");

                var element = BrowserAutomationHelper.FindElement(driver, findType, uiElement);

                if (element == null)
                    throw new InvalidOperationException($"No element found using '{findType}': '{uiElement}'");

                // Focus on the element
                new Actions(driver).MoveToElement(element).Click().Build().Perform();

                status = $"Focused on UI element '{uiElement}' using '{findType}'.";
            }
            catch (Exception ex)
            {
                status = $"Error focusing text field: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}