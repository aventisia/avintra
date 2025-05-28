using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    // Activity to close a Word instance
    [DisplayName("Close Word"), Description("Close a Word instance.")]
    public class CloseWordActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The process ID of the Word instance to close.")]
        public InArgument<int> ProcessId { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var processId = ProcessId.Get(context);
            var status = "";

            try
            {
                // Simulate closing the Word instance (actual implementation would use Microsoft.Office.Interop.Word)
                status = $"Simulated closing Word instance with process ID: {processId}";
            }
            catch (Exception ex)
            {
                status = $"Error closing Word instance: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

}