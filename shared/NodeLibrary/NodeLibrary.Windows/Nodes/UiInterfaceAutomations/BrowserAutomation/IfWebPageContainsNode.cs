using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("If Web Page Contains"), Description("Checks if a web page contains a specific UI element or text. Optionally checks if the element is enabled or disabled.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class IfWebPageContainsNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Check Condition"), Description("Specifies what condition to check (e.g., contains element, contains text).")]
    public InArgument<CheckConditionEnum> CheckCondition { get; set; } = new InArgument<CheckConditionEnum>(CheckConditionEnum.ContainsElement);

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.ContainsElement)]
    [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.DoesNotContainElement)]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.ContainsElement)]
    [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.DoesNotContainElement)]
    public InArgument<string> ValueToFind { get; set; } = new InArgument<string>("");

    [DisplayName("Check UI Element State"), Description("If true, checks whether the found element is enabled or disabled.")]
    public InArgument<bool> CheckUiElementState { get; set; } = new InArgument<bool>(false);

    [DisplayName("State"), Description("Specifies the expected state of the element (enabled or disabled).")]
    [RenderIfCondition(nameof(CheckUiElementState), true)]
    public InArgument<ElementStateTypeEnum> State { get; set; } = new InArgument<ElementStateTypeEnum>(ElementStateTypeEnum.Enabled);

    [DisplayName("Text To Search"), Description("The text to search for in the web page body or title.")]
    [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.ContainsText)]
    public InArgument<string> TextToSearch { get; set; } = new InArgument<string>("");

    [DisplayName("Search Location"), Description("Specifies where to search for the text (e.g., Body, Title).")]
    public InArgument<SearchLocationEnum> SearchLocation { get; set; } = new InArgument<SearchLocationEnum>(SearchLocationEnum.Body);

    [DisplayName("Result"), Description("Returns true if the condition is met, otherwise false.")]
    public OutArgument<bool> Result { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var result = false;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var checkCondition = CheckCondition.Get(context);
            var checkState = CheckUiElementState.Get(context);
            var expectedState = State.Get(context);
            var findType = FindType.Get(context);
            var searchKeywords = ValueToFind.Get(context);
            var textToSearch = TextToSearch.Get(context);
            var searchLocation = SearchLocation.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            switch (checkCondition)
            {
                case CheckConditionEnum.ContainsElement:
                case CheckConditionEnum.DoesNotContainElement:
                    if (string.IsNullOrWhiteSpace(searchKeywords))
                        throw new ArgumentException("Find type and search keywords must be specified when checking for an element.");

                    var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                    if (by == null)
                        throw new ArgumentException("Invalid find type provided.");

                    var element = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);
                    var elementExists = element != null;

                    switch (checkCondition)
                    {
                        case CheckConditionEnum.ContainsElement when elementExists:
                            result = true;
                            status = $"Found element '{searchKeywords}' using '{findType}'.";
                            break;
                        case CheckConditionEnum.DoesNotContainElement when !elementExists:
                            result = true;
                            status = $"Did not find element '{searchKeywords}' using '{findType}'.";
                            break;
                        default:
                            result = false;
                            status = checkCondition == CheckConditionEnum.ContainsElement
                                ? $"No element found using '{findType}': '{searchKeywords}'."
                                : $"Element was found but should not exist.";
                            break;
                    }

                    if (checkState && element != null)
                    {
                        var isEnabled = element.Enabled;
                        result &= (expectedState == ElementStateTypeEnum.Enabled && isEnabled) ||
                                  (expectedState == ElementStateTypeEnum.Disabled && !isEnabled);
                        status += $" Element {(isEnabled ? "is enabled." : "is disabled.")}";
                    }
                    break;

                case CheckConditionEnum.ContainsText:
                case CheckConditionEnum.DoesNotContainText:
                    if (string.IsNullOrWhiteSpace(textToSearch))
                        throw new ArgumentException("Text to search must be specified when checking for text.");

                    var textSource = searchLocation switch
                    {
                        SearchLocationEnum.Body => driver.FindElement(By.TagName("body"))?.Text ?? "",
                        SearchLocationEnum.Title => driver.Title,
                        _ => throw new ArgumentOutOfRangeException(nameof(searchLocation))
                    };

                    var containsText = textSource.Contains(textToSearch, StringComparison.OrdinalIgnoreCase);

                    switch (checkCondition)
                    {
                        case CheckConditionEnum.ContainsText when containsText:
                            result = true;
                            status = $"Web page contains the text '{textToSearch}'.";
                            break;
                        case CheckConditionEnum.DoesNotContainText when !containsText:
                            result = true;
                            status = $"Web page does not contain the text '{textToSearch}'.";
                            break;
                        default:
                            result = false;
                            status = checkCondition == CheckConditionEnum.ContainsText
                                ? $"Web page does not contain the text '{textToSearch}'."
                                : $"Web page contains the text '{textToSearch}', which was unexpected.";
                            break;
                    }
                    break;

                default:
                    throw new InvalidOperationException("Invalid check condition specified.");
            }

            Result.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error during condition check: {ex.Message}";
            Result.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

[Flags]
public enum CheckConditionEnum
{
    [Display(Name = "Contains Element", Description = "Checks if the web page contains a specific UI element.")]
    ContainsElement,

    [Display(Name = "Doesn't Contain Element", Description = "Checks if the web page does not contain a specific UI element.")]
    DoesNotContainElement,

    [Display(Name = "Contains Text", Description = "Checks if the web page contains a specific text.")]
    ContainsText,

    [Display(Name = "Doesn't Contain Text", Description = "Checks if the web page does not contain a specific text.")]
    DoesNotContainText
}

public enum ElementStateTypeEnum
{
    [Display(Name = "Enabled", Description = "UI element must be enabled.")]
    Enabled,

    [Display(Name = "Disabled", Description = "UI element must be disabled.")]
    Disabled
}

public enum SearchLocationEnum
{
    [Display(Name = "Body", Description = "Searches in the page body text.")]
    Body,

    [Display(Name = "Title", Description = "Searches in the page title.")]
    Title
}
