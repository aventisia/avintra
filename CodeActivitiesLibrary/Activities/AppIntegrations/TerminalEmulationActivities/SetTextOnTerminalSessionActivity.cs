using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to set text on a terminal session
    [DisplayName("Set Text on Terminal Session")],
    [Description("Set text on a terminal session.")],
    [ActivityMetaData(nodeImg:"/assets/TerminalEmulation.svg")]
    public class SetTextOnTerminalSessionActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The session ID of the terminal session.")]
        public InArgument<int> SessionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to set on the terminal session.")]
        public InArgument<string> Text { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sessionId = SessionId.Get(context);
            var text = Text.Get(context);
            var status = "";

            try
            {
                // Simulate setting text on the terminal session (actual implementation would use a terminal library like PoshConsole or similar)
                status = $"Simulated setting text '{text}' on terminal session with ID: {sessionId}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error setting text on terminal session: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}