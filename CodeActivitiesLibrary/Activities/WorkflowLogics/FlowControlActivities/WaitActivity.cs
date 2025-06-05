using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    //[DisplayName("Wait"), Description("Suspends execution for a specified duration in seconds.")]
    public class WaitActivity : Extensions.BaseNativeActivity
    {
        [RequiredArgument, Category("Input"), Description("Number of seconds to wait.")]
        public InArgument<int> Seconds { get; set; }




        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                var seconds = Seconds.Get(context);
                Thread.Sleep(seconds * 1000); // Convert to milliseconds
                StatusMessage.Set(context, $"Waited for {seconds} seconds.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error waiting: {ex.Message}");
            }
        }
    }
}