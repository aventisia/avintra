using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to activate a specific worksheet in an Excel instance
    [DisplayName("Set Active Excel Worksheet"), Description("Activates a specific worksheet of an Excel instance.")]
    public class SetActiveExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the worksheet to activate.")]
        public InArgument<string> WorksheetName { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var worksheetName = WorksheetName.Get(context);
            var status = "";

            try
            {
                // Simulate setting active worksheet (actual implementation would use Excel Interop or similar)
                status = $"Simulated activation of worksheet '{worksheetName}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error setting active worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}
