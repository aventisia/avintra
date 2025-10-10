using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to close an open terminal session
    [DisplayName("Close Terminal Session"), Description("Close an open terminal session.")],
    [ActivityMetaData(nodeImg:"/assets/TerminalEmulation.svg")]
    public class CloseTerminalSessionActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The session ID of the terminal session to close.")]
        public InArgument<int> SessionId { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sessionId = SessionId.Get(context);
            var status = "";

            try
            {
                // Simulate closing a terminal session (actual implementation would use a terminal library like PoshConsole or similar)
                status = $"Simulated closure of terminal session with ID: {sessionId}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error closing terminal session: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }


}