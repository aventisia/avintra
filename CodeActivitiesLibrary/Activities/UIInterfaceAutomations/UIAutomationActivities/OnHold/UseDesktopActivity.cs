using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    // [DisplayName("Use Desktop")]
    // [Description("Performs desktop and taskbar-related operations.")]
    public class UseDesktopActivity : BaseCodeActivity
    {



        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

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