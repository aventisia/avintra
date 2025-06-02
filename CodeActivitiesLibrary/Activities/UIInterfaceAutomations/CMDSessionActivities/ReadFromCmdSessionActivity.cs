using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{
    // Activity to read from a CMD session
    [DisplayName("Read from CMD Session"), Description("Reads the output from an open CMD session.")]
    public class ReadFromCmdSessionActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The process ID of the open CMD session.")]
        public InArgument<int> ProcessId { get; set; }

        [Category("Output"), Description("Returns the output read from the CMD session.")]
        public OutArgument<string> Output { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var processId = ProcessId.Get(context);
            var output = "";
            var status = "";

            try
            {
                // Get the CMD process using the provided process ID
                var cmdProcess = Process.GetProcessById(processId);

                // Read the output from the CMD session
                if (cmdProcess != null && !cmdProcess.HasExited)
                {
                    output = cmdProcess.StandardOutput.ReadToEnd();
                    status = "Output read from CMD session successfully.";
                }
                else
                {
                    output = "";
                    status = "Failed to read from CMD session: Invalid process ID or session closed.";
                }
            }
            catch (Exception ex)
            {
                output = "";
                status = $"Error reading from CMD session: {ex.Message}";
            }

            Output.Set(context, output);
            StatusMessage.Set(context, status);
        }
    }
}