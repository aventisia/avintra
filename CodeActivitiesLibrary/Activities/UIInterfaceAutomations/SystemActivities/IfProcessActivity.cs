using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("If process")]
    [Description("Marks the beginning of a conditional block of actions depending on whether a process is running or not.")]
    public class IfProcessActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The name of the process to check.")]
        public InArgument<string> ProcessName { get; set; }

        [Category("Output")]
        [Description("Returns true if the process is running, otherwise false.")]
        public OutArgument<bool> IsRunning { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var processName = ProcessName.Get(context);
            var isRunning = false;
            var status = "";

            try
            {
                isRunning = Process.GetProcessesByName(processName).Length > 0;
                StatusMessage.Set(context, "Process status checked successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error checking process status: {ex.Message}";
            }

            IsRunning.Set(context, isRunning);
            StatusMessage.Set(context, status);
        }
    }
}