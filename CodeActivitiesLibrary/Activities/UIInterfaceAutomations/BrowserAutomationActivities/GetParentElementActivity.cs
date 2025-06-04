using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Parent Element")]
    [Description("Finds and returns the parent element of the specified web element.")]
    public class GetParentElementActivity : BaseCodeActivity
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
        [Description("The value used to locate the element whose parent you want to retrieve.")]
        public InArgument<string> SearchKeywords { get; set; }

        [DisplayName("Wait For Element")]
        [Description("If true, waits for the element to appear before retrieving its parent.")]
        public InArgument<bool> WaitForElement { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Parent Element")]
        [Description("Returns the parent IWebElement of the found element.")]
        public OutArgument<IWebElement> ParentElement { get; set; }



        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            IWebElement parentElement = null;

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

                // Locate the target element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                if (by == null)
                    throw new ArgumentException($"Invalid find type provided: '{findType}'");

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

                // Use JavaScript to get parent element
                var jsExecutor = driver as IJavaScriptExecutor;
                if (jsExecutor == null)
                    throw new InvalidOperationException("Driver does not support JavaScript execution.");

                var parent = jsExecutor.ExecuteScript("return arguments[0].parentNode;", element) as IWebElement;

                if (parent == null)
                    throw new InvalidOperationException("Could not retrieve parent element.");

                parentElement = parent;
                status = $"Successfully retrieved parent element of '{searchKeywords}'.";
            }
            catch (Exception ex)
            {
                status = $"Error retrieving parent element: {ex.Message}";
                parentElement = null;
            }

            ParentElement.Set(context, parentElement);
            StatusMessage.Set(context, status);
        }
    }
}