using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    // Activity to attach to a running Word instance
    [DisplayName("Attach to Running Word"), Description("Attach to a Word document that's already open.")]
    public class AttachToRunningWordActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The process ID of the running Word instance.")]
        public InArgument<int> ProcessId { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var processId = ProcessId.Get(context);
            var status = "";

            try
            {
                // Simulate attaching to a running Word instance (actual implementation would use Microsoft.Office.Interop.Word)
                status = $"Simulated attachment to running Word instance with process ID: {processId}";
            }
            catch (Exception ex)
            {
                status = $"Error attaching to running Word instance: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}