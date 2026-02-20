using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CmdSessionActivities
{
    [DisplayName("Close CMD Session")]
    [Description("Closes a previously opened CMD session.")]
    [ActivityMetaData(nodeImg: "/assets/CMDSession.svg")]
    public class CloseCmdSessionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("CMD Session")]
        [Description("The process representing the open CMD session.")]
        public InArgument<Process> CmdSession { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var process = CmdSession.Get(context);
                if (process == null)
                {
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "CMD session was already null.");
                    return;
                }

                if (!process.HasExited)
                {
                    process.StandardInput.WriteLine("exit");
                    process.StandardInput.Flush();
                    process.WaitForExit(3000);
                    if (!process.HasExited)
                        process.Kill();
                }

                process.Dispose();
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "CMD session closed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error closing CMD session: {ex.Message}");
            }
        }
    }
}