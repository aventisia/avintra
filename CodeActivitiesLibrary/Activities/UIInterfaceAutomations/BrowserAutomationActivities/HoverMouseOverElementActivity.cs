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
    [DisplayName("Hover Over Element on Web Page")]
    [Description("Moves the mouse cursor over a specified element on a web page.")]
    public class HoverMouseOverElementActivity : BaseCodeActivity
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

        [DisplayName("Wait for Element")]
        [Description("If true, waits for the element to appear before hovering.")]
        public InArgument<bool> WaitForElement { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = ValueToFind.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeoutInSeconds = TimeoutSeconds.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                if (timeoutInSeconds < 0)
                    throw new ArgumentException("Timeout seconds must be a non-negative number.");

                var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                if (by == null)
                    throw new ArgumentException($"Invalid find type provided: '{findType}'");

                IWebElement element = null;

                if (waitForElement && timeoutInSeconds > 0)
                {
                    var timeout = TimeSpan.FromSeconds(timeoutInSeconds);
                    var wait = new WebDriverWait(driver, timeout);
                    element = wait.Until(drv => drv.FindElement(by));
                }
                else
                {
                    element = driver.FindElement(by);
                }

                if (element == null)
                    throw new InvalidOperationException(
                        $"No element found using '{findType}': '{searchKeywords}'. Current URL: {driver.Url}");

                // Perform hover action
                new Actions(driver).MoveToElement(element).Build().Perform();
                status = $"Successfully hovered over element '{searchKeywords}' using '{findType}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error during hover operation: {ex.Message}. StackTrace: {ex.StackTrace}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

        }
    }
}