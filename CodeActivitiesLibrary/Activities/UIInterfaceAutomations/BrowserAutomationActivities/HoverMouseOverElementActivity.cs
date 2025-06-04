using CodeActivitiesLibrary.Extensions;
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
        public InArgument<string> FindType { get; set; }

        [RequiredArgument]
        [DisplayName("Search Keywords")]
        [Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
        public InArgument<string> SearchKeywords { get; set; }

        [DisplayName("Wait for Element")]
        [Description("If true, waits for the element to appear before hovering.")]
        public InArgument<bool> WaitForElement { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

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
                var findType = FindType.Get(context);
                var searchKeywords = SearchKeywords.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(findType))
                    throw new ArgumentException("Find type must be specified.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                IWebElement element = null;

                if (waitForElement && timeout.TotalSeconds > 0)
                {
                    var wait = new WebDriverWait(driver, timeout);
                    element = wait.Until(drv => drv.FindElement(by));
                }
                else
                {
                    element = driver.FindElement(by);
                }

                if (element == null)
                    throw new InvalidOperationException($"No element found using '{findType}': '{searchKeywords}'");

                // Perform hover action
                new Actions(driver).MoveToElement(element).Build().Perform();

                status = $"Successfully hovered over element '{searchKeywords}' using '{findType}'.";
            }
            catch (Exception ex)
            {
                status = $"Error during hover: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}