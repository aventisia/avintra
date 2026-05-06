using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Hover Over Element on Web Page"), Description("Moves the mouse cursor over a specified element on a web page.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class HoverMouseOverElementNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Wait for Element"), Description("If true, waits for the element to appear before hovering.")]
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
            var waitForElement = WaitForElement.Get(context);
            var timeoutInSeconds = TimeoutSeconds.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(searchKeywords))
                throw new ArgumentException("Search keywords must be specified.");

            var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
            if (by == null)
                throw new ArgumentException($"Invalid find type provided: '{findType}'");

            IWebElement? element;

            if (waitForElement && timeoutInSeconds > 0)
            {
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutInSeconds));
                element = wait.Until(drv => drv.FindElement(by));
            }
            else
            {
                element = driver.FindElement(by);
            }

            if (element == null)
                throw new InvalidOperationException($"No element found using '{findType}': '{searchKeywords}'");

            new Actions(driver).MoveToElement(element).Build().Perform();
            status = $"Successfully hovered over element '{searchKeywords}' using '{findType}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error during hover operation: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
