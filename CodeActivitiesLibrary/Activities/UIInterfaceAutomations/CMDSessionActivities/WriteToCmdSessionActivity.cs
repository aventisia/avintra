using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CmdSessionActivities
{
    [DisplayName("Write to CMD Session")]
    [Description("Executes a command on an open CMD session.")]
    [ActivityMetaData(nodeImg: "/assets/CMDSession.svg")]
    public class WriteToCmdSessionActivity : BaseCodeActivity
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
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var cmdSession = CmdSession.Get(context);
                var command = Command.Get(context);
                var sendEnter = SendEnterAfterCommand.Get(context);

                if (cmdSession == null)
                    throw new ArgumentException("CMD session cannot be null.");

                if (string.IsNullOrWhiteSpace(command))
                    throw new ArgumentException("Command cannot be empty.");

                // Ensure the process has started and is running
                if (!cmdSession.HasExited)
                {
                    // Ensure we can write to standard input
                    if (!cmdSession.StartInfo.RedirectStandardInput)
                        throw new InvalidOperationException(
                            "CMD session was not started with RedirectStandardInput = true.");

                    cmdSession.StandardInput.WriteLine(command);
                    cmdSession.StandardInput.Flush();

                    if (sendEnter)
                    {
                        cmdSession.StandardInput.WriteLine();
                        cmdSession.StandardInput.Flush();
                    }

                    status += $": '{command}'";
                }
                else
                {
                    throw new InvalidOperationException("CMD session has already exited.");
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error writing to CMD session: {ex.Message}");
            }
        }
    }
}