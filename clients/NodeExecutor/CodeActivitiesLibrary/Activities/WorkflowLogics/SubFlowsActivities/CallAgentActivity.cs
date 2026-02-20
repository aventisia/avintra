using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.SubFlowsActivities
{
    [ActivityMetaData(nodeType: "callAgentNode", nodeIcon: "CallAgentIcon", nodeImg: null)]
    [DisplayName("Call Agent")]
    [Description("Use this to call another agent within the current agent")]
    public class CallAgentActivity : BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
        }
    }
}