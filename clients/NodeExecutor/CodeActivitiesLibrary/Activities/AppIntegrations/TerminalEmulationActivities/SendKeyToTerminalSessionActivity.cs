using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to send a control key to a terminal session
    [DisplayName("Send Key to Terminal Session")]
    [Description("Send a control key to a terminal session.")]
    [ActivityMetaData(nodeImg:"/assets/TerminalEmulation.svg")]
    public class SendKeyToTerminalSessionActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The session ID of the terminal session.")]
        public InArgument<int> SessionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The key to send (e.g., 'Enter', 'Tab').")]
        public InArgument<string> Key { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sessionId = SessionId.Get(context);
            var key = Key.Get(context);
            var status = "";

            try
            {
                // Simulate sending a key to the terminal session (actual implementation would use a terminal library like PoshConsole or similar)
                status = $"Simulated sending key '{key}' to terminal session with ID: {sessionId}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error sending key to terminal session: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }

}