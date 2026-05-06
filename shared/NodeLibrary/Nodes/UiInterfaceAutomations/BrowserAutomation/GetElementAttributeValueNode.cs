using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Get Element Attribute Value"), Description("Retrieves the value of an element's attribute from a web page.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class GetElementAttributeValueNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("The existing web browser instance (e.g., IWebDriver) to interact with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Attribute Name"), Description("The name of the attribute whose value should be retrieved (e.g., 'value', 'href', 'src').")]
    public required InArgument<string> AttributeName { get; set; }

    [DisplayName("Wait For Element"), Description("If true, waits for the element to appear before retrieving the attribute value.")]
    public InArgument<bool> WaitForElement { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the element before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Attribute Value Output"), Description("Returns the value of the attribute from the found web element.")]
    public OutArgument<string> Result { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        string? result = null;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var findType = FindType.Get(context);
            var searchKeywords = ValueToFind.Get(context);
            var attributeName = AttributeName.Get(context);
            var waitForElement = WaitForElement.Get(context);
            var timeoutSeconds = TimeoutSeconds.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");
            if (string.IsNullOrWhiteSpace(searchKeywords))
                throw new ArgumentException("ValueToFind must be specified.");
            if (string.IsNullOrWhiteSpace(attributeName))
                throw new ArgumentException("AttributeName must be specified.");

            var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
            if (by == null)
                throw new ArgumentException("Invalid selector or unsupported FindType.");

            IWebElement? element;

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
                throw new InvalidOperationException($"Element not found using '{findType}': '{searchKeywords}'");

            result = element.GetAttribute(attributeName);
            status = result == null
                ? $"Element found, but attribute '{attributeName}' is not present."
                : $"Successfully retrieved attribute '{attributeName}': {result}";

            Result.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error retrieving attribute: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
            Result.Set(context, null);
        }
    }
}
