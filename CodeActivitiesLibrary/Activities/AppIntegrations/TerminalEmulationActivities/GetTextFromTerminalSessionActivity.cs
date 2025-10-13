using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to get text from a terminal session
    [DisplayName("Get Text from Terminal Session"), Description("Get text from a terminal session.")],
    [ActivityMetaData(nodeImg:"/assets/TerminalEmulation.svg")]
    public class GetTextFromTerminalSessionActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The session ID of the terminal session.")]
        public InArgument<int> SessionId { get; set; }

        [Category("Output"), Description("Returns the retrieved text from the terminal session.")]
        public OutArgument<string> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sessionId = SessionId.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate retrieving text from the terminal session (actual implementation would use a terminal library like PoshConsole or similar)
                result = "Simulated terminal text";
                status = "Text retrieved successfully from terminal session.";
                Result.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error retrieving text from terminal session: {ex.Message}";
                Result.Set(context, result);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}