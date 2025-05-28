using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Use Desktop")]
    [Description("Performs desktop and taskbar-related operations.")]
    public class UseDesktopActivity : CodeActivity
    {
        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string status = "";

            try
            {
                // Simulate desktop operations using a hypothetical API
                StatusMessage.Set(context, "Desktop operations performed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error performing desktop operations: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}