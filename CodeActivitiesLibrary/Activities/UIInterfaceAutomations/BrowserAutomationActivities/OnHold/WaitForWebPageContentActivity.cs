using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;


namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    //[DisplayName("Wait For Web Page Content")]
    //[Description("Waits for a specific condition to be met on the current web page, such as containing an element or text.")]
    public class WaitForWebPageContentActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }


        [DisplayName("Wait For Web Page To")]
        [Description("Select what condition to wait for in the current web page.")]
        [DefaultValue(WaitConditionEnum.ContainElement)]
        public InArgument<WaitConditionEnum> WaitForWebPageTo { get; set; }


        [DisplayName("Check UI Element State")]
        [Description("Check whether a specific UI element is enabled or disabled.")]
        [DefaultValue(false)]
        public InArgument<bool> CheckUiElementState { get; set; }


        [DisplayName("UI Element")]
        [Description("The UI element to look for in the web page.")]
        public InArgument<string> UiElement { get; set; }


        [DisplayName("Text")]
        [Description("The text to look for in the web page content.")]
        public InArgument<string> Text { get; set; }


        [DisplayName("State")]
        [Description("The expected state of the UI element (enabled or disabled).")]
        [DefaultValue(ElementStateEnum.Enabled)]
        public InArgument<ElementStateEnum> State { get; set; }


        [DisplayName("Fail With Timeout Error")]
        [Description("Specify whether to fail if the condition isn't met within the specified time.")]
        [DefaultValue(false)]
        public InArgument<bool> FailWithTimeoutError { get; set; }


        [DisplayName("Duration (Seconds)")]
        [Description("How long to wait before failing if the condition isn't met.")]
        [DefaultValue(5)]
        public InArgument<int> Duration { get; set; }

        #endregion
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var waitCondition = WaitForWebPageTo.Get(context);
                var checkState = CheckUiElementState.Get(context);
                var uiElement = UiElement.Get(context);
                var text = Text.Get(context);
                var expectedState = State.Get(context);
                var failOnTimeout = FailWithTimeoutError.Get(context);
                var duration = Duration.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(webBrowserInstanceId))
                    throw new ArgumentException("Web Browser Instance must be specified.");

                // Simulate waiting logic
                switch (waitCondition)
                {
                    case WaitConditionEnum.ContainElement:
                        if (string.IsNullOrWhiteSpace(uiElement))
                            throw new ArgumentException(
                                "UI Element must be selected when waiting to 'contain element'.");

                        status = $"Waiting for '{webBrowserInstanceId}' to contain UI element '{uiElement}'";
                        break;

                    case WaitConditionEnum.NotContainElement:
                        if (string.IsNullOrWhiteSpace(uiElement))
                            throw new ArgumentException(
                                "UI Element must be selected when waiting to 'not contain element'.");

                        status = $"Waiting for '{webBrowserInstanceId}' to NOT contain UI element '{uiElement}'";
                        break;

                    case WaitConditionEnum.ContainText:
                        if (string.IsNullOrWhiteSpace(text))
                            throw new ArgumentException("Text must be provided when waiting to 'contain text'.");

                        status = $"Waiting for '{webBrowserInstanceId}' to contain text '{text}'";
                        break;

                    case WaitConditionEnum.NotContainText:
                        if (string.IsNullOrWhiteSpace(text))
                            throw new ArgumentException("Text must be provided when waiting to 'not contain text'.");

                        status = $"Waiting for '{webBrowserInstanceId}' to NOT contain text '{text}'";
                        break;
                }

                if (checkState) status += $" with state '{expectedState}'.";

                if (failOnTimeout)
                    status += $" Will fail after {duration} seconds if condition not met.";
                else
                    status += ". Waiting indefinitely.";

                // Simulate wait
                var conditionMet = true; // Placeholder logic

                if (!conditionMet && failOnTimeout)
                    throw new TimeoutException($"Condition was not met within {duration} seconds.");

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error during wait: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }


    }
}