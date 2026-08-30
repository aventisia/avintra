using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Switch To Tab"), Description("Switches the browser context to a different tab by index, title, or URL fragment.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class SwitchToTabNode : BaseNode
{
    [DisplayName("Browser Instance"), Description("The active IWebDriver instance representing the browser.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Switch Mode"), Description("The strategy for switching tabs: ByIndex, ByTitle, or ByUrlFragment.")]
    public InArgument<SwitchModeEnum> SwitchMode { get; set; } = new InArgument<SwitchModeEnum>(SwitchModeEnum.ByIndex);

    [DisplayName("Tab Index"), Description("The zero-based index of the tab to switch to (used when Switch Mode is ByIndex).")]
    [RenderIfCondition(nameof(SwitchMode), "ByIndex")]
    public InArgument<int> TabIndex { get; set; } = new InArgument<int>(0);

    [DisplayName("Tab Title"), Description("The title (or partial title) of the tab to switch to (used when Switch Mode is ByTitle).")]
    [RenderIfCondition(nameof(SwitchMode), "ByTitle")]
    public InArgument<string> TabTitle { get; set; } = new InArgument<string>("");

    [DisplayName("URL Fragment"), Description("A fragment of the URL to match when switching tabs (used when Switch Mode is ByUrlFragment).")]
    [RenderIfCondition(nameof(SwitchMode), "ByUrlFragment")]
    public InArgument<string> UrlFragment { get; set; } = new InArgument<string>("");

    [DisplayName("Timeout (Seconds)"), Description("Maximum time (in seconds) to wait for the tab to become available.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Current Tab Title"), Description("The title of the tab after switching.")]
    public OutArgument<string> CurrentTabTitle { get; set; } = new OutArgument<string>();

    [DisplayName("Current Tab URL"), Description("The URL of the tab after switching.")]
    public OutArgument<string> CurrentTabUrl { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var driver = WebBrowserInstance.Get(context);
        var switchMode = SwitchMode.Get(context);
        var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

        if (driver == null)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "Browser instance is null.");
            return;
        }

        try
        {
            var wait = new WebDriverWait(driver, timeout);

            switch (switchMode)
            {
                case SwitchModeEnum.ByIndex:
                    var tabIndex = TabIndex.Get(context);
                    wait.Until(drv => drv.WindowHandles.Count > tabIndex);
                    var handles = driver.WindowHandles;
                    if (tabIndex < 0 || tabIndex >= handles.Count)
                        throw new ArgumentOutOfRangeException($"Tab index {tabIndex} is out of range. Available tabs: {handles.Count}.");
                    driver.SwitchTo().Window(handles[tabIndex]);
                    break;

                case SwitchModeEnum.ByTitle:
                    var title = TabTitle.Get(context);
                    if (string.IsNullOrWhiteSpace(title))
                        throw new ArgumentException("Tab title must be specified when Switch Mode is ByTitle.");
                    wait.Until(drv =>
                    {
                        foreach (var handle in drv.WindowHandles)
                        {
                            drv.SwitchTo().Window(handle);
                            if (drv.Title.Contains(title, StringComparison.OrdinalIgnoreCase))
                                return true;
                        }
                        return false;
                    });
                    break;

                case SwitchModeEnum.ByUrlFragment:
                    var fragment = UrlFragment.Get(context);
                    if (string.IsNullOrWhiteSpace(fragment))
                        throw new ArgumentException("URL fragment must be specified when Switch Mode is ByUrlFragment.");
                    wait.Until(drv =>
                    {
                        foreach (var handle in drv.WindowHandles)
                        {
                            drv.SwitchTo().Window(handle);
                            if (drv.Url.Contains(fragment, StringComparison.OrdinalIgnoreCase))
                                return true;
                        }
                        return false;
                    });
                    break;

                default:
                    throw new NotSupportedException($"Unsupported switch mode: {switchMode}.");
            }

            CurrentTabTitle.Set(context, driver.Title);
            CurrentTabUrl.Set(context, driver.Url);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully switched to tab: '{driver.Title}'.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to switch tab: {ex.Message}");
        }
    }
}

public enum SwitchModeEnum
{
    [Display(Name = "By Index", Description = "Switch to a tab by its zero-based index.")]
    ByIndex,

    [Display(Name = "By Title", Description = "Switch to a tab whose title contains the specified text.")]
    ByTitle,

    [Display(Name = "By URL Fragment", Description = "Switch to a tab whose URL contains the specified fragment.")]
    ByUrlFragment
}
