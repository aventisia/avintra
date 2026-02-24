using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.CMDSessionActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CmdSessionActivities
{
    [DisplayName("Wait for Text on CMD Session")]
    [Description("Waits for a specific text on a previously opened CMD session.")]
    [ActivityMetaData(nodeImg: "/assets/CMDSession.svg")]
    public class WaitForTextOnCmdSessionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("CMD Session")]
        [Description("The process representing the open CMD session.")]
        public InArgument<Process> CmdSession { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Wait For")]
        [Description("The text or regular expression to wait for in the CMD session output.")]
        public InArgument<string> TextToWaitFor { get; set; }

        [DisplayName("Timeout (ms)")]
        [Description("Maximum time to wait in milliseconds. Default: 5000.")]
        [DefaultValue(5000)]
        public InArgument<int> TimeoutMs { get; set; }

        [DisplayName("Found")]
        [Description("Test the result, wait for text is true or false")]
        public OutArgument<bool> Found { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var process = CmdSession.Get(context);
                var searchText = TextToWaitFor.Get(context);
                var timeout = TimeoutMs.Get(context);

                if (process == null || process.HasExited)
                    throw new InvalidOperationException("CMD session is not active.");
                if (string.IsNullOrEmpty(searchText))
                    throw new ArgumentException("Search text cannot be null or empty.");

                var startTime = DateTime.UtcNow;
                var buffer = CmdSessionStateHelper.GetBuffer(process);

                while ((DateTime.UtcNow - startTime).TotalMilliseconds < timeout)
                {
                    string currentOutput;
                    lock (buffer)
                        currentOutput = buffer.ToString();

                    if (currentOutput.Contains(searchText))
                    {
                        Found.Set(context, true);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Text '{searchText}' found.");
                        return;
                    }

                    Thread.Sleep(100);
                }

                Found.Set(context, false);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Timeout ({timeout}ms): Text not found.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error waiting for text: {ex.Message}");
            }
        }
    }
}