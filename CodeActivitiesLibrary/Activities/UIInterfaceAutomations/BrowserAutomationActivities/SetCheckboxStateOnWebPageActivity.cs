using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Set Checkbox State on Web Page")]
    [Description("Sets the state (checked/unchecked) of a checkbox element on a web page.")]
    public class SetCheckboxStateOnWebPageActivity : BaseCodeActivity
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

        [RequiredArgument]
        [DisplayName("Check Box State")]
        [Description("Specifies whether to check or uncheck the checkbox.")]
        [DefaultValue(CheckBoxStateEnum.Checked)]
        public InArgument<CheckBoxStateEnum> CheckBoxState { get; set; }


        [DisplayName("Wait for Page Load")]
        [Description("If true, waits for the page to fully load after changing the checkbox state.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageLoad { get; set; }


        [DisplayName("Timeout for Page Load")]
        [Description("Maximum time in seconds to wait for the page to load.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForPageLoad { get; set; }


        [DisplayName("Handle Dialog")]
        [Description("Specifies what to do if a dialog appears after setting the checkbox state.")]
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
                var checkBoxState = CheckBoxState.Get(context);
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

                var checkbox = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);

                if (checkbox == null)
                    throw new InvalidOperationException($"No checkbox found using '{findType}': '{searchKeywords}'");

                if (!checkbox.Displayed || !checkbox.Enabled)
                    throw new InvalidOperationException("Checkbox is not interactable.");

                // Set checkbox state
                var currentSelectedState = checkbox.Selected;

                if ((checkBoxState == CheckBoxStateEnum.Checked && !currentSelectedState) ||
                    (checkBoxState == CheckBoxStateEnum.Unchecked && currentSelectedState))
                {
                    checkbox.Click();
                    status =
                        $"Successfully {(checkBoxState == CheckBoxStateEnum.Checked ? "checked" : "unchecked")} checkbox '{searchKeywords}'.";
                }
                else
                {
                    status = $"Checkbox was already in desired state: {checkBoxState}.";
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
                        // No alert found — continue
                    }
            }
            catch (Exception ex)
            {
                status = $"Error setting checkbox state: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum CheckBoxStateEnum
    {
        [Display(Name = "Checked", Description = "Sets the checkbox to checked state.")]
        Checked,

        [Display(Name = "Unchecked", Description = "Sets the checkbox to unchecked state.")]
        Unchecked
    }
}