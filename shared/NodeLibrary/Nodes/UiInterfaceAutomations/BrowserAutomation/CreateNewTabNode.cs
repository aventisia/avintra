using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Create New Tab"), Description("Creates a new tab in the web browser and optionally navigates to a specified URL.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class CreateNewTabNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("URL to Navigate To"), Description("The URL to navigate to after creating the new tab.")]
    public InArgument<string> UrlToNavigateTo { get; set; } = new InArgument<string>("");

    [DisplayName("Wait for Page to Load"), Description("If true, waits for the page to fully load before continuing.")]
    public InArgument<bool> WaitForPageToLoad { get; set; } = new InArgument<bool>(true);

    [DisplayName("Timeout for Page Load"), Description("Maximum time (in seconds) to wait for the page to load.")]
    public InArgument<int> TimeoutForWebpageToLoad { get; set; } = new InArgument<int>(60);

    [DisplayName("Handle Dialog"), Description("Specifies what to do if a dialog appears after navigating.")]
    public InArgument<CreateTabDialogActionEnum> IfAPopUpDialogAppears { get; set; } = new InArgument<CreateTabDialogActionEnum>(CreateTabDialogActionEnum.DoNothing);

    [DisplayName("Dialog Button to Press"), Description("The button to press if a dialog appears (e.g., 'OK', 'Cancel').")]
    public InArgument<string> DialogButtonToPress { get; set; } = new InArgument<string>("OK");

    [DisplayName("New Browser Instance"), Description("Returns the newly created browser tab/window as an IWebDriver instance.")]
    public OutArgument<IWebDriver> NewBrowserInstance { get; set; } = new OutArgument<IWebDriver>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        IWebDriver? newDriver = null;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var url = UrlToNavigateTo.Get(context);
            var waitForPage = WaitForPageToLoad.Get(context);
            var timeout = TimeoutForWebpageToLoad.Get(context);
            var dialogAction = IfAPopUpDialogAppears.Get(context);
            var dialogButton = DialogButtonToPress.Get(context);

            if (driver == null)
                throw new ArgumentException("Web Browser Instance cannot be null.");

            // Create a new tab
            ((IJavaScriptExecutor)driver).ExecuteScript("window.open();");

            // Switch to the new tab
            var windows = driver.WindowHandles;
            driver.SwitchTo().Window(windows[windows.Count - 1]);

            newDriver = driver;

            // Optional: Navigate to URL
            if (!string.IsNullOrWhiteSpace(url))
            {
                newDriver.Navigate().GoToUrl(url);

                if (waitForPage && timeout > 0)
                {
                    var wait = new WebDriverWait(newDriver, TimeSpan.FromSeconds(timeout));
                    wait.Until(d =>
                        ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));

                    if (dialogAction != CreateTabDialogActionEnum.DoNothing)
                        try
                        {
                            var alert = newDriver.SwitchTo().Alert();
                            switch (dialogAction)
                            {
                                case CreateTabDialogActionEnum.CloseIt:
                                    alert.Accept();
                                    break;
                                case CreateTabDialogActionEnum.PressAButton:
                                    alert.SendKeys(dialogButton);
                                    break;
                            }
                        }
                        catch (NoAlertPresentException) { }
                }

                status = $"Created new tab and navigated to '{url}'.";
            }
            else
            {
                status = "Created new tab without navigation.";
            }

            NewBrowserInstance.Set(context, newDriver);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error creating new tab: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum CreateTabDialogActionEnum
{
    [Display(Name = "Do Nothing", Description = "Ignore any pop-up dialog.")]
    DoNothing,

    [Display(Name = "Close It", Description = "Closes any pop-up dialog automatically.")]
    CloseIt,

    [Display(Name = "Press a Button", Description = "Presses a specified button on the dialog.")]
    PressAButton
}
