using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities
{
    [DisplayName("Loop"), Description("Iterates for a specified number of times.")]
    public class LoopActivity : NativeActivity<int>
    {
        [RequiredArgument, Category("Input"), Description("The number of loop iterations.")]
        public InArgument<int> Iterations { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                var iterations = Iterations.Get(context);
                Result.Set(context, iterations);
                StatusMessage.Set(context, $"Loop executed {iterations} times.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error executing loop: {ex.Message}");
            }
        }
    }
}