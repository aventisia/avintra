using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to clear a range of cells or a named cell in an Excel worksheet
    [DisplayName("Clear Cells in Excel Worksheet"),
     Description("Clears a range of cells or a named cell in the active worksheet of an Excel instance.")]
    public class ClearCellsInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"),
         Description("The range of cells to clear (e.g., 'A1:B10') or the name of the cell to clear.")]
        public InArgument<string> CellRangeOrName { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var cellRangeOrName = CellRangeOrName.Get(context);
            var status = "";

            try
            {
                // Simulate clearing cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated clearing of range or named cell '{cellRangeOrName}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error clearing cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

}
