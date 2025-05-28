using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to paste a range of cells to the active worksheet of an Excel instance
    [DisplayName("Paste Cells to Excel Worksheet"),
     Description("Pastes a range of cells to the active worksheet of an Excel instance.")]
    public class PasteCellsToExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to paste (e.g., 'A1:B10').")]
        public InArgument<string> RangeToPaste { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var rangeToPaste = RangeToPaste.Get(context);
            var status = "";

            try
            {
                // Simulate pasting cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated pasting of range '{rangeToPaste}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error pasting cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}