using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Set Checkbox State on Web Page"), Description("Sets the state (checked/unchecked) of a checkbox element on a web page.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class SetCheckboxStateOnWebPageNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Check Box State"), Description("Specifies whether to check or uncheck the checkbox.")]
    public InArgument<CheckBoxStateEnum> CheckBoxState { get; set; } = new InArgument<CheckBoxStateEnum>(CheckBoxStateEnum.Checked);

    [DisplayName("Wait for Page Load"), Description("If true, waits for the page to fully load after changing the checkbox state.")]
    public InArgument<bool> WaitForPageLoad { get; set; } = new InArgument<bool>(true);

    [DisplayName("Timeout for Page Load"), Description("Maximum time in seconds to wait for the page to load.")]
    public InArgument<int> TimeoutForPageLoad { get; set; } = new InArgument<int>(60);

    [DisplayName("Handle Dialog"), Description("Specifies what to do if a dialog appears after setting the checkbox state.")]
    public InArgument<DialogActionEnum> IfDialogAppears { get; set; } = new InArgument<DialogActionEnum>(DialogActionEnum.DoNothing);

    [DisplayName("Dialog Button to Press"), Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
    public InArgument<string> DialogButtonToPress { get; set; } = new InArgument<string>("Ok");

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var findType = FindType.Get(context);
            var searchKeywords = ValueToFind.Get(context);
            var checkBoxState = CheckBoxState.Get(context);
            var waitForPage = WaitForPageLoad.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutForPageLoad.Get(context));
            var dialogAction = IfDialogAppears.Get(context);
            var dialogButton = DialogButtonToPress.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(searchKeywords))
                throw new ArgumentException("Search keywords must be specified.");

            var checkbox = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);
            if (checkbox == null)
                throw new InvalidOperationException($"No checkbox found using '{findType}': '{searchKeywords}'");

            if (!checkbox.Displayed || !checkbox.Enabled)
                throw new InvalidOperationException("Checkbox is not interactable.");

            var currentSelectedState = checkbox.Selected;

            if ((checkBoxState == CheckBoxStateEnum.Checked && !currentSelectedState) ||
                (checkBoxState == CheckBoxStateEnum.Unchecked && currentSelectedState))
            {
                checkbox.Click();
                status = $"Successfully {(checkBoxState == CheckBoxStateEnum.Checked ? "checked" : "unchecked")} checkbox '{searchKeywords}'.";
            }
            else
            {
                status = $"Checkbox was already in desired state: {checkBoxState}.";
            }

            if (waitForPage)
            {
                var wait = new WebDriverWait(driver, timeout);
                wait.Until(d =>
                    ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));
            }

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

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error setting checkbox state: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum CheckBoxStateEnum
{
    [Display(Name = "Checked", Description = "Sets the checkbox to checked state.")]
    Checked,

    [Display(Name = "Unchecked", Description = "Sets the checkbox to unchecked state.")]
    Unchecked
}
