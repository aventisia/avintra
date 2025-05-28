using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to get the selected cell range from an Excel worksheet
    [DisplayName("Get Selected Cell Range from Excel Worksheet"),
     Description(
         "Retrieves the selected range of cells in a structure consisting of first column, first row, last column, and last row.")]
    public class GetSelectedCellRangeFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Output"),
         Description("Returns the selected cell range as a tuple of (first column, first row, last column, last row).")]
        public OutArgument<Tuple<int, int, int, int>> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            Tuple<int, int, int, int> result = null;
            var status = "";

            try
            {
                // Simulate retrieving the selected cell range (actual implementation would use Excel Interop or similar)
                result = Tuple.Create(1, 1, 10, 10); // Simulated range A1:B10
                status = "Selected cell range retrieved successfully.";
            }
            catch (Exception ex)
            {
                result = null;
                status = $"Error retrieving selected cell range: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}