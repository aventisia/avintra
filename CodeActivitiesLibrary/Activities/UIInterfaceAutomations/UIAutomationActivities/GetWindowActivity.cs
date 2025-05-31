using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Window")]
    [Description("Gets a running window, for automating desktop applications.")]
    public class GetWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The title or handle of the window to retrieve.")]
        public InArgument<string> WindowIdentifier { get; set; }

        [Category("Output")]
        [Description("Returns the handle or identifier of the window.")]
        public OutArgument<string> WindowHandle { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowIdentifier = WindowIdentifier.Get(context);
            string windowHandle = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(windowIdentifier))
                {
                    throw new ArgumentException("Window identifier cannot be null or empty.");
                }

                // Simulate getting window handle using a hypothetical API
                windowHandle = $"Handle-{windowIdentifier}";
                StatusMessage.Set(context, "Window retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving window: {ex.Message}";
            }

            WindowHandle.Set(context, windowHandle);
            StatusMessage.Set(context, status);
        }
    }
}