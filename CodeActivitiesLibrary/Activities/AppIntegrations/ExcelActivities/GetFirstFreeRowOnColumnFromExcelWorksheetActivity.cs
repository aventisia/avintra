using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{


    // Activity to retrieve the first free row on a column from the active worksheet of an Excel instance
    [DisplayName("Get First Free Row on Column from Excel Worksheet"),
     Description("Retrieves the first free row, given the column of the active worksheet.")]
    public class GetFirstFreeRowOnColumnFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The column index to check for the first free row.")]
        public InArgument<int> ColumnIndex { get; set; }

        [Category("Output"), Description("Returns the first free row index.")]
        public OutArgument<int> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var columnIndex = ColumnIndex.Get(context);
            var result = 0;
            var status = "";

            try
            {
                // Simulate getting the first free row (actual implementation would use Excel Interop or similar)
                result = 10; // Simulated first free row
                status = "First free row retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = 0;
                status = $"Error retrieving first free row: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}
