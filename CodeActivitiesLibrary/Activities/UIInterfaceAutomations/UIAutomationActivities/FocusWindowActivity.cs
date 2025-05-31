using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Focus Window")]
    [Description("Activates and brings to the foreground a specific window.")]
    public class FocusWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate focusing window using a hypothetical API
                StatusMessage.Set(context, "Window focused successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error focusing window: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}