using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [ActivityMetaData(nodeType: "conditionalNode", nodeIcon: "ConditionalNodeIcon", nodeImg: null)]
    [DisplayName("Router")]
    [Description("Use conditions to decide which direction the flow should take")]
    public class ConditionalActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Conditional Mode")]
        [DefaultValue(ConditionModeEnum.SwitchCase)]
        [Description("Trigger execution for the first match or all matching branches, depending on the evaluation mode.")]
        public InArgument<ConditionModeEnum> ConditionalMode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Only to generate the JSON schema for the Action/Node/Activity Selector. It does not execute any logic.
        }
    }

    public enum ConditionModeEnum
    {
        [Display(Name = "Execute only the first branch where the condition matches", Description = "Execute only the first branch where the condition matches.")]
        SwitchCase = 0,

        [Display(Name = "Execute all branches where the condition matches", Description = "Execute all branches where the condition matches.")]
        NestedIfElse = 1,
    }
}