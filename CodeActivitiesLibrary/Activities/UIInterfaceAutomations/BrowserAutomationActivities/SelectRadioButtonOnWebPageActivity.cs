using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Select Radio Button on Web Page")]
    [Description(
        "Simulates selecting a radio button element on a web page. Optionally waits for the new page to load and handles pop-up dialogs.")]
    public class SelectRadioButtonOnWebPageActivity : CodeActivity
    {
        #region Outputs

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var uiElement = UiElement.Get(context);
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                // Validate required fields conditionally
                if ((dialogAction == DialogActionEnum.CloseOrPress || dialogAction == DialogActionEnum.CloseIt ||
                     dialogAction == DialogActionEnum.PressAButton) && string.IsNullOrEmpty(dialogButton))
                    throw new ArgumentException(
                        "Dialog Button to Press must be specified when 'Close it, Press a button' is selected.");

                // Simulate selecting the radio button
                status = $"Selected radio button '{uiElement}' in browser '{webBrowserInstanceId}'.";

                if (waitForPage)
                {
                    status += $" Waited up to {timeout} seconds for the page to load.";

                    if (dialogAction == DialogActionEnum.CloseOrPress || dialogAction == DialogActionEnum.CloseIt ||
                        dialogAction == DialogActionEnum.PressAButton)
                        status += $" Closed dialog or pressed '{dialogButton}'.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error selecting radio button: {ex.Message}";
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
        [Description("Select the radio button UI element on the web page to select.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description(
            "Specify whether to wait for the new web page to load completely after selecting the radio button.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Webpage to Load")]
        [Description("Set the time in seconds for the page to load before the action throws an error.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForWebpageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("If a Pop-Up Dialog Appears")]
        [Description("Specify what to do if a pop-up dialog appears after selecting the radio button.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("The dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("ok")]
        public InArgument<string> DialogButtonToPress { get; set; }

        #endregion
    }
}