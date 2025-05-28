using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to retrieve the range of a table in the active worksheet of an Excel instance
    [DisplayName("Get Table Range from Excel Worksheet"),
     Description("Retrieves the range of a table in the active worksheet of an Excel instance.")]
    public class GetTableRangeFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the table to retrieve the range for.")]
        public InArgument<string> TableName { get; set; }

        [Category("Output"), Description("Returns the range of the specified table.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var tableName = TableName.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate getting the table range (actual implementation would use Excel Interop or similar)
                result = "A1:B10"; // Simulated table range
                status = "Table range retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error retrieving table range: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}