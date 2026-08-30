using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Set Element Attribute Value"), Description("Sets the value of a specified attribute of a web element.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class SetElementAttributeValueNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Attribute Name"), Description("The name of the attribute to set (e.g., 'value', 'class', 'style').")]
    public required InArgument<string> AttributeName { get; set; }

    [DisplayName("New Attribute Value"), Description("The new value to assign to the attribute.")]
    public required InArgument<string> NewAttributeValue { get; set; }

    [DisplayName("Wait For Element"), Description("If true, waits for the element to appear before setting its attribute.")]
    public InArgument<bool> WaitForElement { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the element before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var findType = FindType.Get(context);
            var searchKeywords = ValueToFind.Get(context);
            var attributeName = AttributeName.Get(context);
            var attributeValue = NewAttributeValue.Get(context);
            var waitForElement = WaitForElement.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(searchKeywords))
                throw new ArgumentException("Search keywords must be specified.");

            if (string.IsNullOrWhiteSpace(attributeName))
                throw new ArgumentException("Attribute name must be specified.");

            if (attributeValue == null)
                throw new ArgumentException("Attribute value must be provided.");

            var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
            IWebElement? element;

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

            var jsExecutor = driver as IJavaScriptExecutor
                ?? throw new InvalidOperationException("Driver does not support JavaScript execution.");

            jsExecutor.ExecuteScript(
                "arguments[0].setAttribute(arguments[1], arguments[2]);",
                element, attributeName, attributeValue);

            status = $"Successfully set attribute '{attributeName}' to '{attributeValue}' on element '{searchKeywords}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error setting attribute: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
