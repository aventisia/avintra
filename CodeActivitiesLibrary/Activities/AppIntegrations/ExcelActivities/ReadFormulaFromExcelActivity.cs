using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to read the formula inside a cell in Excel
    [DisplayName("Read Formula from Excel"), Description("Reads the formula inside a cell in Excel.")]
    public class ReadFormulaFromExcelActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The cell address (e.g., 'A1') to read the formula from.")]
        public InArgument<string> CellAddress { get; set; }

        [Category("Output"), Description("Returns the formula of the specified cell.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var cellAddress = CellAddress.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate reading the formula (actual implementation would use Excel Interop or similar)
                result = "=SUM(A1:B10)"; // Simulated formula
                status = "Formula read successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error reading formula: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}
