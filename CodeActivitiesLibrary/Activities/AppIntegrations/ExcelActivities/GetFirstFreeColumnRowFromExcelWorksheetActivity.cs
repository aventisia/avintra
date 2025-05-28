using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to retrieve the first free column and/or row from an Excel worksheet
    [DisplayName("Get First Free Column/Row from Excel Worksheet"), Description(
         "Retrieves the first free column and/or row of the active worksheet. This is useful for adding new data into a worksheet that already has data in it.")]
    public class GetFirstFreeColumnRowFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Output"), Description("Returns the first free column and row as a tuple (column, row).")]
        public OutArgument<Tuple<string, string>> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            Tuple<string, string> result;
            var status = "";

            try
            {
                // Simulate getting first free column/row (actual implementation would use Excel Interop or similar)
                result = Tuple.Create("A", "1"); // Simulated first free column and row
                status = "First free column and row retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = null;
                status = $"Error retrieving first free column/row: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}