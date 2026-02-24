using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.CMDSessionActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CmdSessionActivities
{
    [DisplayName("Read from CMD Session")]
    [Description("Reads the output of a CMD session.")]
    [ActivityMetaData(nodeImg: "/assets/CMDSession.svg")]
    public class ReadFromCmdSessionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("CMD Session")]
        [Description("The process representing the CMD session.")]
        public InArgument<Process> CmdSession { get; set; }

        [DisplayName("CmdOutput")]
        [Description("The CMD session's standard output.")]
        public OutArgument<string> CmdOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var process = CmdSession.Get(context);
                if (process == null || process.HasExited)
                    throw new InvalidOperationException("CMD session is not active.");

                var buffer = CmdSessionStateHelper.GetBuffer(process);
                string output;
                lock (buffer)
                {
                    output = buffer.ToString();
                    buffer.Clear(); 
                }

                CmdOutput.Set(context, output);
               
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully read output from CMD session.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reading CMD session: {ex.Message}");
            }
        }
    }

}