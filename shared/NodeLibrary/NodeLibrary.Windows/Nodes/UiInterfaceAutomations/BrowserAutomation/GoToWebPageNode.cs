using NodeLibrary.BrowserAutomationNodes.Enums;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Go To Web Page"), Description("Navigates a web browser instance to a specified URL, back, forward, or reload.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class GoToWebPageNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Navigate Action"), Description("Specifies the type of navigation action to perform.")]
    public InArgument<NavigateActionEnum> NavigateAction { get; set; } = new InArgument<NavigateActionEnum>(NavigateActionEnum.ToUrl);

    [DisplayName("URL"), Description("The URL to navigate to when 'Navigate Action' is 'ToUrl'.")]
    [RenderIfCondition(nameof(NavigateAction), NavigateActionEnum.ToUrl)]
    public InArgument<string> Url { get; set; } = new InArgument<string>("");

    [DisplayName("Wait for Page to Load"), Description("If true, waits for the page to fully load before continuing.")]
    public InArgument<bool> WaitForPageToLoad { get; set; } = new InArgument<bool>(true);

    [DisplayName("Timeout for Page Load"), Description("Maximum time in seconds to wait for the page to load.")]
    public InArgument<int> TimeoutForPageLoad { get; set; } = new InArgument<int>(60);

    [DisplayName("Handle Dialog"), Description("Specifies what to do if a dialog appears after navigating.")]
    public InArgument<DialogActionEnum> IfDialogAppears { get; set; } = new InArgument<DialogActionEnum>(DialogActionEnum.DoNothing);

    [DisplayName("Dialog Button to Press"), Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
    public InArgument<string> DialogButtonToPress { get; set; } = new InArgument<string>("Ok");

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var navigateAction = NavigateAction.Get(context);
            var url = Url.Get(context);
            var waitForPage = WaitForPageToLoad.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutForPageLoad.Get(context));
            var dialogAction = IfDialogAppears.Get(context);
            var dialogButton = DialogButtonToPress.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            switch (navigateAction)
            {
                case NavigateActionEnum.ToUrl:
                    if (string.IsNullOrWhiteSpace(url))
                        throw new ArgumentException("URL must be provided when navigating to a specific location.");
                    driver.Navigate().GoToUrl(url);
                    status = $"Navigated to '{url}'.";
                    break;

                case NavigateActionEnum.Back:
                    driver.Navigate().Back();
                    status = "Navigated back in browser history.";
                    break;

                case NavigateActionEnum.Forward:
                    driver.Navigate().Forward();
                    status = "Navigated forward in browser history.";
                    break;

                case NavigateActionEnum.Reload:
                    driver.Navigate().Refresh();
                    status = "Page reloaded successfully.";
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(navigateAction), "Unsupported navigation action.");
            }

            if (waitForPage && navigateAction == NavigateActionEnum.ToUrl)
            {
                var wait = new WebDriverWait(driver, timeout);
                wait.Until(d =>
                    ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));

                if (dialogAction != DialogActionEnum.DoNothing)
                    try
                    {
                        var alert = driver.SwitchTo().Alert();
                        if (dialogAction == DialogActionEnum.CloseIt)
                            alert.Accept();
                        else if (dialogAction == DialogActionEnum.PressAButton)
                            alert.SendKeys(dialogButton);
                    }
                    catch (NoAlertPresentException) { }
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error during navigation: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum NavigateActionEnum
{
    [Display(Name = "To URL", Description = "Navigates to the specified URL.")]
    ToUrl,

    [Display(Name = "Back", Description = "Navigates back in the browser history.")]
    Back,

    [Display(Name = "Forward", Description = "Navigates forward in the browser history.")]
    Forward,

    [Display(Name = "Reload Web Page", Description = "Reloads the current web page.")]
    Reload
}
