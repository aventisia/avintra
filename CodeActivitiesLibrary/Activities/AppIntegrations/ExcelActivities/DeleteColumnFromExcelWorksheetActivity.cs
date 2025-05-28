using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to delete a selected column from an Excel instance
    [DisplayName("Delete Column from Excel Worksheet"),
     Description("Deletes a selected column from an Excel instance.")]
    public class DeleteColumnFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The column index to delete.")]
        public InArgument<int> ColumnIndex { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var columnIndex = ColumnIndex.Get(context);
            var status = "";

            try
            {
                // Simulate deleting a column (actual implementation would use Excel Interop or similar)
                status = $"Simulated deletion of column at index {columnIndex} in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error deleting column: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}