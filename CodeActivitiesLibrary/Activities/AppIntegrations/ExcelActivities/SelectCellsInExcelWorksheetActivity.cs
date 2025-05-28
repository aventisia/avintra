using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{

    // Activity to select cells in an Excel worksheet
    [DisplayName("Select Cells in Excel Worksheet"),
     Description("Selects a range of cells in the active worksheet of an Excel instance.")]
    public class SelectCellsInExcelWorksheetActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [RequiredArgument, Category("Input"), Description("The range of cells to select (e.g., 'A1:B10').")]
        public InArgument<string> Range { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var excelInstanceId = ExcelInstanceId.Get(context);
            var range = Range.Get(context);
            var status = "";

            try
            {
                // Simulate selecting cells (actual implementation would use Excel Interop or similar)
                status = $"Simulated selection of range '{range}' in Excel instance '{excelInstanceId}'.";
            }
            catch (Exception ex)
            {
                status = $"Error selecting cells: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}