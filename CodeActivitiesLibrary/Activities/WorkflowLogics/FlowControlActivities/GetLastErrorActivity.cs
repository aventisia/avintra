using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Get Last Error"), Description("Retrieves information about the last error in the workflow.")]
    public class GetLastErrorActivity : NativeActivity<string>
    {
        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                // Simulate retrieving last error
                var error = "Simulated last error";
                Result.Set(context, error);
                StatusMessage.Set(context, "Last error retrieved successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error retrieving last error: {ex.Message}");
            }
        }
    }
}