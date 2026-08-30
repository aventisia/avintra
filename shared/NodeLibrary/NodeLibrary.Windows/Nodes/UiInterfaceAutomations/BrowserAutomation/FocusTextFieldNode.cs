using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Focus on Web Page"), Description("Focuses a specific text field in a web browser. Optionally waits for page load and handles dialogs.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class FocusTextFieldNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Wait for Page to Load"), Description("If true, waits for the page to fully load before proceeding.")]
    public InArgument<bool> WaitForPageToLoad { get; set; } = new InArgument<bool>(true);

    [DisplayName("Timeout for Page Load"), Description("Maximum time (in seconds) to wait for the page to load before failing.")]
    public InArgument<int> TimeoutForPageLoad { get; set; } = new InArgument<int>(60);

    [DisplayName("Handle Dialog"), Description("Specifies what to do if a dialog appears after focusing the field.")]
    public InArgument<DialogActionEnum> IfDialogAppears { get; set; } = new InArgument<DialogActionEnum>(DialogActionEnum.DoNothing);

    [DisplayName("Dialog Button to Press"), Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
    public InArgument<string> DialogButtonToPress { get; set; } = new InArgument<string>("Ok");

    protected override void Execute(INodeContext context)
    {
        var status = string.Empty;

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var uiElement = ValueToFind.Get(context);
            var findType = FindType.Get(context);
            var waitForPage = WaitForPageToLoad.Get(context);
            var timeout = TimeoutForPageLoad.Get(context);
            var dialogAction = IfDialogAppears.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(uiElement))
                throw new ArgumentException("Value To Find cannot be null or empty.");

            // Wait for page load if required
            if (waitForPage)
            {
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(timeout));
                wait.Until(d =>
                    ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));
            }

            // Locate the element
            var element = BrowserAutomationHelper.FindElement(driver, findType, uiElement);
            if (element == null)
                throw new InvalidOperationException($"Element not found using {findType}: {uiElement}");

            // Scroll into view and focus
            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].scrollIntoView(true);", element);
            new Actions(driver).MoveToElement(element).Click().Perform();

            // Handle Dialog
            if (dialogAction == DialogActionEnum.AcceptAlert)
            {
                try
                {
                    driver.SwitchTo().Alert().Accept();
                }
                catch (NoAlertPresentException) { }
            }
            else if (dialogAction == DialogActionEnum.DismissAlert)
            {
                try
                {
                    driver.SwitchTo().Alert().Dismiss();
                }
                catch (NoAlertPresentException) { }
            }

            status = $"Focused on element using {findType}: {uiElement}";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error focusing text field: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}
