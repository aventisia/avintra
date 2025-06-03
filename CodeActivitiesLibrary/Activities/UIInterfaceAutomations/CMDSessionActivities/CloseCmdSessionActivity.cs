using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{
    [DisplayName("Close CMD Session")]
    [Description("Closes a previously opened CMD session.")]
    public class CloseCmdSessionActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("CMD Session")]
        [Description("The process representing the open CMD session.")]
        public InArgument<Process> CmdSession { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var cmdSession = CmdSession.Get(context);

                if (cmdSession == null)
                    throw new ArgumentException("CMD session cannot be null.");

                // Ensure the process has started and is running
                if (!cmdSession.HasExited)
                {
                    // Close the CMD session
                    cmdSession.Close();
                    Console.WriteLine("CMD session closed successfully.");
                }
                else
                {
                    Console.WriteLine("CMD session has already exited.");
                }

                status += $" Successfully closed CMD session.";
            }
            catch (Exception ex)
            {
                status = $"Error closing CMD session: {ex.Message}";
            }

            // Set the StatusMessage output
            StatusMessage.Set(context, status);

            Console.WriteLine(status);
        }
    }

}