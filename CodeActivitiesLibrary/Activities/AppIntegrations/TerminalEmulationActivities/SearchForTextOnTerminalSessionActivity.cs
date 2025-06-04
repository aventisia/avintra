using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.TerminalEmulationActivities
{
    // Activity to search for text on a terminal session
    [DisplayName("Search for Text on Terminal Session"),
     Description("Search for all occurrences of a specific text on a terminal session.")]
    public class SearchForTextOnTerminalSessionActivity : BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The session ID of the terminal session.")]
        public InArgument<int> SessionId { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to search for.")]
        public InArgument<string> TextToSearchFor { get; set; }

        [Category("Output"), Description("Returns the list of occurrences of the searched text.")]
        public OutArgument<IEnumerable<string>> Result { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var sessionId = SessionId.Get(context);
            var textToSearchFor = TextToSearchFor.Get(context);
            IEnumerable<string> result = null;
            var status = "";

            try
            {
                // Simulate searching for text (actual implementation would use a terminal library like PoshConsole or similar)
                result = new List<string> { "Simulated occurrence 1", "Simulated occurrence 2" }; // Simulated results
                status = $"Simulated search for text '{textToSearchFor}' in terminal session with ID: {sessionId}";
            }
            catch (Exception ex)
            {
                result = null;
                status = $"Error searching for text in terminal session: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}