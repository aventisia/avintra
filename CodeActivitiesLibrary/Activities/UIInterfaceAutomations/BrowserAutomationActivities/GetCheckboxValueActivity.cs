using System;
using System.Activities;
using System.ComponentModel;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Checkbox Value")]
    [Description("Retrieves the current value (checked/unchecked) of a checkbox element on a web page.")]
    public class GetCheckboxValueActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Find Type")]
        [Description("Specifies how to find the checkbox (e.g., ID, XPath, CssSelector).")]
        public InArgument<string> FindType { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Search Keywords")]
        [Description("The value used to locate the checkbox (e.g., 'rememberMe', '//input[@id='remember']').")]
        public InArgument<string> SearchKeywords { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait For Element")]
        [Description("If true, waits for the checkbox to appear before retrieving the value.")]
        public InArgument<bool> WaitForElement { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Is Checked")]
        [Description("Returns true if the checkbox is checked, false otherwise.")]
        public OutArgument<bool> IsChecked { get; set; }



        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var isChecked = false;

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
                if (by == null)
                    throw new ArgumentException($"Invalid find type provided: '{findType}'");

                IWebElement checkbox = null;

                if (waitForElement && timeout.TotalSeconds > 0)
                {
                    var wait = new WebDriverWait(driver, timeout);
                    checkbox = wait.Until(drv => drv.FindElement(by));
                }
                else
                {
                    checkbox = driver.FindElement(by);
                }

                if (checkbox == null)
                    throw new InvalidOperationException($"No checkbox found using '{findType}': '{searchKeywords}'");

                if (!checkbox.Displayed || !checkbox.Enabled)
                    throw new InvalidOperationException("Checkbox is not interactable.");

                // Get checkbox state
                isChecked = checkbox.Selected;
                status = $"Checkbox '{searchKeywords}' is {(isChecked ? "checked" : "not checked")}.";
            }
            catch (Exception ex)
            {
                status = $"Error getting checkbox value: {ex.Message}";
                isChecked = false;
            }

            IsChecked.Set(context, isChecked);
            StatusMessage.Set(context, status);
        }
    }
}