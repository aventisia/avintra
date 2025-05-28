using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to attach to a running Excel instance
    [DisplayName("Attach to Running Excel"), Description("Attaches to an Excel document that's already open.")]
    public class AttachToRunningExcelActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The process ID of the running Excel instance.")]
        public InArgument<int> ProcessId { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var processId = ProcessId.Get(context);
            var status = "";

            try
            {
                // Simulate attaching to running Excel (actual implementation would use Excel Interop or similar)
                status = $"Simulated attachment to running Excel process ID: {processId}.";
            }
            catch (Exception ex)
            {
                status = $"Error attaching to running Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}