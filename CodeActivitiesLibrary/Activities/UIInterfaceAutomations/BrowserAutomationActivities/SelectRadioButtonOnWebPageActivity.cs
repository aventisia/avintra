using System;
using System.Activities;
using System.ComponentModel;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Select Radio Button on Web Page")]
    [Description("Simulates selecting a radio button element on a web page.")]
    public class SelectRadioButtonOnWebPageActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        public InArgument<string> FindType { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Search Keywords")]
        [Description("The value used to locate the radio button (e.g., 'gender-male', '//input[@name='option1']').")]
        public InArgument<string> SearchKeywords { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page Load")]
        [Description("If true, waits for the page to fully load after selection.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Page Load")]
        [Description("Maximum time in seconds to wait for the page to load.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForPageLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Handle Dialog")]
        [Description("Specifies what to do if a dialog appears after selecting the radio button.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("The name of the button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------



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
                var searchKeywords = SearchKeywords.Get(context);
                var waitForPage = WaitForPageLoad.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutForPageLoad.Get(context));
                var dialogAction = IfDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                if (string.IsNullOrWhiteSpace(findType))
                    throw new ArgumentException("Find type must be specified.");

                if (string.IsNullOrWhiteSpace(searchKeywords))
                    throw new ArgumentException("Search keywords must be specified.");

                // Locate the element
                var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                if (by == null)
                    throw new ArgumentException($"Invalid find type provided: '{findType}'");

                var radioButton = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);

                if (radioButton == null)
                    throw new InvalidOperationException(
                        $"No radio button found using '{findType}': '{searchKeywords}'");

                // Click the radio button
                if (!radioButton.Selected)
                {
                    radioButton.Click();
                    status = $"Successfully selected radio button '{searchKeywords}'.";
                }
                else
                {
                    status = $"Radio button '{searchKeywords}' was already selected.";
                }

                // Optional: Wait for page to load
                if (waitForPage)
                {
                    var wait = new WebDriverWait(driver, timeout);
                    wait.Until(d =>
                        ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState").Equals("complete"));
                }

                // Optional: Handle alert popup
                if (dialogAction != DialogActionEnum.DoNothing)
                {
                    try
                    {
                        var alert = driver.SwitchTo().Alert();
                        if (alert != null)
                        {
                            if (dialogAction == DialogActionEnum.CloseIt)
                                alert.Accept();

                            else if (dialogAction == DialogActionEnum.PressAButton)
                                alert.SendKeys(dialogButton);
                        }
                    }
                    catch (NoAlertPresentException)
                    {
                        // No alert found — continue normally
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error selecting radio button: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}