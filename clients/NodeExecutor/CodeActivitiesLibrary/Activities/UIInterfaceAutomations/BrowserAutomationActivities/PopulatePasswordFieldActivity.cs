using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Populate Password Field on Web Page")]
    [Description("Fills a password field in a web browser with a secure password value using the method you choose.")]
    [ActivityMetaData(nodeImg: "/assets/BrowserAutomation.svg")]
    public class PopulatePasswordFieldActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        [DefaultValue(ElementSelectorTypeEnum.XPath)]
        public InArgument<ElementSelectorTypeEnum> FindType { get; set; } =
            new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

        [DisplayName("Value To Find")]
        [Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
        public InArgument<string> ValueToFind { get; set; }

        [RequiredArgument]
        [DisplayName("Password To Populate")]
        [Description("The secure password value to type into the password field.")]
        public InArgument<SecureString> PasswordToPopulate { get; set; }

        [DisplayName("Field Content Action")]
        [Description("Specifies what to do if the text field already has content.")]
        [DefaultValue(IfFieldNotEmptyActionEnum.ReplaceText)]
        public InArgument<IfFieldNotEmptyActionEnum> FieldContentAction { get; set; }

        [DisplayName("Wait For Element")]
        [Description("If true, waits for the element to appear before typing.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForElement { get; set; }

        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the element before failing.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }

        [DisplayName("Emulate Typing")]
        [Description("If true, types character-by-character instead of pasting all at once.")]
        public InArgument<bool> EmulateTyping { get; set; }

        [DisplayName("Use Physical Keystrokes")]
        [Description("If true, uses JavaScript to simulate real keyboard interaction.")]
        public InArgument<bool> UsePhysicalKeystrokes { get; set; }

        [DisplayName("Unfocus After Typing")]
        [Description("If true, unfocuses the text box after filling it (e.g., to trigger auto-complete).")]
        public InArgument<bool> UnfocusAfterTyping { get; set; }

        [DisplayName("Wait for Page Load")]
        [Description("If true, waits for the page to fully load before proceeding.")]
        public InArgument<bool> WaitForPageLoad { get; set; }

        [DisplayName("Handle Dialog")]
        [Description("Specifies what to do if a dialog appears after populating the field.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfDialogAppears { get; set; }

        [DisplayName("Dialog Button to Press")]
        [Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var passwordToPopulate = string.Empty;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = ValueToFind.Get(context);
                passwordToPopulate = ConvertSecureStringToString(PasswordToPopulate.Get(context));
                var fieldContentAction = FieldContentAction.Get(context);
                var waitForElement = WaitForElement.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));
                var emulateTyping = EmulateTyping.Get(context);
                var usePhysicalKeystrokes = UsePhysicalKeystrokes.Get(context);
                var unfocusAfterTyping = UnfocusAfterTyping.Get(context);
                var waitForPageLoad = WaitForPageLoad.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                if (string.IsNullOrEmpty(passwordToPopulate))
                    throw new ArgumentException("Password to populate must be specified.");

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                if (by == null)
                    throw new ArgumentException($"Invalid find type provided: '{findType}'");

                IWebElement textField = null;

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
                    throw new InvalidOperationException($"No password field found using '{findType}': '{searchKeywords}'");

                // Handle existing text
                switch (fieldContentAction)
                {
                    case IfFieldNotEmptyActionEnum.ReplaceText when !string.IsNullOrEmpty(textField.Text):
                        textField.Clear();
                        break;

                    case IfFieldNotEmptyActionEnum.AppendText when !string.IsNullOrEmpty(textField.Text):
                        // Do not clear
                        break;

                    default:
                        // Empty or no action needed
                        break;
                }

                // Populate the password field
                if (emulateTyping)
                {
                    foreach (var c in passwordToPopulate)
                    {
                        textField.SendKeys(c.ToString());
                        Thread.Sleep(new Random().Next(30, 50)); // Simulate typing delay
                    }
                }
                else
                {
                    if (usePhysicalKeystrokes)
                        new Actions(driver).Click(textField).SendKeys(passwordToPopulate).Build().Perform();
                    else
                        textField.SendKeys(passwordToPopulate);
                }

                // Optional: Unfocus the text box
                if (unfocusAfterTyping) new Actions(driver).SendKeys(Keys.Tab).Build().Perform();

                // Optional: Wait for page to load
                if (waitForPageLoad)
                {
                    var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(30));
                    wait.Until(d =>
                        (d as IJavaScriptExecutor)?.ExecuteScript("return document.readyState")?.ToString() ==
                        "complete");
                }

                // Optional: Handle alert popup
                if (IfDialogAppears.Get(context) != DialogActionEnum.DoNothing)
                    try
                    {
                        var alert = driver.SwitchTo().Alert();
                        if (IfDialogAppears.Get(context) == DialogActionEnum.CloseIt)
                            alert.Accept();

                        else if (IfDialogAppears.Get(context) == DialogActionEnum.PressAButton)
                            alert.SendKeys(DialogButtonToPress.Get(context));
                    }
                    catch (NoAlertPresentException)
                    {
                        // No alert found — proceed normally
                    }

                status = $"Successfully populated password field '{searchKeywords}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error populating password field: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
            finally
            {
                passwordToPopulate = string.Empty;
            }
        }
    }
}