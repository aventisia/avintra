using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Break Loop")]
    [Description("Breaks out of the current loop in the workflow execution.")]
    [ActivityMetaData(nodeType: "breakLoopNode", nodeImg: "/assets/BreakLoop.svg")]
    public class BreakLoopActivity : BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
        }
    }
}