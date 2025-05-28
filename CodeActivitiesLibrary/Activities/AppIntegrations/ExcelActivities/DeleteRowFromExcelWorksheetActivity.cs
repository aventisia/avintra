using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{


    // Activity to delete a selected row from an Excel instance
    [DisplayName("Delete Row from Excel Worksheet"), Description("Deletes a selected row from an Excel instance.")]
    public class DeleteRowFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The row index to delete.")]
        public InArgument<int> RowIndex { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var rowIndex = RowIndex.Get(context);
            var status = "";

            try
            {
                // Simulate deleting a row (actual implementation would use Excel Interop or similar)
                status = $"Simulated deletion of row at index {rowIndex} in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting row: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}