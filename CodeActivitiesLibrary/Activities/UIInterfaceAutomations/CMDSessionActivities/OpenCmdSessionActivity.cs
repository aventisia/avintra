using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{

    // Activity to open a new CMD session
    [DisplayName("Open CMD Session"), Description("Opens a new CMD session and returns the process ID.")]
    public class OpenCmdSessionActivity : Extensions.BaseCodeActivity
    {
        [Category("Output"), Description("Returns the process ID of the opened CMD session.")]
        public OutArgument<int> ProcessId { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var processId = 0;
            var status = "";

            try
            {
                // Start a new CMD process
                var cmdProcess = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        UseShellExecute = false,
                        RedirectStandardInput = true,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };

                cmdProcess.Start();
                processId = cmdProcess.Id;
                status = $"CMD session opened successfully. Process ID: {processId}";
            }
            catch (Exception ex)
            {
                processId = 0;
                status = $"Error opening CMD session: {ex.Message}";
            }

            ProcessId.Set(context, processId);
            StatusMessage.Set(context, status);
        }
    }
}
