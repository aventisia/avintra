using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities
{
    [NodeType("forLoopNode")]
    [DisplayName("Loop")]
    [Description("This allows you to loop through a set of conditions and execute actions based on the evaluation of those conditions.")]
    public class LoopActivity : Extensions.BaseCodeActivity
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