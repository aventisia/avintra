using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Focus on Web Page")]
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
        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        [DefaultValue(ElementSelectorTypeEnum.XPath)]
        public InArgument<ElementSelectorTypeEnum> FindType { get; set; } =
            new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

        [RequiredArgument]
        [DisplayName("Value To Find")]
        [Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
        public InArgument<string> ValueToFind { get; set; }


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
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = string.Empty;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var uiElement = ValueToFind.Get(context);
                var findType = FindType.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForPageLoad.Get(context);
                var dialogAction = IfDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                if (driver == null)
                    throw new ArgumentNullException(nameof(driver), "Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("Value To Find cannot be null or empty.");

                // Wait for page load if required
                if (waitForPage)
                {
                    var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeout));
                    wait.Until(d =>
                        ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));
                }

                // Get By locator
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, uiElement);
                if (by == null)
                    throw new ArgumentException($"Invalid selector type or empty value: {findType}, {uiElement}");

                // Locate the element
                var element = BrowserAutomationHelper.FindElement(driver, findType, uiElement);
                if (element == null)
                    throw new InvalidOperationException($"Element not found using {findType}: {uiElement}");

                // Scroll into view and focus
                ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].scrollIntoView(true);", element);
                new Actions(driver).MoveToElement(element).Click().Perform();

                // Optional: Handle Dialog (future implementation)
                if (dialogAction == DialogActionEnum.AcceptAlert)
                {
                    try
                    {
                        IAlert alert = driver.SwitchTo().Alert();
                        alert.Accept();
                        status += "Alert accepted.";
                    }
                    catch (NoAlertPresentException)
                    {
                        /* no alert, skip */
                    }
                }
                else if (dialogAction == DialogActionEnum.DismissAlert)
                {
                    try
                    {
                        IAlert alert = driver.SwitchTo().Alert();
                        alert.Dismiss();
                        status += "Alert dismissed.";
                    }
                    catch (NoAlertPresentException)
                    {
                        /* no alert, skip */
                    }
                }

                status = $"Focused on element using {findType}: {uiElement}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error focusing text field: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}