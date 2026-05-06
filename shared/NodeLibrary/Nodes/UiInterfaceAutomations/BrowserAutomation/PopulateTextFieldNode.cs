using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Populate Text Field on Web Page"), Description("Fills a specified text field in a web browser with provided text. Supports plain or encrypted input.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class PopulateTextFieldNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Value To Find"), Description("The value used to locate the element (e.g., 'username', '//input[@id=email]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Text To Populate"), Description("The text to type into the text field.")]
    public required InArgument<string> TextToPopulate { get; set; }

    [DisplayName("Input Mode"), Description("Specifies whether to use plain text or secure string input.")]
    public InArgument<InputTextModeEnum> InputMode { get; set; } = new InArgument<InputTextModeEnum>(InputTextModeEnum.PlainText);

    [DisplayName("Field Content Action"), Description("Specifies what to do if the text field already has content.")]
    public InArgument<IfFieldNotEmptyActionEnum> FieldContentAction { get; set; } = new InArgument<IfFieldNotEmptyActionEnum>(IfFieldNotEmptyActionEnum.ReplaceText);

    [DisplayName("Wait For Element"), Description("If true, waits for the element to appear before typing.")]
    public InArgument<bool> WaitForElement { get; set; } = new InArgument<bool>(true);

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the element before failing.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Emulate Typing"), Description("If true, types character-by-character instead of pasting all at once.")]
    public InArgument<bool> EmulateTyping { get; set; } = new InArgument<bool>(false);

    [DisplayName("Use Physical Keystrokes"), Description("If true, uses JavaScript to simulate real keyboard interaction.")]
    public InArgument<bool> UsePhysicalKeystrokes { get; set; } = new InArgument<bool>(false);

    [DisplayName("Unfocus After Typing"), Description("If true, unfocuses the text box after filling it (e.g., to trigger auto-complete).")]
    public InArgument<bool> UnfocusAfterTyping { get; set; } = new InArgument<bool>(false);

    [DisplayName("Wait for Page Load"), Description("If true, waits for the page to fully load before proceeding.")]
    public InArgument<bool> WaitForPageLoad { get; set; } = new InArgument<bool>(false);

    [DisplayName("Handle Dialog"), Description("Specifies what to do if a dialog appears after populating the field.")]
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
            var textToPopulate = TextToPopulate.Get(context);
            var fieldContentAction = FieldContentAction.Get(context);
            var waitForElement = WaitForElement.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));
            var emulateTyping = EmulateTyping.Get(context);
            var usePhysicalKeystrokes = UsePhysicalKeystrokes.Get(context);
            var unfocusAfterTyping = UnfocusAfterTyping.Get(context);
            var waitForPageLoad = WaitForPageLoad.Get(context);
            var dialogAction = IfDialogAppears.Get(context);
            var dialogButton = DialogButtonToPress.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(searchKeywords))
                throw new ArgumentException("Search keywords must be specified.");

            if (string.IsNullOrEmpty(textToPopulate))
                throw new ArgumentException("Text to populate must be specified.");

            var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
            if (by == null)
                throw new ArgumentException($"Invalid find type provided: '{findType}'");

            IWebElement? textField;

            if (waitForElement && timeout.TotalSeconds > 0)
            {
                var wait = new WebDriverWait(driver, timeout);
                textField = wait.Until(drv => drv.FindElement(by));
            }
            else
            {
                textField = driver.FindElement(by);
            }

            if (textField == null)
                throw new InvalidOperationException($"No text field found using '{findType}': '{searchKeywords}'");

            // Handle existing text
            if (fieldContentAction == IfFieldNotEmptyActionEnum.ReplaceText && !string.IsNullOrEmpty(textField.Text))
                textField.Clear();

            // Populate the text field
            if (emulateTyping)
            {
                foreach (var c in textToPopulate)
                {
                    textField.SendKeys(c.ToString());
                    Thread.Sleep(new Random().Next(30, 50));
                }
            }
            else
            {
                if (usePhysicalKeystrokes)
                    new Actions(driver).Click(textField).SendKeys(textToPopulate).Build().Perform();
                else
                    textField.SendKeys(textToPopulate);
            }

            if (unfocusAfterTyping)
                new Actions(driver).SendKeys(Keys.Tab).Build().Perform();

            if (waitForPageLoad)
            {
                var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(30));
                wait.Until(d =>
                    (d as IJavaScriptExecutor)?.ExecuteScript("return document.readyState")?.ToString() == "complete");
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

            status = $"Successfully populated text field '{searchKeywords}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error populating text field: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum InputTextModeEnum
{
    [Display(Name = "Plain Text", Description = "Uses regular text input.")]
    PlainText,

    [Display(Name = "Encrypted Text", Description = "Uses secure string or masked input.")]
    EncryptedText
}

public enum IfFieldNotEmptyActionEnum
{
    [Display(Name = "Replace Text", Description = "Clears existing text and replaces it with new input.")]
    ReplaceText,

    [Display(Name = "Append Text", Description = "Adds new text to the end of existing text.")]
    AppendText
}
