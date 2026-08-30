using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Check Element State"), Description("Verifies if an element is visible, enabled, or selected.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class CheckElementStateNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("State To Check"), Description("Specifies which state to verify: Visible, Enabled, Selected.")]
    public InArgument<ElementStatusEnum> StateToCheck { get; set; } = new InArgument<ElementStatusEnum>(ElementStatusEnum.Visible);

    [DisplayName("Wait For Element"), Description("If true, waits for the element to appear before checking its state.")]
    public InArgument<bool> WaitForElement { get; set; } = new InArgument<bool>(false);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the element before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Is State Met"), Description("Returns true if the element meets the specified state condition.")]
    public OutArgument<bool> IsStateMet { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var result = false;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var findType = FindType.Get(context);
            var searchKeywords = ValueToFind.Get(context);
            var stateToCheck = StateToCheck.Get(context);
            var waitForElement = WaitForElement.Get(context);
            var timeoutSeconds = TimeoutSeconds.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(searchKeywords))
                throw new ArgumentException("Search keywords must be specified.");

            if (waitForElement && timeoutSeconds <= 0)
                throw new ArgumentException("Timeout seconds must be greater than zero when waiting for element.");

            // Locate the element
            var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
            IWebElement? element;

            if (waitForElement)
            {
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeoutSeconds));
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
            IsStateMet.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error checking element state: {ex.Message}";
            result = false;
            IsStateMet.Set(context, result);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
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