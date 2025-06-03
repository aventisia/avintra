using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Terminate process")]
    [Description("Immediately stops a running process.")]
    public class TerminateProcessActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [Description("The name of the process to terminate.")]
        public InArgument<string> ProcessName { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var processName = ProcessName.Get(context);
            var status = "";

            try
            {
                foreach (var process in Process.GetProcessesByName(processName)) process.Kill();
                StatusMessage.Set(context, "Process terminated successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error terminating process: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}