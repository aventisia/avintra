using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Get Details of Element on Web Page")]
    [Description("Retrieves the value of a specified attribute from a selected UI element in a web browser.")]
    public class GetDetailsOfElementActivity : BaseCodeActivity
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

        [RequiredArgument]
        [DisplayName("Attribute Name")]
        [Description("The name of the attribute whose value should be retrieved. Use 'Text' to get inner text.")]
        [DefaultValue("Text")]
        public InArgument<string> AttributeName { get; set; }


        [DisplayName("Wait for Element")]
        [Description("If true, waits for the element to appear before retrieving the attribute value.")]
        public InArgument<bool> WaitForElement { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Attribute Value Output")]
        [Description("Returns the value of the attribute from the found web element.")]
        public OutArgument<string> AttributeValueOutput { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            string attributeValue = null;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var uiElement = ValueToFind.Get(context);
                var findType = FindType.Get(context);
                var attributeName = AttributeName.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("UI Element must be specified.");

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, uiElement);
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
                    throw new InvalidOperationException($"No element found using '{findType}': '{uiElement}'");

                // Retrieve attribute value
                switch (attributeName.ToLower())
                {
                    case "text":
                        attributeValue = element.Text;
                        break;

                    case "value":
                        attributeValue = element.GetAttribute("value");
                        break;

                    case "innerhtml":
                        attributeValue = element.GetAttribute("innerHTML");
                        break;

                    case "outerhtml":
                        attributeValue = element.GetAttribute("outerHTML");
                        break;

                    case "selected":
                        attributeValue = element.Selected.ToString();
                        break;

                    default:
                        attributeValue = element.GetAttribute(attributeName);
                        break;
                }
                AttributeValueOutput.Set(context, attributeValue);
                status = $"Successfully retrieved attribute '{attributeName}' from element '{uiElement}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error retrieving element details: {ex.Message}";
                attributeValue = null;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}