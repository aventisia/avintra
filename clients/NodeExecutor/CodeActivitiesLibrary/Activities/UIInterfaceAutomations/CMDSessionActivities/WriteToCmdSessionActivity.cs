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
        [RequiredArgument]
        [DisplayName("CMD Session")]
        [Description("The process representing the open CMD session.")]
        public InArgument<Process> CmdSession { get; set; }

        [RequiredArgument]
        [DisplayName("Command")]
        [Description("The command to execute in the CMD session.ex:dir >")]
        public InArgument<string> Command { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var process = CmdSession.Get(context);
                var command = Command.Get(context);

                if (process == null || process.HasExited)
                    throw new InvalidOperationException("CMD session is not active.");

                process.StandardInput.WriteLine(command);
                process.StandardInput.Flush();

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Command sent: {command}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to write command: {ex.Message}");
            }
        }
    }
}