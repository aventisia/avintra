using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to move the cursor on a terminal session
    [DisplayName("Move Cursor on Terminal Session"),
    Description("Move the terminal's cursor to the specified position.")]
    [ActivityMetaData(nodeImg:"/assets/TerminalEmulation.svg")]
    public class MoveCursorOnTerminalSessionActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The session ID of the terminal session.")]
        public InArgument<int> SessionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The X-coordinate of the target position.")]
        public InArgument<int> X { get; set; }

        [RequiredArgument, Category("Input"), Description("The Y-coordinate of the target position.")]
        public InArgument<int> Y { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sessionId = SessionId.Get(context);
            var x = X.Get(context);
            var y = Y.Get(context);
            var status = "";

            try
            {
                // Simulate moving the cursor (actual implementation would use a terminal library like PoshConsole or similar)
                status = $"Simulated cursor movement to position ({x}, {y}) in terminal session with ID: {sessionId}";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error moving cursor in terminal session: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}