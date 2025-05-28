using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to write a value into a cell or range of cells in an Excel worksheet
    [DisplayName("Write to Excel Worksheet"),
     Description("Writes a value into a cell or a range of cells of an Excel instance.")]
    public class WriteToExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to write to (e.g., 'A1:B10').")]
        public InArgument<string> CellRange { get; set; }

        [RequiredArgument, Category("Input"), Description("The value to write.")]
        public InArgument<string> ValueToWrite { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var cellRange = CellRange.Get(context);
            var valueToWrite = ValueToWrite.Get(context);
            var status = "";

            try
            {
                // Simulate writing to Excel worksheet (actual implementation would use Excel Interop or similar)
                status = $"Simulated writing value '{valueToWrite}' to range '{cellRange}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error writing to Excel worksheet: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}