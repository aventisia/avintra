using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Element Attribute Value")]
    [Description("Retrieves the value of an element's attribute from a web page.")]
    public class GetElementAttributeValueActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("The existing web browser instance (e.g., IWebDriver) to interact with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        public InArgument<string> FindType { get; set; }

        [RequiredArgument]
        [DisplayName("Search Keywords")]
        [Description("The selector used to locate the element (e.g., 'username', '//input[@id='email']').")]
        public InArgument<string> SearchKeywords { get; set; }

        [RequiredArgument]
        [DisplayName("Attribute Name")]
        [Description("The name of the attribute whose value should be retrieved (e.g., 'value', 'href', 'src').")]
        public InArgument<string> AttributeName { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait For Element")]
        [Description("If true, waits for the element to appear before retrieving the attribute value.")]
        public InArgument<bool> WaitForElement { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Attribute Value Output")]
        [Description("Returns the value of the attribute from the found web element.")]
        public OutArgument<string> Result { get; set; }



        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            string result = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = SearchKeywords.Get(context);
                var attributeName = AttributeName.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeoutSeconds = TimeoutSeconds.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(findType))
                    throw new ArgumentException("Find type must be specified.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                if (string.IsNullOrWhiteSpace(attributeName))
                    throw new ArgumentException("Attribute name must be specified.");

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                IWebElement element = null;

                if (waitForElement && timeoutSeconds > 0)
                {
                    var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutSeconds));
                    element = wait.Until(drv => drv.FindElement(by));
                }
                else
                {
                    element = driver.FindElement(by);
                }

                if (element == null)
                    throw new InvalidOperationException($"No element found using '{findType}': '{searchKeywords}'");

                // Retrieve attribute value
                result = element.GetAttribute(attributeName);
                status = $"Successfully retrieved attribute '{attributeName}' from element '{searchKeywords}'.";
            }
            catch (Exception ex)
            {
                status = $"Error retrieving element attribute value: {ex.Message}";
                result = null;
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}