using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Click UI Element in Window")]
    [Description("Clicks on any UI element of a window.")]
    public class ClickUiElementInWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The selector or identifier of the UI element.")]
        public InArgument<string> UiElementSelector { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var uiElementSelector = UiElementSelector.Get(context);
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(uiElementSelector))
                {
                    throw new ArgumentException("UI element selector cannot be null or empty.");
                }

                // Simulate clicking UI element using a hypothetical API
                StatusMessage.Set(context, "UI element clicked successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error clicking UI element: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}
