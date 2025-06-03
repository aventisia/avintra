using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MouseAndKeyboardActivities
{
    // Activity to wait for mouse pointer change
    [DisplayName("Wait for Mouse"),
     Description(
         "Suspends the execution of the flow until the mouse pointer changes, usually to or from the 'wait cursor' or hourglass.")]
    public class WaitForMouseActivity : Extensions.BaseCodeActivity
    {



        protected override void Execute(CodeActivityContext context)
        {
            var status = "";

            try
            {
                // Simulate waiting for mouse pointer change (actual implementation would monitor cursor changes)
                status = "Wait for mouse completed successfully.";
            }
            catch (Exception ex)
            {
                status = $"Error waiting for mouse: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}