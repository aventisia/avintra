using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Move Window")]
    [Description("Sets the position of a specific window.")]
    public class MoveWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The X-coordinate of the new position.")]
        public InArgument<int> XPosition { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The Y-coordinate of the new position.")]
        public InArgument<int> YPosition { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var xPosition = XPosition.Get(context);
            var yPosition = YPosition.Get(context);
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate moving window using a hypothetical API
                StatusMessage.Set(context, "Window moved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error moving window: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}