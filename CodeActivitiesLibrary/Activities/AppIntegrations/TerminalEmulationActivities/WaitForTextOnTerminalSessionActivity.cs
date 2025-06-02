using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to wait for specific text on a terminal session
    [DisplayName("Wait for Text on Terminal Session"),
     Description("Wait for a specific text to appear on a terminal session.")]
    public class WaitForTextOnTerminalSessionActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The session ID of the terminal session.")]
        public InArgument<int> SessionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to wait for.")]
        public InArgument<string> TextToWaitFor { get; set; }

        [Category("Output"), Description("Returns true if the specified text was found, otherwise false.")]
        public OutArgument<bool> Result { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var sessionId = SessionId.Get(context);
            var textToWaitFor = TextToWaitFor.Get(context);
            var result = false;
            var status = "";

            try
            {
                // Simulate waiting for text (actual implementation would use a terminal library like PoshConsole or similar)
                result = true; // Simulated success
                status = $"Simulated finding text '{textToWaitFor}' in terminal session with ID: {sessionId}";
            }
            catch (Exception ex)
            {
                result = false;
                status = $"Error waiting for text in terminal session: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}