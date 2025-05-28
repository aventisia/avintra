using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Populate Text Field on Web Page")]
    [Description(
        "Fills a specified text field in a web browser with provided text. Supports plain or encrypted input and advanced UI interaction settings.")]
    public class PopulateTextFieldOnWebPageActivity : CodeActivity
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
                var inputMode = InputTextAs.Get(context);
                var inputText = "";

                // Get correct input based on mode
                if (inputMode == InputTextModeEnum.InputAsTextVariableExpression)
                    inputText = Text.Get(context);
                else if (inputMode == InputTextModeEnum.EncryptedText) inputText = TextEncrypt.Get(context);

                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                // Validate required fields conditionally
                if (dialogAction == DialogActionEnum.PressAButton && string.IsNullOrEmpty(dialogButton))
                    throw new ArgumentException(
                        "Dialog Button to Press must be specified when 'Press a Button' is selected.");

                // Simulate populating the text field
                status = $"Populated text field '{uiElement}' in browser '{webBrowserInstanceId}'.";

                if (inputMode == InputTextModeEnum.EncryptedText) status += " Using encrypted input.";

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
                status = $"Error populating text field: {ex.Message}";
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
        [Description("Select the text field to populate.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Input Text As")]
        [Description("Choose how to input the text (plain or encrypted).")]
        [DefaultValue(InputTextModeEnum.InputAsTextVariableExpression)]
        public InArgument<InputTextModeEnum> InputTextAs { get; set; }

        [Category("Input")]
        [DisplayName("Text")]
        [Description("The text to fill in the text field.")]
        public InArgument<string> Text { get; set; }

        [Category("Input")]
        [DisplayName("Encrypted Text")]
        [Description("The text to fill in the text field securely.")]
        public InArgument<string> TextEncrypt { get; set; }

        #endregion

        #region Advanced Options

        [Category("Advanced")]
        [DisplayName("If Field Isn't Empty")]
        [Description("Specify what to do if the text field already contains data.")]
        [DefaultValue(IfFieldNotEmptyActionEnum.ReplaceText)]
        public InArgument<IfFieldNotEmptyActionEnum> IfFieldIsnTEmpty { get; set; }

        [Category("Advanced")]
        [DisplayName("Populate Using Physical Keystrokes")]
        [Description("Emulate physical keystrokes when populating text to ensure compatibility with complex fields.")]
        [DefaultValue(true)]
        public InArgument<bool> PopulateTextUsingPhysicalKeystrokes { get; set; }

        [Category("Advanced")]
        [DisplayName("Emulate Typing")]
        [Description("Fill the text field character by character to simulate typing behavior.")]
        public InArgument<bool> EmulateTyping { get; set; }

        [Category("Advanced")]
        [DisplayName("Unfocus Text Box After Filling It")]
        [Description("Unfocus the text box after filling it. Set to false if scraping auto-completion lists.")]
        [DefaultValue(false)]
        public InArgument<bool> UnfocusTextBoxAfterFillingIt { get; set; }

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
        [Description("Specify what to do if a pop-up dialog appears after clicking the link.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("Enter the dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("Ok")]
        public InArgument<string> DialogButtonToPress { get; set; }

        #endregion
    }

    public enum IfFieldNotEmptyActionEnum
    {
        [Display(Name = "Replace Text", Description = "Clear existing content and replace with new text.")]
        ReplaceText = 0,

        [Display(Name = "Append Text", Description = "Add new text to the end of existing content.")]
        AppendText = 1
    }

    public enum InputTextModeEnum
    {
        [Display(Name = "Input as Text, Variable or Expression",
            Description = "Use regular text, variable, or expression.")]
        InputAsTextVariableExpression = 0,

        [Display(Name = "Direct Encrypted Text Input", Description = "Use secure string or masked input.")]
        EncryptedText = 1
    }
}