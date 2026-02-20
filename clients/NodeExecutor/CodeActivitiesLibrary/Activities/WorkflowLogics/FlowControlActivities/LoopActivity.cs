using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [ActivityMetaData(nodeType: "forLoopNode", nodeIcon: "LoopNodeIcon", nodeImg: null)]
    [DisplayName("Loop")]
    [Description("Use this to keep doing something again and again, as long as certain conditions are met.")]
    public class LoopActivity : BaseCodeActivity
    {
        [Required]
        [DisplayName("Loop Type")]
        [Description("Select the mode of the loop.")]
        [DefaultValue(LoopTypeEnum.ForEach)]
        public LoopTypeEnum LoopMode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Only to generate the JSON schema for the activity. It does not execute any logic.
        }
    }

    // Placeholder enum. Not using this one currently
    public enum LoopTypeEnum
    {
        [Display(Name = "For Each", Description = "Iterates over each item in a collection.")]
        ForEach,

        [Display(Name = "While", Description = "Executes actions while a condition is true.")]
        While,

        [Display(Name = "Do While", Description = "Executes actions at least once and continues while a condition is true.")]
        DoWhile,
    }
}