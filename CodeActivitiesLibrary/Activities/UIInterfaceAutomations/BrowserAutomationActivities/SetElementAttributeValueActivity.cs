using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Set Element Attribute Value")]
    [Description("Sets the value of a specified attribute of a web element.")]
    public class SetElementAttributeValueActivity : Extensions.BaseCodeActivity
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
        [Description("The value used to locate the element whose attribute will be updated.")]
        public InArgument<string> SearchKeywords { get; set; }

        [RequiredArgument]

        [DisplayName("Attribute Name")]
        [Description("The name of the attribute to set (e.g., 'value', 'class', 'style').")]
        public InArgument<string> AttributeName { get; set; }

        [RequiredArgument]

        [DisplayName("New Attribute Value")]
        [Description("The new value to assign to the attribute.")]
        public InArgument<string> NewAttributeValue { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait For Element")]
        [Description("If true, waits for the element to appear before setting its attribute.")]
        public InArgument<bool> WaitForElement { get; set; }

        [Category("Advanced")]
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
                var attributeName = AttributeName.Get(context);
                var attributeValue = NewAttributeValue.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(findType))
                    throw new ArgumentException("Find type must be specified.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                if (string.IsNullOrWhiteSpace(attributeName))
                    throw new ArgumentException("Attribute name must be specified.");

                if (attributeValue == null)
                    throw new ArgumentException("Attribute value must be provided.");

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

                // Set the attribute via JavaScript
                var jsExecutor = driver as IJavaScriptExecutor;
                if (jsExecutor == null)
                    throw new InvalidOperationException("Driver does not support JavaScript execution.");

                jsExecutor.ExecuteScript(
                    $"arguments[0].setAttribute('{attributeName}', '{attributeValue}');",
                    element);

                status =
                    $"Successfully set attribute '{attributeName}' to '{attributeValue}' on element '{searchKeywords}'.";
            }
            catch (Exception ex)
            {
                status = $"Error setting attribute: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}