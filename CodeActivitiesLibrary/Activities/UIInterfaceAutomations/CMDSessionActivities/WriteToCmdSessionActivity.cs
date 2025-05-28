using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{

    // Activity to write to a CMD session
    [DisplayName("Write to CMD Session"), Description("Writes a command to an open CMD session.")]
    public class WriteToCmdSessionActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The process ID of the open CMD session.")]
        public InArgument<int> ProcessId { get; set; }

        [RequiredArgument, Category("Input"), Description("The command to be executed in the CMD session.")]
        public InArgument<string> Command { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var processId = ProcessId.Get(context);
            var command = Command.Get(context);
            var status = "";

            try
            {
                // Get the CMD process using the provided process ID
                var cmdProcess = Process.GetProcessById(processId);

                // Write the command to the CMD session
                if (cmdProcess != null && !cmdProcess.HasExited)
                {
                    cmdProcess.StandardInput.WriteLine(command);
                    cmdProcess.StandardInput.Flush();
                    status = $"Command '{command}' written to CMD session successfully.";
                }
                else
                {
                    status = "Failed to write to CMD session: Invalid process ID or session closed.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error writing to CMD session: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}
