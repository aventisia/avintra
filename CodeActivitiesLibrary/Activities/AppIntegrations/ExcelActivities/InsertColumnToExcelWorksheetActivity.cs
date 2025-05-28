using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{


    // Activity to insert a column to the left of a selected column of an Excel instance
    [DisplayName("Insert Column to Excel Worksheet"),
     Description("Inserts a column to the left of a selected column of an Excel instance.")]
    public class InsertColumnToExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The column index where the new column should be inserted.")]
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
                // Simulate inserting a column (actual implementation would use Excel Interop or similar)
                status = $"Simulated insertion of column at index {columnIndex} in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error inserting column: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}