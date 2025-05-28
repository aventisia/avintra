using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to append a range of cells to the active worksheet of an Excel instance
    [DisplayName("Append Cells in Excel Worksheet"),
     Description("Appends a range of cells to the active worksheet of an Excel instance.")]
    public class AppendCellsInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to append (e.g., 'A1:B10').")]
        public InArgument<string> RangeToAppend { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var rangeToAppend = RangeToAppend.Get(context);
            var status = "";

            try
            {
                // Simulate appending cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated appending of range '{rangeToAppend}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error appending cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}