using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities
{
    [DisplayName("Conditional"), Description("Evaluates a boolean condition and returns the result.")]
    public class ConditionalActivity : NativeActivity<bool>
    {
        [RequiredArgument, Category("Input"), Description("The condition to evaluate.")]
        public InArgument<bool> Condition { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                var conditionValue = Condition.Get(context);
                Result.Set(context, conditionValue);
                StatusMessage.Set(context, "Condition evaluated successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error evaluating condition: {ex.Message}");
            }
        }
    }
}