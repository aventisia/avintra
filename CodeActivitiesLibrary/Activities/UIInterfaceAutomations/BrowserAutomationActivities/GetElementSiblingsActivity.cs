using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Element Siblings")]
    [Description("Finds and returns all sibling elements of the specified web element.")]
    public class GetElementSiblingsActivity : BaseCodeActivity
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


        [DisplayName("Wait For Element")]
        [Description("If true, waits for the element to appear before retrieving its siblings.")]
        public InArgument<bool> WaitForElement { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Sibling Elements")]
        [Description("Returns a collection of sibling elements of the found element.")]
        public OutArgument<ReadOnlyCollection<IWebElement>> SiblingElements { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            ReadOnlyCollection<IWebElement> siblings = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = ValueToFind.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                // Locate the base element
                IWebElement baseElement = null;

                if (waitForElement && timeout.TotalSeconds > 0)
                {
                    var wait = new WebDriverWait(driver, timeout);
                    baseElement = wait.Until(drv =>
                        BrowserAutomationHelper.FindElement(drv, findType, searchKeywords));
                }
                else
                {
                    baseElement = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);
                }

                if (baseElement == null)
                    throw new InvalidOperationException($"No element found using '{findType}': '{searchKeywords}'");

                // Use JavaScript to retrieve sibling elements
                var jsExecutor = driver as IJavaScriptExecutor;
                if (jsExecutor == null)
                    throw new InvalidOperationException("Driver does not support JavaScript execution.");

                // Get parent node
                var parent = jsExecutor.ExecuteScript("return arguments[0].parentNode;", baseElement) as IWebElement;
                if (parent == null)
                    throw new InvalidOperationException("Could not find parent element.");

                // Get all children of the parent (these are potential siblings)
                var childNodes = jsExecutor.ExecuteScript(
                    "return Array.from(arguments[0].children);",
                    parent) as ReadOnlyCollection<IWebElement>;

                if (childNodes == null || childNodes.Count == 0)
                    throw new InvalidOperationException("No sibling elements found.");

                // Filter out the base element itself
                siblings = new ReadOnlyCollection<IWebElement>(
                    childNodes.Where(e => e != baseElement).ToList());

                status = $"Found {siblings.Count} sibling(s) of '{searchKeywords}'.";
            }
            catch (Exception ex)
            {
                status = $"Error retrieving sibling elements: {ex.Message}";
                siblings = null;
            }

            SiblingElements.Set(context, siblings);
            StatusMessage.Set(context, status);
        }
    }
}