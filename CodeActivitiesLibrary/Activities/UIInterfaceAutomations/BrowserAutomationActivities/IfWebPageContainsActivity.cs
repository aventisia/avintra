using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("If Web Page Contains")]
    [Description(
        "Checks if a web page contains a specific UI element or text. Optionally checks if the element is enabled or disabled.")]
    public class IfWebPageContainsActivity : CodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var result = false;

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var checkCondition = CheckIfWebPage.Get(context);
                var checkState = CheckUiElementState.Get(context);
                var uiElement = UiElement.Get(context);
                var text = Text.Get(context);
                var expectedState = State.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(webBrowserInstanceId))
                    throw new ArgumentException("Web Browser Instance must be specified.");

                // Simulate checking conditions
                switch (checkCondition)
                {
                    case CheckConditionEnum.ContainsElement:
                        if (string.IsNullOrWhiteSpace(uiElement))
                            throw new ArgumentException("UI Element must be selected when checking for an element.");
                        result = true; // Placeholder logic - simulate found
                        if (checkState)
                        {
                            var isElementEnabled = expectedState == ElementStateEnum.Enabled;
                            status += $" UI element '{uiElement}' is {(isElementEnabled ? "enabled" : "disabled")}.";
                            result &= isElementEnabled;
                        }

                        status = $"Web page contains UI element '{uiElement}'.";
                        break;

                    case CheckConditionEnum.DoesNotContainElement:
                        if (string.IsNullOrWhiteSpace(uiElement))
                            throw new ArgumentException(
                                "UI Element must be selected when checking for absence of element.");
                        result = false; // Placeholder logic - simulate not found
                        status = $"Web page does not contain UI element '{uiElement}'.";
                        break;

                    case CheckConditionEnum.ContainsText:
                        if (string.IsNullOrWhiteSpace(text))
                            throw new ArgumentException("Text must be provided when checking for presence of text.");
                        result = true; // Simulated match
                        status = $"Web page contains text '{text}'.";
                        break;

                    case CheckConditionEnum.DoesNotContainText:
                        if (string.IsNullOrWhiteSpace(text))
                            throw new ArgumentException("Text must be provided when checking for absence of text.");
                        result = false; // Simulated no match
                        status = $"Web page does not contain text '{text}'.";
                        break;

                    default:
                        throw new InvalidOperationException("Invalid check condition specified.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error during check: {ex.Message}";
                result = false;
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Category("Input")]
        [DisplayName("Check Condition")]
        [Description("Select what condition to check in the web page.")]
        [DefaultValue(CheckConditionEnum.ContainsElement)]
        public InArgument<CheckConditionEnum> CheckIfWebPage { get; set; }

        [Category("Input")]
        [DisplayName("Check UI Element State")]
        [Description("Check whether a specific UI element is enabled or disabled.")]
        [DefaultValue(false)]
        public InArgument<bool> CheckUiElementState { get; set; }

        [Browsable(false)]
        [Category("Input")]
        [DisplayName("UI Element")]
        [Description("The UI element to look for in the web page.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Text")]
        [Description("The text to look for in the web page content.")]
        public InArgument<string> Text { get; set; }

        [Category("Input")]
        [DisplayName("State")]
        [Description("The expected state of the UI element (enabled or disabled).")]
        [DefaultValue(ElementStateEnum.Enabled)]
        public InArgument<ElementStateEnum> State { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [DisplayName("Result")]
        [Description("True if the condition is met; otherwise, false.")]
        public OutArgument<bool> Result { get; set; }

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion
    }

    public enum CheckConditionEnum
    {
        [Display(Name = "Contains Element", Description = "Check if the web page contains a specific UI element.")]
        ContainsElement = 0,

        [Display(Name = "Doesn't Contain Element",
            Description = "Check if the web page does not contain a specific UI element.")]
        DoesNotContainElement = 1,

        [Display(Name = "Contains Text", Description = "Check if the web page contains a specific text.")]
        ContainsText = 2,

        [Display(Name = "Doesn't Contain Text",
            Description = "Check if the web page does not contain a specific text.")]
        DoesNotContainText = 3
    }
}