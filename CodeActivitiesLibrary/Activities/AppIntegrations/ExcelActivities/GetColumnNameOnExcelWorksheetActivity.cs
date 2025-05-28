using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to get the name of a column in an Excel worksheet
    [DisplayName("Get Column Name on Excel Worksheet"), Description("Gets the name of the column.")]
    public class GetColumnNameOnExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The column index (1-based).")]
        public InArgument<int> ColumnIndex { get; set; }

        [Category("Output"), Description("Returns the name of the column (e.g., 'A', 'B').")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var columnIndex = ColumnIndex.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate getting column name (actual implementation would use Excel Interop or similar)
                result = "A"; // Simulated column name
                status = "Column name retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error getting column name: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}