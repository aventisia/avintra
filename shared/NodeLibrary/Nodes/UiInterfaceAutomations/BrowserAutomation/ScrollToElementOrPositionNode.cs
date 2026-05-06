using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Scroll To Element or Position"), Description("Scrolls the browser window to a specified element or coordinates.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class ScrollToElementOrPositionNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Scroll Mode"), Description("Specifies how to scroll: by element or by coordinates.")]
    public InArgument<ScrollModeEnum> ScrollMode { get; set; } = new InArgument<ScrollModeEnum>(ScrollModeEnum.ByElement);

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    [RenderIfCondition(nameof(ScrollMode), ScrollModeEnum.ByElement)]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    [RenderIfCondition(nameof(ScrollMode), ScrollModeEnum.ByElement)]
    public InArgument<string> ValueToFind { get; set; } = new InArgument<string>("");

    [DisplayName("X Coordinate"), Description("Horizontal scroll position. Only used in 'By Coordinates' mode.")]
    [RenderIfCondition(nameof(ScrollMode), ScrollModeEnum.ByCoordinates)]
    public InArgument<int> XCoordinate { get; set; } = new InArgument<int>(0);

    [DisplayName("Y Coordinate"), Description("Vertical scroll position. Only used in 'By Coordinates' mode.")]
    [RenderIfCondition(nameof(ScrollMode), ScrollModeEnum.ByCoordinates)]
    public InArgument<int> YCoordinate { get; set; } = new InArgument<int>(0);

    [DisplayName("Wait For Element"), Description("If true, waits for the element to be present before scrolling.")]
    public InArgument<bool> WaitForElement { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the element before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Smooth Scroll"), Description("If true, scrolls smoothly instead of jumping to the target.")]
    public InArgument<bool> SmoothScroll { get; set; } = new InArgument<bool>(false);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var scrollMode = ScrollMode.Get(context);
            var findType = FindType.Get(context);
            var searchKeywords = ValueToFind.Get(context);
            var xCoord = XCoordinate.Get(context);
            var yCoord = YCoordinate.Get(context);
            var smoothScroll = SmoothScroll.Get(context);
            var waitForElement = WaitForElement.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            var jsExecutor = (IJavaScriptExecutor)driver;

            switch (scrollMode)
            {
                case ScrollModeEnum.ByElement:
                    if (string.IsNullOrWhiteSpace(searchKeywords))
                        throw new ArgumentException("Search keywords must be specified when using 'ByElement' scroll mode.");

                    var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
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
                        throw new InvalidOperationException($"No element found using '{findType}': '{searchKeywords}'");

                    var behavior = smoothScroll ? "smooth" : "auto";
                    jsExecutor.ExecuteScript(
                        $"arguments[0].scrollIntoView({{ behavior: '{behavior}', block: 'center' }});",
                        element);

                    status = $"Successfully scrolled to element '{searchKeywords}'.";
                    break;

                case ScrollModeEnum.ByCoordinates:
                    if (xCoord < 0 || yCoord < 0)
                        throw new ArgumentException("Coordinates must be positive numbers.");

                    jsExecutor.ExecuteScript($"window.scrollTo({xCoord}, {yCoord});");
                    status = $"Scrolled to position ({xCoord}, {yCoord}).";
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(scrollMode), "Unsupported scroll mode.");
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error during scroll operation: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum ScrollModeEnum
{
    [Display(Name = "By Element", Description = "Scrolls to a specific UI element on the page.")]
    ByElement,

    [Display(Name = "By Coordinates", Description = "Scrolls to a specific (X,Y) position on the page.")]
    ByCoordinates
}
