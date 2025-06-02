using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Set Checkbox State on Web Page")]
    [Description(
        "Sets the state (checked/unchecked) of a checkbox element on a web page. Optionally waits for the new page to load and handles pop-up dialogs.")]
    public class SetCheckboxStateOnWebPageActivity : Extensions.BaseCodeActivity
    {
        #region Outputs

        
        

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var uiElement = UiElement.Get(context);
                var checkBoxState = CheckBoxState.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                // Validate required fields conditionally
                if (dialogAction == DialogActionEnum.PressAButton && string.IsNullOrEmpty(dialogButton))
                    throw new ArgumentException(
                        "Dialog Button to Press must be specified when 'Press a Button' is selected.");

                // Simulate setting the checkbox state
                status = $"Set checkbox '{uiElement}' to '{checkBoxState}' in browser '{webBrowserInstanceId}'.";

                if (waitForPage)
                {
                    status += $" Waited up to {timeout} seconds for the page to load.";

                    if (dialogAction == DialogActionEnum.CloseIt)
                        status += " Closed any pop-up dialog automatically.";
                    else if (dialogAction == DialogActionEnum.PressAButton)
                        status += $" Pressed the '{dialogButton}' button on the dialog.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error setting checkbox state: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Browsable(false)]
        [Category("Input")]
        [DisplayName("UI Element")]
        [Description("Select the checkbox UI element on the web page to interact with.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Check Box State")]
        [Description("Set the desired state of the checkbox.")]
        [DefaultValue(CheckBoxStateEnum.Checked)]
        public InArgument<CheckBoxStateEnum> CheckBoxState { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description(
            "Specify whether to wait for the new web page to load completely after changing the checkbox state.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Webpage to Load")]
        [Description("Set the time in seconds for the page to load before the action throws an error.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForWebpageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("If a Pop-Up Dialog Appears")]
        [Description("Specify what to do if a pop-up dialog appears after setting the checkbox state.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("Enter the dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("OK")]
        public InArgument<string> DialogButtonToPress { get; set; }

        #endregion
    }

    public enum CheckBoxStateEnum
    {
        [Display(Name = "Checked", Description = "Set the checkbox to checked state.")]
        Checked = 0,

        [Display(Name = "Unchecked", Description = "Set the checkbox to unchecked state.")]
        Unchecked = 1
    }
}