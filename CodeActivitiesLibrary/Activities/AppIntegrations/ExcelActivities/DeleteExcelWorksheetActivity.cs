using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to delete an Excel worksheet
    [DisplayName("Delete Excel Worksheet"), Description("Deletes a specific worksheet from an Excel instance.")]
    public class DeleteExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the worksheet to delete.")]
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
                // Simulate deleting the worksheet (actual implementation would use Excel Interop or similar)
                status = $"Simulated deletion of worksheet '{worksheetName}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

}