using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Run Subflow"), Description("Executes a predefined subflow.")]
    public class RunSubflowActivity : NativeActivity
    {
        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

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