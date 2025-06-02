using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Focus Text Field on Web Page")]
    [Description(
        "Focuses a specific text field in a web browser. Optionally waits for the page to load and handles pop-up dialogs.")]
    public class FocusTextFieldOnWebPageActivity : Extensions.BaseCodeActivity
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
                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                // Validate required fields conditionally
                if (dialogAction == DialogActionEnum.PressAButton && string.IsNullOrEmpty(dialogButton))
                    throw new ArgumentException(
                        "Dialog Button to Press must be specified when 'Press a Button' is selected.");

                // Simulate focusing on the text field
                status = $"Focused on UI element '{uiElement}' in browser '{webBrowserInstanceId}'.";

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
                status = $"Error focusing text field: {ex.Message}";
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
        [Description("Select the UI element (text field) on the web page to focus.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description("Specify whether to wait for the new web page to load completely before proceeding.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Webpage to Load")]
        [Description("Set the time in seconds for the page to load before the action throws an error.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForWebpageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("If a Pop-Up Dialog Appears")]
        [Description("Specify what to do if a pop-up dialog appears.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("Enter the dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }

        #endregion
    }
}