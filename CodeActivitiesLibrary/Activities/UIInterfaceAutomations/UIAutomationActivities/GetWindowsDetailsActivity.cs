using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Details of Window")]
    [Description("Gets properties of a window such as its title or source text.")]
    public class GetWindowDetailsActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [Category("Output")]
        [Description("Returns the details of the window (e.g., title or source).")]
        public OutArgument<string> WindowDetails { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            string windowDetails = null;
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                // Simulate getting window details using a hypothetical API
                windowDetails = $"Window Title: {windowHandle}";
                StatusMessage.Set(context, "Window details retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving window details: {ex.Message}";
            }

            WindowDetails.Set(context, windowDetails);
            StatusMessage.Set(context, status);
        }
    }
}