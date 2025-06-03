using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Check Element State")]
    [Description("Verifies if an element is visible, enabled, or selected.")]
    public class CheckElementStateActivity : Extensions.BaseCodeActivity
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
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        public InArgument<string> FindType { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Search Keywords")]
        [Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
        public InArgument<string> SearchKeywords { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("State To Check")]
        [Description("Specifies which state to verify: Visible, Enabled, Selected.")]
        [DefaultValue(ElementStatusEnum.Visible)]
        public InArgument<ElementStatusEnum> StateToCheck { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait For Element")]
        [Description("If true, waits for the element to appear before checking its state.")]
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
        [DisplayName("Is State Met")]
        [Description("Returns true if the element meets the specified state condition.")]
        public OutArgument<bool> IsStateMet { get; set; }



        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var result = false;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = SearchKeywords.Get(context);
                var stateToCheck = StateToCheck.Get(context);
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

                // Evaluate the required state
                switch (stateToCheck)
                {
                    case ElementStatusEnum.Visible:
                        result = element.Displayed;
                        status = result
                            ? $"Element '{searchKeywords}' is visible."
                            : $"Element '{searchKeywords}' is not visible.";
                        break;

                    case ElementStatusEnum.Enabled:
                        result = element.Enabled;
                        status = result
                            ? $"Element '{searchKeywords}' is enabled."
                            : $"Element '{searchKeywords}' is disabled.";
                        break;

                    case ElementStatusEnum.Selected:
                        result = element.Selected;
                        status = result
                            ? $"Element '{searchKeywords}' is selected."
                            : $"Element '{searchKeywords}' is not selected.";
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(stateToCheck), "Unsupported state.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error checking element state: {ex.Message}";
                result = false;
            }

            IsStateMet.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }

    public enum ElementStatusEnum
    {
        [Display(Name = "Visible", Description = "Checks if the element is displayed on the page.")]
        Visible,

        [Display(Name = "Enabled", Description = "Checks if the element is enabled (clickable/interactable).")]
        Enabled,

        [Display(Name = "Selected", Description = "Checks if the element is selected (e.g., checkbox/radio button).")]
        Selected
    }
}