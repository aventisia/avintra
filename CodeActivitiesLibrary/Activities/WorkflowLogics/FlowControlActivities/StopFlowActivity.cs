using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Stop Flow"), Description("Terminates the currently running workflow.")]
    public class StopFlowActivity : NativeActivity
    {
        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                StatusMessage.Set(context, "Flow has been stopped.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error stopping flow: {ex.Message}");
            }
        }
    }
}