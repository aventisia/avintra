using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Wait For Process")]
    [Description("Waits for a specific process to start or stop.")]
    public class WaitForProcessActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Process Name")]
        [Description("The name of the process to monitor.")]
        public InArgument<ProcessNameEnum> ProcessName { get; set; }

        [DisplayName("From User")]
        [Description("Indicates whether the process should be triggered by a specific user.")]
        public InArgument<bool> FromUser { get; set; }

        [DisplayName("User Name")]
        [Description("The name of the user associated with the process.")]
        [RenderIfCondition(nameof(FromUser), true)]
        public InArgument<string> UserName { get; set; }

        [DisplayName("Wait For Process To")]
        [Description("Specifies whether to wait for the process to start or stop.")]
        public InArgument<WaitForProcessEnum> WaitForProcessTo { get; set; }

        [DisplayName("Fail With Timeout Error")]
        [Description("Indicates whether the activity should fail if the timeout is reached.")]
        public InArgument<bool> FailWithTimeoutError { get; set; }

        [DisplayName("Duration (Seconds)")]
        [Description("The maximum time in seconds to wait for the process condition.")]
        [RenderIfCondition(nameof(FailWithTimeoutError), true)]
        public InArgument<int> Duration { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Status Message")]
        [Description("Provides information about the execution outcome.")]
        public OutArgument<string> StatusMessage { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            try
            {
                var processName = ProcessName.Get(context);
                var fromUser = FromUser.Get(context);
                var userName = fromUser ? UserName.Get(context) : null;
                var waitForProcessTo = WaitForProcessTo.Get(context);
                var failWithTimeout = FailWithTimeoutError.Get(context);
                var duration = failWithTimeout ? Duration.Get(context) : 0;

                // Simulate waiting logic
                // Replace this with actual process monitoring logic using Process API
                Console.WriteLine($"Waiting for process '{processName}' to {waitForProcessTo}...");

                if (fromUser)
                    Console.WriteLine($"Filtering by user: {userName}");

                if (failWithTimeout)
                    Console.WriteLine($"Timeout set to {duration} seconds.");

                // Placeholder for actual process check logic
                // You can use System.Diagnostics.Process to monitor processes

                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }
    public enum WaitForProcessEnum
    {
        [Display(Name = "Start", Description = "Waits for the process to start.")]
        Start,

        [Display(Name = "Stop", Description = "Waits for the process to stop.")]
        Stop
    }
}
