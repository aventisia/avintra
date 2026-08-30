using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System.Collections.ObjectModel;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Get Element Siblings"), Description("Finds and returns all sibling elements of the specified web element.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class GetElementSiblingsNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Wait For Element"), Description("If true, waits for the element to appear before retrieving its siblings.")]
    public InArgument<bool> WaitForElement { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the element before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Sibling Elements"), Description("Returns a collection of sibling elements of the found element.")]
    public OutArgument<ReadOnlyCollection<IWebElement>> SiblingElements { get; set; } = new OutArgument<ReadOnlyCollection<IWebElement>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        ReadOnlyCollection<IWebElement>? siblings = null;

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

            IWebElement? baseElement;

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

            var jsExecutor = driver as IJavaScriptExecutor
                ?? throw new InvalidOperationException("Driver does not support JavaScript execution.");

            var parent = jsExecutor.ExecuteScript("return arguments[0].parentNode;", baseElement) as IWebElement
                ?? throw new InvalidOperationException("Could not find parent element.");

            var childNodes = jsExecutor.ExecuteScript(
                "return Array.from(arguments[0].children);",
                parent) as ReadOnlyCollection<IWebElement>;

            if (childNodes == null || childNodes.Count == 0)
                throw new InvalidOperationException("No sibling elements found.");

            siblings = new ReadOnlyCollection<IWebElement>(
                childNodes.Where(e => e != baseElement).ToList());

            SiblingElements.Set(context, siblings);
            status = $"Found {siblings.Count} sibling(s) of '{searchKeywords}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error retrieving sibling elements: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
