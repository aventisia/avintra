using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Wait")]
    [Description("Pauses the workflow execution for a specified number of seconds.")]
    public class WaitActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Duration (Seconds)")]
        [Description("The number of seconds to pause workflow execution.")]
        public InArgument<int> Seconds { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var seconds = Seconds.Get(context);
                Thread.Sleep(seconds * 1000); // Convert to milliseconds
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Waited for {seconds} seconds.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error waiting: {ex.Message}");
            }
        }
    }
}