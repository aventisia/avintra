using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities
{
    [NodeType("conditionalNode")]
    [DisplayName("Conditional")]
    [Description("Use conditions to decide which direction the flow should take")]
    public class ConditionalActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Conditional Mode")]
        [DefaultValue(ConditionModeEnum.SwitchCase)]
        [Description("Trigger execution for the first match or all matching branches, depending on the evaluation mode.")]
        public InArgument<ConditionModeEnum> ConditionalMode { get; set; }

        [Category("Input")]
        [DisplayName("Conditions")]
        [Description("Add one or more conditions")]
        public InArgument<IList<IList<ConditionGroup>>> Conditions { get; set; }

        [Category("Output")]
        [DisplayName("Condition Result")]
        [Description("Returns the result of the condition evaluation.")]
        public OutArgument<bool> ConditionResult { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Only to generate the JSON schema for the activity. It does not execute any logic.
        }
    }

    public class ConditionGroup
    {
        [Required]
        [DisplayName("First Value")]
        public string FirstValue { get; set; }

        [Required]
        [DisplayName("Comparison Operator")]
        public ComparisonOperatorEnum ComparisonOperator { get; set; }

        [Required]
        [DisplayName("Second Value")]
        public string SecondValue { get; set; }
    }

    public enum ConditionModeEnum
    {
        [Display(Name = "Execute only the first branch where the condition matches", Description = "Execute only the first branch where the condition matches.")]
        SwitchCase = 0,

        [Display(Name = "Execute all branches where the condition matches", Description = "Execute all branches where the condition matches.")]
        NestedIfElse = 1,
    }

    public enum ComparisonOperatorEnum
    {
        [Display(Name = "Exists", Description = "Checks if the file exists.")]
        Exists = 0,

        [Display(Name = "Does Not Exist", Description = "Checks if the file does not exist.")]
        DoesNotExist = 1,

        [Display(Name = "Contains (Text)", Description = "Checks if the text contains the given value.")]
        ContainsText = 2,

        [Display(Name = "Does Not Contain (Text)", Description = "Checks if the text does not contain the given value.")]
        DoesNotContainText = 3,

        [Display(Name = "Exactly Matches", Description = "Checks if the text exactly matches the given value.")]
        ExactlyMatches = 4,

        [Display(Name = "Does Not Exactly Match", Description = "Checks if the text does not exactly match the given value.")]
        DoesNotExactlyMatch = 5,

        [Display(Name = "Starts With", Description = "Checks if the text starts with the given value.")]
        StartsWith = 6,

        [Display(Name = "Does Not Start With", Description = "Checks if the text does not start with the given value.")]
        DoesNotStartWith = 7,

        [Display(Name = "Ends With", Description = "Checks if the text ends with the given value.")]
        EndsWith = 8,

        [Display(Name = "Does Not End With", Description = "Checks if the text does not end with the given value.")]
        DoesNotEndWith = 9,

        [Display(Name = "Contains (List)", Description = "Checks if the list contains the given item.")]
        ContainsList = 10,

        [Display(Name = "Does Not Contain (List)", Description = "Checks if the list does not contain the given item.")]
        DoesNotContainList = 11,

        [Display(Name = "Is Empty", Description = "Checks if the list is empty.")]
        IsEmpty = 12,

        [Display(Name = "Is Not Empty", Description = "Checks if the list is not empty.")]
        IsNotEmpty = 13,

        [Display(Name = "Is Greater Than", Description = "Checks if the number is greater than the given value.")]
        GreaterThan = 14,

        [Display(Name = "Is Less Than", Description = "Checks if the number is less than the given value.")]
        LessThan = 15,

        [Display(Name = "Is Equal To", Description = "Checks if the number is equal to the given value.")]
        EqualTo = 16,

        [Display(Name = "After", Description = "Checks if the date/time is after the given value.")]
        After = 17,

        [Display(Name = "Before", Description = "Checks if the date/time is before the given value.")]
        Before = 18,

        [Display(Name = "Equals (DateTime)", Description = "Checks if the date/time equals the given value.")]
        EqualsDateTime = 19,

        [Display(Name = "Is True", Description = "Checks if the value is true.")]
        IsTrue = 20,

        [Display(Name = "Is False", Description = "Checks if the value is false.")]
        IsFalse = 21
    }
}