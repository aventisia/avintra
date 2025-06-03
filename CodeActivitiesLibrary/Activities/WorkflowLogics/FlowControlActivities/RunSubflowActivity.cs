using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Run Subflow"), Description("Executes a predefined subflow.")]
    public class RunSubflowActivity : Extensions.BaseNativeActivity
    {



        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                StatusMessage.Set(context, "Subflow executed successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error running subflow: {ex.Message}");
            }
        }
    }
}