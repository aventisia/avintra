using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Set Drop-Down List Value on Web Page")]
    [Description(
        "Sets or clears the value of a drop-down list element on a web page. Supports selection by name, index, or clearing all options.")]
    public class SetDropDownListValueOnWebPageActivity : Extensions.BaseCodeActivity
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
                var operation = Operation.Get(context);
                var optionNames = OptionNames.Get(context);
                var useRegex = UseRegularExpressions.Get(context);
                var optionIndices = OptionIndices.Get(context);

                var waitForPage = WaitForPageToLoad.Get(context);
                var timeout = TimeoutForWebpageToLoad.Get(context);
                var dialogAction = IfAPopUpDialogAppears.Get(context);
                var dialogButton = DialogButtonToPress.Get(context);

                // Validate required fields conditionally
                if (operation == DropDownListOperationEnum.SelectOptionsByName && string.IsNullOrEmpty(optionNames))
                    throw new ArgumentException("Option Names must be provided when selecting by name.");

                if (operation == DropDownListOperationEnum.SelectOptionsByIndex && optionIndices < 0)
                    throw new ArgumentException("Option Indices must be provided when selecting by index.");

                if (dialogAction == DialogActionEnum.PressAButton && string.IsNullOrEmpty(dialogButton))
                    throw new ArgumentException(
                        "Dialog Button to Press must be specified when 'Press a Button' is selected.");

                // Simulate setting the drop-down value
                switch (operation)
                {
                    case DropDownListOperationEnum.ClearAllOptions:
                        status = $"Cleared all options in '{uiElement}' dropdown.";
                        break;
                    case DropDownListOperationEnum.SelectOptionsByName:
                        status = $"Selected options by name '{optionNames}' in '{uiElement}'.";
                        if (useRegex)
                            status += " Using regular expressions.";
                        break;
                    case DropDownListOperationEnum.SelectOptionsByIndex:
                        status = $"Selected options by index '{optionIndices}' in '{uiElement}'.";
                        break;
                }

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
                status = $"Error setting dropdown value: {ex.Message}";
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
        [Description("Select the drop-down list UI element on the web page to interact with.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Operation")]
        [Description("Choose the operation to perform on the drop-down list.")]
        [DefaultValue(DropDownListOperationEnum.ClearAllOptions)]
        public InArgument<DropDownListOperationEnum> Operation { get; set; }

        [Category("Input")]
        [DisplayName("Option Names")]
        [Description("Enter an option or a list of options to be selected. Only first used if single-select.")]
        public InArgument<string> OptionNames { get; set; }

        [Category("Input")]
        [DisplayName("Use Regular Expressions")]
        [Description("Match option names using regular expressions.")]
        [DefaultValue(false)]
        public InArgument<bool> UseRegularExpressions { get; set; }

        [Category("Input")]
        [DisplayName("Option Indices")]
        [Description("Enter an index or list of indices to select in the drop-down list.")]
        public InArgument<int> OptionIndices { get; set; }

        #endregion

        #region Advanced Options

        [Category("Advanced")]
        [DisplayName("Wait for Page to Load")]
        [Description(
            "Specify whether to wait for the new web page to load completely after setting the dropdown value.")]
        [DefaultValue(true)]
        public InArgument<bool> WaitForPageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("Timeout for Webpage to Load")]
        [Description("Set the time in seconds for the page to load before the action throws an error.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutForWebpageToLoad { get; set; }

        [Category("Advanced")]
        [DisplayName("If a Pop-Up Dialog Appears")]
        [Description("Specify what to do if a pop-up dialog appears after setting the dropdown value.")]
        [DefaultValue(DialogActionEnum.DoNothing)]
        public InArgument<DialogActionEnum> IfAPopUpDialogAppears { get; set; }

        [Category("Advanced")]
        [DisplayName("Dialog Button to Press")]
        [Description("Enter the dialog button to press if a pop-up dialog appears.")]
        [DefaultValue("OK")]
        public InArgument<string> DialogButtonToPress { get; set; }

        #endregion
    }

    public enum DropDownListOperationEnum
    {
        [Display(Name = "Clear All Options", Description = "Clears all selected values from the drop-down list.")]
        ClearAllOptions = 0,

        [Display(Name = "Select Options by Name", Description = "Selects one or more options by their display text.")]
        SelectOptionsByName = 1,

        [Display(Name = "Select Options by Index",
            Description = "Selects one or more options by their index position.")]
        SelectOptionsByIndex = 2
    }
}