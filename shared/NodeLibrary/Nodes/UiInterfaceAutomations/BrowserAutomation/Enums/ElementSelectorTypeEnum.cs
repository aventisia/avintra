namespace NodeLibrary.BrowserAutomationNodes.Enums;

/// <summary>
/// Enumeration of supported browser element selection strategies
/// </summary>
public enum ElementSelectorTypeEnum
{
    [Display(Name = "XPath", Description = "Find by XPath expression")]
    XPath,

    [Display(Name = "Id", Description = "Find by HTML ID attribute")]
    Id,

    [Display(Name = "Css Selector", Description = "Find by CSS selector")]
    CssSelector,

    [Display(Name = "Name", Description = "Find by HTML name attribute")]
    Name,

    [Display(Name = "Class Name", Description = "Find by HTML class name")]
    ClassName,

    [Display(Name = "Tag Name", Description = "Find by HTML tag name")]
    TagName,

    [Display(Name = "Link Text", Description = "Find by link text (exact match)")]
    LinkText,

    [Display(Name = "Partial Link Text", Description = "Find by partial link text")]
    PartialLinkText,

    [Display(Name = "Inner Text", Description = "Find by element's inner text")]
    InnerText,

    [Display(Name = "Title", Description = "Find by element's title attribute")]
    Title,

    [Display(Name = "Value", Description = "Find by element's value attribute")]
    Value,

    [Display(Name = "Placeholder", Description = "Find by element's placeholder attribute")]
    Placeholder,

    [Display(Name = "Type", Description = "Find by element's type attribute")]
    Type,

    [Display(Name = "Data Test Id", Description = "Find by element's data-testid attribute")]
    DataTestId,

    [Display(Name = "Aria Label", Description = "Find by element's aria-label attribute")]
    AriaLabel,

    [Display(Name = "Role", Description = "Find by element's role attribute")]
    Role,

    [Display(Name = "JavaScript", Description = "Find by JavaScript expression")]
    JavaScript,

    [Display(Name = "Sizzle", Description = "Find by Sizzle selector (jQuery-style)")]
    Sizzle,

    [Display(Name = "Relative", Description = "Find by relative position to another element")]
    Relative,

    [Display(Name = "Automation Id", Description = "Find by element's automation ID (for WPF/UWP apps)")]
    AutomationId
}