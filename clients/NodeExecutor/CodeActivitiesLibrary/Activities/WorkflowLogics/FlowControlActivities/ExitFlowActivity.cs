using System;
using System.Activities;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    //[DisplayName("Exit flow"), Description("Exits the current subflow and returns to the caller.")]
    public class ExitFlowActivity : Extensions.BaseNativeActivity
    {



        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                StatusMessage.Set(context, "Successfully exited subflow.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error exiting subflow: {ex.Message}");
            }
        }
    }
}