using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("End"), Description("Marks the end of a block or flow.")]
    public class EndActivity : NativeActivity
    {
        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                StatusMessage.Set(context, "Block ended successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error ending block: {ex.Message}");
            }
        }
    }
}