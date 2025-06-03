using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{

    [DisplayName("Write to CMD Session")]
    [Description("Executes a command on an open CMD session.")]
    public class WriteToCmdSessionActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("CMD Session")]
        [Description("The process representing the open CMD session.")]
        public InArgument<Process> CmdSession { get; set; }

        [RequiredArgument]
        [DisplayName("Command")]
        [Description("The command to execute in the CMD session.")]
        public InArgument<string> Command { get; set; }


        [DisplayName("Send <Enter> After Command")]
        [Description("Specifies whether to send an Enter key after the command.")]
        public InArgument<bool> SendEnterAfterCommand { get; set; } = new InArgument<bool>(true);

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
                var command = Command.Get(context);
                var sendEnterAfterCommand = SendEnterAfterCommand.Get(context);

                if (cmdSession == null)
                    throw new ArgumentException("CMD session cannot be null.");

                if (string.IsNullOrWhiteSpace(command))
                    throw new ArgumentException("Command cannot be empty.");

                // Ensure the process has started and is running
                if (!cmdSession.HasExited)
                {
                    // Write the command to the standard input stream
                    cmdSession.StandardInput.WriteLine(command);

                    // Optionally send Enter key (\r\n)
                    if (sendEnterAfterCommand)
                    {
                        cmdSession.StandardInput.WriteLine();
                    }

                    Console.WriteLine($"Command executed: {command}");
                }
                else
                {
                    throw new InvalidOperationException("CMD session has already exited.");
                }

                status += $" Successfully wrote command to CMD session.";
            }
            catch (Exception ex)
            {
                status = $"Error writing to CMD session: {ex.Message}";
            }

            // Set the StatusMessage output
            StatusMessage.Set(context, status);

            Console.WriteLine(status);
        }
    }

}
