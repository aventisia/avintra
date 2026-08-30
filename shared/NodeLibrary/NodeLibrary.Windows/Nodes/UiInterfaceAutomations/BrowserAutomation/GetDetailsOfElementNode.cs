using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Get Details of Element on Web Page"), Description("Retrieves the value of a specified attribute from a selected UI element in a web browser.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class GetDetailsOfElementNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Attribute Name"), Description("The name of the attribute whose value should be retrieved. Use 'Text' to get inner text.")]
    public InArgument<string> AttributeName { get; set; } = new InArgument<string>("Text");

    [DisplayName("Wait for Element"), Description("If true, waits for the element to appear before retrieving the attribute value.")]
    public InArgument<bool> WaitForElement { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the element before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Attribute Value Output"), Description("Returns the value of the attribute from the found web element.")]
    public OutArgument<string> AttributeValueOutput { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        string? attributeValue = null;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var uiElement = ValueToFind.Get(context) ?? string.Empty;
            var findType = FindType.Get(context);
            var attributeName = AttributeName.Get(context) ?? string.Empty;
            var waitForElement = WaitForElement.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(uiElement))
                throw new ArgumentException("UI Element must be specified.");

            var by = BrowserAutomationHelper.GetWebElementLocator(findType, uiElement);
            if (by == null)
                throw new ArgumentException($"Invalid find type provided: '{findType}'");

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
                throw new InvalidOperationException($"No element found using '{findType}': '{uiElement}'");

            // Retrieve attribute value
            attributeValue = attributeName.ToLower() switch
            {
                "text" => element.Text,
                "value" => element.GetAttribute("value"),
                "innerhtml" => element.GetAttribute("innerHTML"),
                "outerhtml" => element.GetAttribute("outerHTML"),
                "selected" => element.Selected.ToString(),
                _ => element.GetAttribute(attributeName)
            };

            AttributeValueOutput.Set(context, attributeValue);
            status = $"Successfully retrieved attribute '{attributeName}' from element '{uiElement}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error retrieving element details: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
