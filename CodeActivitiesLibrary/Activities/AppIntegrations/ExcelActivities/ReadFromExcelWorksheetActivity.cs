using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to read the value of a cell or range of cells from an Excel worksheet
    [DisplayName("Read from Excel Worksheet"),
     Description("Reads the value of a cell or a range of cells from the active worksheet of an Excel instance.")]
    public class ReadFromExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to read (e.g., 'A1:B10').")]
        public InArgument<string> CellRange { get; set; }

        [Category("Output"), Description("Returns the read value(s) of the cells.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var cellRange = CellRange.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate reading from Excel worksheet (actual implementation would use Excel Interop or similar)
                result = "Simulated cell values";
                status = "Cells read successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error reading from Excel worksheet: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}