using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{

    // Activity to close a CMD session
    [DisplayName("Close CMD Session"), Description("Closes a previously opened CMD session.")]
    public class CloseCmdSessionActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The process ID of the open CMD session.")]
        public InArgument<int> ProcessId { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var processId = ProcessId.Get(context);
            var status = "";

            try
            {
                // Get the CMD process using the provided process ID
                var cmdProcess = Process.GetProcessById(processId);

                // Close the CMD session
                if (cmdProcess != null && !cmdProcess.HasExited)
                {
                    cmdProcess.Kill();
                    status = $"CMD session with process ID {processId} closed successfully.";
                }
                else
                {
                    status = "Failed to close CMD session: Invalid process ID or session already closed.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error closing CMD session: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}