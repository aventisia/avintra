using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Press Button on Web Page")]
    [Description(
        "Simulates clicking a UI button element on a web page. Optionally waits for the new page to load and handles pop-up dialogs.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/BrowserAutomation.svg")]
    public class PressButtonOnWebPageActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        [DefaultValue(ElementSelectorTypeEnum.XPath)]
        public InArgument<ElementSelectorTypeEnum> FindType { get; set; } =
            new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

        [RequiredArgument]
        [DisplayName("Value To Find")]
        [Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
        public InArgument<string> ValueToFind { get; set; }


        [DisplayName("Wait for Page Load")]
        [Description("If true, waits for the next page to load after pressing the button.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageLoad { get; set; }


        [DisplayName("Timeout for Page Load")]
        [Description("Maximum time in seconds to wait for the page to load.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForPageLoad { get; set; }


        [DisplayName("Handle Dialog")]
        [Description("Specifies what to do if a dialog appears after the click.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfDialogAppears { get; set; }


        [DisplayName("Dialog Button to Press")]
        [Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = ValueToFind.Get(context);
                var waitForPage = WaitForPageLoad.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutForPageLoad.Get(context));
                var dialogAction = IfDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                if (by == null)
                    throw new ArgumentException($"Invalid find type provided: '{findType}'");

                var element = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);
                if (element == null)
                    throw new InvalidOperationException($"No button found using '{findType}': '{searchKeywords}'");

                // Click the button
                element.Click();

                // Optional: Wait for page to load
                if (waitForPage && timeout.TotalSeconds > 0)
                {
                    var wait = new WebDriverWait(driver, timeout);
                    wait.Until(d =>
                        ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));
                }

                // Optional: Handle alert popup
                if (dialogAction != DialogActionEnum.DoNothing)
                    try
                    {
                        var alert = driver.SwitchTo().Alert();
                        switch (dialogAction)
                        {
                            case DialogActionEnum.CloseIt:
                                alert.Accept();
                                break;
                            case DialogActionEnum.PressAButton:
                                alert.SendKeys(dialogButton);
                                break;
                            case DialogActionEnum.CloseOrPress: //TODO need to refactor this for custom dialog actions
                            case DialogActionEnum.DoNothing:
                                break;
                            default:
                                throw new ArgumentOutOfRangeException();
                        }
                    }
                    catch (NoAlertPresentException)
                    {
                        // No alert found — continue
                    }

                status = $"Successfully pressed button '{searchKeywords}' using '{findType}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error pressing button: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}