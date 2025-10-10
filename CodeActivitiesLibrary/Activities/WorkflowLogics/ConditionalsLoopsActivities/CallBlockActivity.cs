using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities
{
    [ActivityMetaData(nodeType: "blockNode", nodeIcon: "BlockNodeIcon")]
    [DisplayName("Call Block")]
    [Description("Use to add custom block")]
    [ActivityMetaData(nodeImg:"/function.png")]

    public class CallBlockActivity : BaseCodeActivity
    {
        protected override void Execute(CodeActivityContext context)
        {
            // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
        }
    }
}