using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to close an Excel instance
    [DisplayName("Close Excel"), Description("Closes an Excel instance.")]
    public class CloseExcelActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var status = "";

            try
            {
                // Simulate closing Excel (actual implementation would use Excel Interop or similar)
                status = $"Simulated closure of Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error closing Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}