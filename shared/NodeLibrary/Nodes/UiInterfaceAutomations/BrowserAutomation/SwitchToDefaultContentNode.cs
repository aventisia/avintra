using OpenQA.Selenium;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Switch To Default Content"), Description("Switches the Selenium WebDriver context back to the main document or top window (exiting all frames/iframe contexts).")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class SwitchToDefaultContentNode : BaseNode
{
    [DisplayName("Browser Instance"), Description("The active IWebDriver instance representing the browser.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Switched"), Description("Indicates whether the switch to the default content was successful (true) or failed (false).")]
    public OutArgument<bool> Switched { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var driver = WebBrowserInstance.Get(context);
            if (driver == null)
            {
                StatusMessage.Set(context, "Browser instance is null.");
                Switched.Set(context, false);
                IsSuccess.Set(context, false);
                return;
            }

            driver.SwitchTo().DefaultContent();
            StatusMessage.Set(context, "Successfully switched to default content.");
            Switched.Set(context, true);
            IsSuccess.Set(context, true);
        }
        catch (Exception ex)
        {
            Switched.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to switch to default content: {ex.Message}");
        }
    }
}
