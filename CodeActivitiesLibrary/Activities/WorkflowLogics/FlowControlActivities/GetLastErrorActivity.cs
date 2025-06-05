using System;
using System.Activities;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    //[DisplayName("Get Last Error"), Description("Retrieves information about the last error in the workflow.")]
    public class GetLastErrorActivity : Extensions.BaseNativeActivity
    {



        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                // Simulate retrieving last error
                var error = "Simulated last error";
                StatusMessage.Set(context, "Last error retrieved successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error retrieving last error: {ex.Message}");
            }
        }
    }
}