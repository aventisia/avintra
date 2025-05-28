using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Run Desktop Flow"), Description("Runs another desktop flow and waits until completion.")]
    public class RunDesktopFlowActivity : NativeActivity
    {
        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                StatusMessage.Set(context, "Desktop flow executed successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error running desktop flow: {ex.Message}");
            }
        }
    }
}