using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    // Activity to mark the end of a group of actions
    [DisplayName("End Region")]
    [Description("Marks the end of a group of actions.")]
    public class EndRegionActivity : CodeActivity
    {
        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Region ended successfully.";
            StatusMessage.Set(context, status);
        }
    }
}