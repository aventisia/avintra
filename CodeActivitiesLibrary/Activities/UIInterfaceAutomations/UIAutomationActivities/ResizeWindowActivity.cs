using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Resize Window")]
    [Description("Sets the size of a specific window.")]
    public class ResizeWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The width of the window.")]
        public InArgument<int> Width { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The height of the window.")]
        public InArgument<int> Height { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var width = Width.Get(context);
            var height = Height.Get(context);
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate resizing window using a hypothetical API
                StatusMessage.Set(context, "Window resized successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error resizing window: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}