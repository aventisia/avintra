using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{


    // Activity to insert a row above a selected row of an Excel instance
    [DisplayName("Insert Row to Excel Worksheet"),
     Description("Inserts a row above a selected row of an Excel instance.")]
    public class InsertRowToExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The row index where the new row should be inserted.")]
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
                // Simulate inserting a row (actual implementation would use Excel Interop or similar)
                status = $"Simulated insertion of row at index {rowIndex} in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error inserting row: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}

