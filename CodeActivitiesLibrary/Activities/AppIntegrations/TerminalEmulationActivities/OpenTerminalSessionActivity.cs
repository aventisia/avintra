using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to open a new terminal session
    [DisplayName("Open Terminal Session"), Description("Open a new terminal session.")]
    public class OpenTerminalSessionActivity : CodeActivity
    {
        [Category("Output"), Description("Returns the session ID of the opened terminal session.")]
        public OutArgument<int> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var result = 0;
            var status = "";

            try
            {
                // Simulate opening a terminal session (actual implementation would use a terminal library like PoshConsole or similar)
                result = 12345; // Simulated session ID
                status = "Terminal session opened successfully.";
            }
            catch (Exception ex)
            {
                result = 0;
                status = $"Error opening terminal session: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}



